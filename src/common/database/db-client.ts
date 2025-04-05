import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { envConfig } from 'src/app/config/env-config';
import { LoggerService } from 'src/common/abstracts/logger.service';

@injectable()
export class DbClient extends PrismaClient {
  constructor(
    @inject(LoggerService)
    private readonly loggerService: LoggerService,
  ) {
    super({
      datasourceUrl: envConfig.DATABASE_URL,
    });
  }

  async connectToDatabase(): Promise<void> {
    try {
      await this.$connect();
      this.loggerService.log(`Connected to the database`);
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error connecting to the database',
      });
      process.exit(1);
    }
  }
}
