import { app } from "./src/app.js";
import { prisma } from "./src/config/db.config.js";
import { cfg } from "./src/config/env.config.js";
import { logger } from "./src/config/logger.config.js";

const PORT = cfg.PORT;

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info("Database connection success");

    app.listen(PORT, () => {
      logger.info(`Server running at PORT ${PORT}`);
    });
  } catch (error) {
    logger.error({ error: error }, "Database connection failed");
    process.exit(1);
  }
};

startServer();
