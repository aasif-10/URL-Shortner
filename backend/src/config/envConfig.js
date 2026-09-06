import { config } from "dotenv";

config();

if (!process.env.PORT) {
  throw new Error("PORT is required");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const cfg = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
};

export { cfg };
