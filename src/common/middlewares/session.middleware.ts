import session from 'express-session';
import { envConfig } from 'src/config/env-config';

export const sessionMiddleware = session({
  secret: envConfig.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: envConfig.NODE_ENV === 'production',
  },
});
