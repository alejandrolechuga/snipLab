import { apiRequestTestCases } from '../public/tests/APIRequestTestCoverageData.js';
import type { APIRequestTestCase } from './types/APIRequestTestCoverageData';

type TestRule = {
  id: string;
  method: string;
  matchUrl: string;
  responseBody: unknown;
};

export const testRules: TestRule[] = (
  apiRequestTestCases as APIRequestTestCase[]
).map((test) => ({
  id: `test-${test.method}-${test.type}`.toLowerCase(),
  method: test.method,
  matchUrl: test.url,
  responseBody: test.expectedResponse,
}));
