import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client/client.js";
import { cfg } from "./env.js";

const connectionString = `${cfg.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString, max: 20 });
const prisma = new PrismaClient({ adapter });

export { prisma };
