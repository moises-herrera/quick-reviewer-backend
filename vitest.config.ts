import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    workspace: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*unit.test.ts'],
          environment: 'node',
          globals: true,
        },
      },
      {
        test: {
          name: 'integration',
          include: ['tests/integration/**/*integration.test.ts'],
          environment: 'node',
          globals: true,
        },
      },
    ],
  },
});
