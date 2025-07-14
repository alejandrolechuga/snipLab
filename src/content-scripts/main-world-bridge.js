// This script runs in the webpage's main world (subject to its CSP).
// It provides a secure bridge for the isolated world to interact with the page.

// Expose a global API object for communication
window.__snipLabMainWorldAPI = {
  // Example function: Set a global variable on the main page's window
  setGlobal: (varName, value) => {
    if (typeof varName === 'string') {
      try {
        window[varName] = value;
        window.postMessage({ type: 'SNIPLAB_RESPONSE', action: 'setGlobal', status: 'success', varName, value }, '*');
      } catch (e) {
        console.error('[SnipLab Bridge] Error setting global:', e);
        window.postMessage({ type: 'SNIPLAB_RESPONSE', action: 'setGlobal', status: 'error', varName, error: e.message }, '*');
      }
    }
  },

  // Example function: Get a global variable from the main page's window
  getGlobal: (varName) => {
    if (typeof varName === 'string') {
      try {
        const value = window[varName];
        window.postMessage({ type: 'SNIPLAB_RESPONSE', action: 'getGlobal', status: 'success', varName, value }, '*');
        return value; // Also return for direct executeScript func call
      } catch (e) {
        console.error('[SnipLab Bridge] Error getting global:', e);
        window.postMessage({ type: 'SNIPLAB_RESPONSE', action: 'getGlobal', status: 'error', varName, error: e.message }, '*');
      }
    }
  },

  executeFunction: (funcString, argsArray) => {
    try {
      console.warn('[SnipLab Bridge] Direct function execution is complex due to CSP. Consider structured calls.');
    } catch (e) {
      console.error('[SnipLab Bridge] Error executing function:', e);
      window.postMessage({ type: 'SNIPLAB_RESPONSE', action: 'executeFunction', status: 'error', error: e.message }, '*');
    }
  }
};
