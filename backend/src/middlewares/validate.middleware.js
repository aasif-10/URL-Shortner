import { AppError } from "../errors/app.error.js";

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(result.error.message, 400);
    }

    req.body = result.data;
    next();
  };
};

export { validate };
