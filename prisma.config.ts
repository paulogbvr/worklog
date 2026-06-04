import { existsSync, readFileSync } from "node:fs";
import { defineConfig, env } from "prisma/config";

const loadedEnvKeys = new Set<string>();

function loadEnvFile(path: string, overrideLoadedKeys = false) {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;

    if (
      process.env[key] !== undefined &&
      !(overrideLoadedKeys && loadedEnvKeys.has(key))
    ) {
      continue;
    }

    let value = rawValue.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
    loadedEnvKeys.add(key);
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local", true);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: process.env.DIRECT_URL ?? env("DATABASE_URL")
  }
});
