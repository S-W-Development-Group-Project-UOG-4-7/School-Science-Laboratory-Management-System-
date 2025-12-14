import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  // Use adapter instead of provider
  datasource: {
    // This is the Postgres connection URL
    url: env("DATABASE_URL"),
  },
});
