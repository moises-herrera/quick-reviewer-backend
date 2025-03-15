import { PrismaClient } from '@prisma/client';
import { envConfig } from 'src/config/env-config';

export const prisma = new PrismaClient({
  datasourceUrl: envConfig.DATABASE_URL,
});

export const connectToDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to the database');
  } catch (error) {
    console.log('Error connecting to the database:', error);
    process.exit(1);
  }
};
