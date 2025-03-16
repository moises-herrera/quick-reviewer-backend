import { GITHUB_ACCESS_TOKEN } from 'src/github/constants/auth';
import { envConfig } from './env-config';
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quick Reviewer API',
      version: '1.0.0',
      description: 'API documentation for Quick Reviewer',
    },
    servers: [
      {
        url: envConfig.BACKEND_URL,
      },
    ],
    components: {
      securitySchemes: {
        githubAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: GITHUB_ACCESS_TOKEN,
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/**/*.ts'],
};

export const docsConfig = swaggerJSDoc(swaggerOptions);
