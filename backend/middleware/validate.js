import { z } from 'zod';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const validatedData = schema.parse(dataToValidate);
      req[source] = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request input parameters.',
            details: error.issues.map(issue => ({
              path: issue.path.join('.'),
              message: issue.message
            }))
          }
        });
      }
      next(error);
    }
  };
}
