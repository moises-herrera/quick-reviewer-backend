import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const connectToDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to the database');
  } catch (error) {
    console.log('Error connecting to the database:', error);
    process.exit(1);
  }
};
