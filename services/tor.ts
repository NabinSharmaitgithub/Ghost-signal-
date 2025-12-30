
export const isTorConnection = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // 1. Check for .onion domain
  if (window.location.hostname.endsWith('.onion')) {
    return true;
  }
  
  // 2. Check URL param for testing/demo purposes
  // To test: Append ?tor=true to your URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tor') === 'true') {
    return true;
  }
  
  return false;
};
