import { getSession } from './session';

/**
 * Unified session validation middleware
 * Works with both NextAuth (local) and Cognito (production)
 */
const validateMiddleware = () => {
  return async (req, res, next) => {
    const session = await getSession(req, res);
    const errors = [];

    if (!session) {
      errors.push({ param: 'session', msg: 'Unauthorized access' });
    } else {
      return next(session);
    }

    const errorObject = {};
    errors.forEach((error) => (errorObject[error.param] = error));
    res.status(401).json({ errors: errorObject });
  };
};

export default validateMiddleware;
