import type { Config } from 'jest';

const config: Config = {
  projects: [
    // Disabled for now since is having issues
    // {
    //     displayName: 'type-check',
    //     runner: 'jest-runner-tsc',
    //     testMatch: ['<rootDir>/src/**/*.(ts|tsx)']
    // },
    {
      displayName: 'unit-tests',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/**/*.test.(ts|tsx|js)'],
      moduleNameMapper: {
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.ts', // Mock asset imports
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
  ],
};

export default config;
