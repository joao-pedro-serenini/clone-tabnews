import migrationRunner from "node-pg-migrate";
import { join, resolve } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const allowerdMethods = ["GET", "POST"];
  if (!allowerdMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method ${request.method} not allowed`,
    });
  }

  let dbClient;

  try{
    dbClient = await database.getNewClient();
    const migrationsDir =
      process.env.NODE_ENV === "production"
        ? resolve("infra", "migrations")
        : join("infra", "migrations");

    const defaultMigrationOptions = {
      dbClient: dbClient,
      dryRun: true,
      dir: migrationsDir,
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }

      return response.status(200).json(migratedMigrations);
    }

  } catch(error){
    console.error(error);
    return response.status(500).json({
      error: "Internal server error",
    });
  } finally {
    await dbClient.end();
  }
}