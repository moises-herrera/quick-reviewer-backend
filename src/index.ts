import http from 'node:http';
import { createApp } from 'src/app';
import { container } from './app/config/container-config';
import { LoggerService } from './common/abstracts/logger.abstract';

const app = createApp();
const logger = container.get(LoggerService);

http.createServer(app).listen(app.get('PORT'), () => {
  logger.log(`Server is running on port ${app.get('PORT')}`);
});
