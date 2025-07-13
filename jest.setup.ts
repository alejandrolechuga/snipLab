import '@testing-library/jest-dom'; // Import jest-dom for extended matchers

// Provide a minimal chrome.runtime.getManifest mock for tests
if (!(globalThis as any).chrome) {
  (globalThis as any).chrome = {
    runtime: {
      getManifest: () => ({ version: '0.0.0' }),
    },
  } as any;
}
