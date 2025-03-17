import { PrismaClient } from '@prisma/client';
import { injectable } from 'inversify';
import { envConfig } from 'src/config/env-config';

@injectable()
export class DbClient extends PrismaClient {
  constructor() {
    super({
      datasourceUrl: envConfig.DATABASE_URL,
    });
  }

  async connectToDatabase(): Promise<void> {
    try {
      await this.$connect();
      console.log(`Connected to the database at ${envConfig.DATABASE_URL}`);
    } catch (error) {
      console.log(
        `Error connecting to the database at ${envConfig.DATABASE_URL}:`,
        error,
      );
      process.exit(1);
    }
  }
}
