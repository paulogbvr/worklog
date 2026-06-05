import { ProjectConfigurationStatus, SyncProvider } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getWakaTimeProjects,
  getWakaTimeSummaries,
  WakaTimeApiError,
  type WakaTimeProject
} from "@/server/wakatime/client";

const INITIAL_SYNC_DAYS = 30;
const OVERLAP_DAYS = 2;
const WAKATIME_TIMEZONE = "America/Sao_Paulo";

export type WakaTimeSyncResult = {
  syncLogId: string;
  start: string;
  end: string;
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
  if (error instanceof WakaTimeApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
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

async function upsertProjectFromWakaTime(project: WakaTimeProject) {
  const existingProject = await prisma.project.findFirst({
    where: {
      OR: [{ wakatimeProjectId: project.id }, { wakatimeProjectName: project.name }]
    }
  });

  if (existingProject) {
    const updatedProject = await prisma.project.update({
      data: {
        active: true,
        wakatimeProjectId: project.id,
        wakatimeProjectName: project.name
      },
      where: {
        id: existingProject.id
      }
    });

    return {
      created: false,
      project: updatedProject
    };
  }

  const createdProject = await prisma.project.create({
    data: {
      active: true,
      configurationStatus: ProjectConfigurationStatus.PENDING,
      name: project.name,
      wakatimeProjectId: project.id,
      wakatimeProjectName: project.name
    }
  });

  return {
    created: true,
    project: createdProject
  };
}

async function getOrCreateProjectByWakaTimeName(name: string) {
  const existingProject = await prisma.project.findUnique({
    where: {
      wakatimeProjectName: name
    }
  });

  if (existingProject) {
    return {
      created: false,
      project: existingProject
    };
  }

  const createdProject = await prisma.project.create({
    data: {
      active: true,
      configurationStatus: ProjectConfigurationStatus.PENDING,
      name,
      wakatimeProjectName: name
    }
  });

  return {
    created: true,
    project: createdProject
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
    const projects = await getWakaTimeProjects();
    const projectByWakaTimeName = new Map<string, { id: string }>();
    const touchedProjectIds = new Set<string>();
    let projectsCreated = 0;
    let projectsUpdated = 0;

    for (const wakatimeProject of projects) {
      const result = await upsertProjectFromWakaTime(wakatimeProject);

      if (result.created) {
        projectsCreated += 1;
      } else {
        projectsUpdated += 1;
      }

      projectByWakaTimeName.set(wakatimeProject.name, { id: result.project.id });
      touchedProjectIds.add(result.project.id);
    }

    const summaries = await getWakaTimeSummaries({
      end: syncWindow.end,
      start: syncWindow.start,
      timezone: WAKATIME_TIMEZONE
    });

    let daysSynced = 0;
    let totalSeconds = 0;

    for (const day of summaries) {
      for (const summaryProject of day.projects) {
        if (summaryProject.totalSeconds <= 0) {
          continue;
        }

        let project = projectByWakaTimeName.get(summaryProject.name);

        if (!project) {
          const result = await getOrCreateProjectByWakaTimeName(summaryProject.name);

          if (result.created) {
            projectsCreated += 1;
          }

          project = { id: result.project.id };
          projectByWakaTimeName.set(summaryProject.name, project);
        }

        await prisma.wakaTimeProjectDay.upsert({
          create: {
            date: toDatabaseDate(day.date),
            projectId: project.id,
            totalSeconds: summaryProject.totalSeconds
          },
          update: {
            syncedAt: new Date(),
            totalSeconds: summaryProject.totalSeconds
          },
          where: {
            projectId_date: {
              date: toDatabaseDate(day.date),
              projectId: project.id
            }
          }
        });

        daysSynced += 1;
        totalSeconds += summaryProject.totalSeconds;
        touchedProjectIds.add(project.id);
      }
    }

    const finishedAt = new Date();

    if (touchedProjectIds.size > 0) {
      await prisma.project.updateMany({
        data: {
          lastSyncAt: finishedAt
        },
        where: {
          id: {
            in: [...touchedProjectIds]
          }
        }
      });
    }

    await prisma.syncLog.update({
      data: {
        finishedAt,
        message: `${projects.length} projetos encontrados; ${daysSynced} registros diarios sincronizados.`,
        success: true
      },
      where: {
        id: syncLog.id
      }
    });

    return {
      daysSynced,
      end: syncWindow.end,
      projectsCreated,
      projectsFound: projects.length,
      projectsUpdated,
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
