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
        AccountType: {
          type: 'string',
          enum: ['User', 'Organization', 'Bot'],
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string', nullable: true },
            username: { type: 'string' },
            email: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Account: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            type: { $ref: '#/components/schemas/AccountType' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Repository: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            ownerId: { type: 'number' },
            owner: { $ref: '#/components/schemas/Account' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PullRequest: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            nodeId: { type: 'string' },
            number: { type: 'integer' },
            title: { type: 'string' },
            body: { type: 'string', nullable: true },
            state: { type: 'string' },
            url: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            closedAt: { type: 'string', format: 'date-time', nullable: true },
            mergedAt: { type: 'string', format: 'date-time', nullable: true },
            author: { type: 'string' },
            additions: { type: 'integer' },
            deletions: { type: 'integer' },
            changedFiles: { type: 'integer' },
            repositoryId: { type: 'number' },
            headSha: { type: 'string' },
            baseSha: { type: 'string' },
            repository: { $ref: '#/components/schemas/Repository' },
          },
        },
        PullRequestComment: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            pullRequestId: { type: 'number' },
            body: { type: 'string' },
            user: { type: 'string' },
            userType: { $ref: '#/components/schemas/AccountType' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            commitId: { type: 'string', nullable: true },
            type: { type: 'string', nullable: true },
          },
        },
        CodeReview: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            pullRequestId: { type: 'number' },
            reviewer: { type: 'string' },
            body: { type: 'string', nullable: true },
            status: { type: 'string' },
            userType: { $ref: '#/components/schemas/AccountType' },
            commitId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            pullRequest: { $ref: '#/components/schemas/PullRequest' },
          },
        },
        dAccountsResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Account' },
            },
            total: { type: 'integer' },
            page: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        PaginatedRepositoriesResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Repository' },
            },
            total: { type: 'integer' },
            page: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        PaginatedPullRequestsResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/PullRequest' },
            },
            total: { type: 'integer' },
            page: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        PaginatedCodeReviewsResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/CodeReview' },
            },
            total: { type: 'integer' },
            page: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        PullRequestFiltersWithState: {
          type: 'object',
          properties: {
            repositories: { type: 'array', items: { type: 'number' } },
            startDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
          },
          required: ['repositories'],
        },
        ReviewInfo: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            reviewer: {
              type: 'string',
            },
            status: {
              type: 'string',
            },
            pullRequest: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                },
                number: {
                  type: 'number',
                },
                title: {
                  type: 'string',
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                },
                repository: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number',
                    },
                    name: {
                      type: 'string',
                    },
                    owner: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'number',
                        },
                        name: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        PaginatedCodeReviewDetailedInfoResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ReviewInfo' },
            },
            total: { type: 'integer' },
            page: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        Metric: {
          type: 'object',
          properties: {
            value: { type: 'number' },
            unit: { type: 'string' },
            description: { type: 'string' },
          },
        },
        ChartDataItem: {
          type: 'object',
          properties: {
            label: {
              type: 'string',
            },
            value: {
              type: 'number',
            },
          },
        },
        ChartData: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ChartDataItem' },
            },
            title: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/**/*.ts'],
};

export const docsConfig = swaggerJSDoc(swaggerOptions);
