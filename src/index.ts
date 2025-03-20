import http from 'node:http';
import { app } from 'src/app';
import { container } from './config/container-config';
import { LoggerService } from './core/services/logger.service';

const logger = container.get(LoggerService);

http.createServer(app).listen(app.get('PORT'), () => {
  logger.log(`Server is running on port ${app.get('PORT')}`);
});
