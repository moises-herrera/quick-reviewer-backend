import http from 'node:http';
import { createApp } from 'src/app';
import { container } from 'src/app/config/container-config';
import { LoggerService } from 'src/common/abstracts/logger.abstract';

export const startServer = () => {
  const app = createApp();
  const logger = container.get(LoggerService);

  http.createServer(app).listen(app.get('PORT'), () => {
    logger.log(`Server is running on port ${app.get('PORT')}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
