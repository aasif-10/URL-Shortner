import { config } from "dotenv";

const environment = process.env.NODE_ENV || "developement";
config({
  path: `.env.${environment}`,
});

if (!process.env.PORT) {
  throw new Error("PORT is required");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

if (!process.env.BASE_URL) {
  throw new Error("BASE_URL is required");
}

const cfg = {
  NODE_ENV: environment,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  BASE_URL: process.env.BASE_URL,
};

export { cfg };
