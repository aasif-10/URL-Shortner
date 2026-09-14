import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().max(254).email(),
  password: z.string().min(6).max(100),
}).strict();

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().max(254).email(),
  password: z.string().min(6).max(100),
}).strict();

export { loginSchema, registerSchema };
