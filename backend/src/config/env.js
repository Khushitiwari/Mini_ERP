import 'dotenv/config';

const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default env;
