import { ProjectConfigurationStatus, SyncProvider } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getWakaTimeProjects,
  getWakaTimeSummaries,
  WakaTimeApiError
} from "@/server/wakatime/client";

const INITIAL_SYNC_DAYS = 30;
const OVERLAP_DAYS = 2;
const WAKATIME_TIMEZONE = "America/Sao_Paulo";

export type WakaTimeSyncResult = {
  syncLogId: string;
  start: string;
  end: string;
  projectsArchived: number;
  projectsFound: number;
  projectsCreated: number;
  projectsUpdated: number;
  daysSynced: number;
  totalSeconds: number;
};

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatDateInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    timeZone: timezone,
    year: "numeric"
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return date.toISOString().slice(0, 10);
  }

  return `${year}-${month}-${day}`;
}

function toDatabaseDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function getErrorMessage(error: unknown) {
  if (error instanceof WakaTimeApiError || error instanceof Error) {
    return error.message.slice(0, 500);
  }

  return "Erro inesperado ao sincronizar WakaTime.";
}

async function getSyncWindow() {
  const latestSuccessfulSync = await prisma.syncLog.findFirst({
    orderBy: {
      finishedAt: "desc"
    },
    where: {
      finishedAt: {
        not: null
      },
      provider: SyncProvider.WAKATIME,
      success: true
    }
  });

  const today = new Date();
  const startDate = latestSuccessfulSync?.finishedAt
    ? addDays(latestSuccessfulSync.finishedAt, -OVERLAP_DAYS)
    : addDays(today, -(INITIAL_SYNC_DAYS - 1));

  return {
    end: formatDateInTimezone(today, WAKATIME_TIMEZONE),
    start: formatDateInTimezone(startDate, WAKATIME_TIMEZONE)
  };
}

export async function syncWakaTime() {
  const syncWindow = await getSyncWindow();
  const syncLog = await prisma.syncLog.create({
    data: {
      provider: SyncProvider.WAKATIME
    }
  });

  try {
    const [wakatimeProjects, summaries] = await Promise.all([
      getWakaTimeProjects(),
      getWakaTimeSummaries({
        end: syncWindow.end,
        start: syncWindow.start,
        timezone: WAKATIME_TIMEZONE
      })
    ]);

    const apiProjectByName = new Map(
      wakatimeProjects.map((project) => [project.name, project] as const)
    );
    const apiProjectNames = wakatimeProjects.map((project) => project.name);
    const apiProjectIds = wakatimeProjects.map((project) => project.id);

    const existingProjects = await prisma.project.findMany({
      where: {
        OR: [
          {
            wakatimeProjectName: {
              not: null
            }
          },
          {
            wakatimeProjectId: {
              not: null
            }
          }
        ]
      }
    });

    const existingNames = new Set(existingProjects.map((project) => project.wakatimeProjectName));
    const existingIds = new Set(existingProjects.map((project) => project.wakatimeProjectId));
    const missingProjects = apiProjectNames.filter((name) => {
      const apiProject = apiProjectByName.get(name);
      return !existingNames.has(name) && Boolean(apiProject && !existingIds.has(apiProject.id));
    });

    const createResult =
      missingProjects.length > 0
        ? await prisma.project.createMany({
            data: missingProjects.map((name) => ({
              active: true,
              configurationStatus: ProjectConfigurationStatus.PENDING,
              name,
              wakatimeProjectId: apiProjectByName.get(name)?.id,
              wakatimeProjectName: name
            })),
            skipDuplicates: true
          })
        : { count: 0 };

    const activeProjectUpdates = existingProjects.flatMap((project) => {
      const apiProject =
        (project.wakatimeProjectName && apiProjectByName.get(project.wakatimeProjectName)) ||
        wakatimeProjects.find((item) => item.id === project.wakatimeProjectId);

      if (!apiProject) {
        return [];
      }

      return [
        prisma.project.update({
          data: {
            active: true,
            wakatimeProjectId: apiProject.id,
            wakatimeProjectName: apiProject.name
          },
          where: {
            id: project.id
          }
        })
      ];
    });
    const archivedProjectIds = existingProjects
      .filter(
        (project) =>
          project.active &&
          !apiProjectNames.includes(project.wakatimeProjectName ?? "") &&
          !apiProjectIds.includes(project.wakatimeProjectId ?? "")
      )
      .map((project) => project.id);
    const statusUpdates = [
      ...activeProjectUpdates,
      ...(archivedProjectIds.length > 0
        ? [
            prisma.project.updateMany({
              data: {
                active: false
              },
              where: {
                id: {
                  in: archivedProjectIds
                }
              }
            })
          ]
        : [])
    ];

    if (statusUpdates.length > 0) {
      await prisma.$transaction(statusUpdates);
    }

    const databaseProjects = await prisma.project.findMany({
      select: {
        id: true,
        wakatimeProjectName: true
      },
      where: {
        active: true,
        wakatimeProjectName: {
          in: apiProjectNames
        }
      }
    });
    const projectIdByName = new Map(
      databaseProjects.flatMap((project) =>
        project.wakatimeProjectName
          ? ([[project.wakatimeProjectName, project.id]] as Array<[string, string]>)
          : []
      )
    );

    const dailyRows = summaries.flatMap((day) =>
      day.projects.flatMap((summaryProject) => {
        const projectId = projectIdByName.get(summaryProject.name);

        if (!projectId || summaryProject.totalSeconds <= 0) {
          return [];
        }

        return [
          {
            date: toDatabaseDate(day.date),
            projectId,
            syncedAt: new Date(),
            totalSeconds: summaryProject.totalSeconds
          }
        ];
      })
    );
    const touchedProjectIds = [...new Set(databaseProjects.map((project) => project.id))];
    const finishedAt = new Date();
    const totalSeconds = dailyRows.reduce((total, row) => total + row.totalSeconds, 0);

    const persistenceOperations = [
      prisma.wakaTimeProjectDay.deleteMany({
        where: {
          date: {
            gte: toDatabaseDate(syncWindow.start),
            lte: toDatabaseDate(syncWindow.end)
          },
          projectId: {
            in: touchedProjectIds
          }
        }
      }),
      ...(dailyRows.length > 0
        ? [
            prisma.wakaTimeProjectDay.createMany({
              data: dailyRows,
              skipDuplicates: true
            })
          ]
        : []),
      prisma.project.updateMany({
        data: {
          lastSyncAt: finishedAt
        },
        where: {
          id: {
            in: touchedProjectIds
          }
        }
      }),
      prisma.syncLog.update({
        data: {
          finishedAt,
          message: `${wakatimeProjects.length} projetos ativos; ${archivedProjectIds.length} arquivados; ${dailyRows.length} registros diarios sincronizados.`,
          success: true
        },
        where: {
          id: syncLog.id
        }
      })
    ];

    await prisma.$transaction(persistenceOperations);

    return {
      daysSynced: dailyRows.length,
      end: syncWindow.end,
      projectsArchived: archivedProjectIds.length,
      projectsCreated: createResult.count,
      projectsFound: wakatimeProjects.length,
      projectsUpdated: activeProjectUpdates.length,
      start: syncWindow.start,
      syncLogId: syncLog.id,
      totalSeconds
    } satisfies WakaTimeSyncResult;
  } catch (error) {
    await prisma.syncLog.update({
      data: {
        finishedAt: new Date(),
        message: getErrorMessage(error),
        success: false
      },
      where: {
        id: syncLog.id
      }
    });

    throw error;
  }
}
