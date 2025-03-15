import http from 'node:http';
import { app } from 'src/app';

http.createServer(app).listen(app.get('PORT'), () => {
  console.log(`Server is running on port ${app.get('PORT')}`);
});
