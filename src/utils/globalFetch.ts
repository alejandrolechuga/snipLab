const originalFetch = window.fetch;

export const getOriginalFetch = () => originalFetch;
export const setGlobalFetch = (fn: typeof fetch) => {
  window.fetch = fn;
};
export const getGlobalFetch = () => window.fetch;
