import http from 'node:http';
import { envConfig } from './config/env-config';
import { app } from './app';

http.createServer(app).listen(envConfig.PORT, () => {
  console.log(`Server is running on port ${envConfig.PORT}`);
});
