const originalXMLHttpRequest = window.XMLHttpRequest;

export const getOriginalXMLHttpRequest = () => originalXMLHttpRequest;

export const setGlobalXMLHttpRequest = (ctor: typeof XMLHttpRequest) => {
  window.XMLHttpRequest = ctor;
};

export const getGlobalXMLHttpRequest = () => window.XMLHttpRequest;
