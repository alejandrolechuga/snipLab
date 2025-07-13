export interface APIRequestTestCase {
  name: string;
  method: string;
  url: string;
  type: 'fetch' | 'xhr';
  body?: string;
  expectedResponse: unknown;
}
export const apiRequestTestCases: APIRequestTestCase[];
