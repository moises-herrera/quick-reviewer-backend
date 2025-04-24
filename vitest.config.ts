import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    workspace: [
      {
        extends: true,
        test: {
          setupFiles: ['./tests/unit/setup.ts'],
          name: 'unit',
          include: ['tests/unit/**/*unit.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['tests/integration/**/*integration.test.ts'],
        },
      },
    ],
    coverage: {
      provider: 'istanbul',
      reportsDirectory: 'coverage',
      reporter: ['html'],
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/app/config/**/*.ts',
        'src/common/constants/**/*.ts',
        'src/common/database/seed/**/*.ts',
        'src/common/database/abstracts/**/*.ts',
        'src/ai/abstracts/**/*.ts',
        'src/github/abstracts/**/*.ts',
        'src/github/config/github-app.ts',
        'src/github/interfaces/**/*.ts',
        'src/github/constants/**/*.ts',
        'src/github/factories/utils.ts',
        'src/statistics/abstracts/**/*.ts',
        'src/**/*.abstract.ts',
      ],
    },
  },
});
