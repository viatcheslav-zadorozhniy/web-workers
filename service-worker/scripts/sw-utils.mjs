const putInCache = async (request, response, cacheName) => {
  // https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/open
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
};

const createNetworkUnavailableResponse = () => {
  return new Response('Network unavailable', { status: 503 });
};

const createNetworkErrorResponse = () => {
  return new Response('Network error happened', {
    status: 408,
    headers: { 'Content-Type': 'text/plain' },
  });
};

const fetchAndPutToCache = async (request, cacheName) => {
  if (!navigator.onLine) {
    return createNetworkUnavailableResponse();
  }

  try {
    const responseFromNetwork = await fetch(request);

    /**
     * Response may be used only once.
     * We need to save clone to put one copy in cache and serve second one.
     */
    putInCache(request, responseFromNetwork.clone(), cacheName);
    return responseFromNetwork;
  } catch {
    // We should always return a `Response` object.
    return createNetworkErrorResponse();
  }
};

// https://developer.chrome.com/docs/workbox/modules/workbox-strategies/#cache-first-cache-falling-back-to-network
const cacheFirst = async ({ cacheName, preloadResponsePromise, request }) => {
  // First, try to get the resource from the cache.
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  // Next, try to use a preloaded response if it exists.
  const preloadResponse = await preloadResponsePromise;
  if (preloadResponse) {
    /**
     * Preload response may be used only once.
     * We need to save clone to put one copy in cache and serve second one.
     */
    putInCache(request, preloadResponse.clone(), cacheName);
    return preloadResponse;
  }

  // Finally, try to get the resource from the network.
  return await fetchAndPutToCache(request, cacheName);
};

// https://developer.chrome.com/docs/workbox/modules/workbox-strategies/#network-first-network-falling-back-to-cache
const networkFirst = async ({ cacheName, request }) => {
  const responseFromCache = caches.match(request);

  // When offline, return the response from the cache if it exists or 503 error.
  if (!navigator.onLine) {
    return await responseFromCache || createNetworkUnavailableResponse();
  }

  try {
    const responseFromNetwork = await fetch(request);

    /**
     * Response may be used only once.
     * We need to save clone to put one copy in cache and serve second one.
     */
    putInCache(request, responseFromNetwork.clone(), cacheName);
    return responseFromNetwork;
  } catch {
    // Try to fall back to the response from the cache otherwise return a network error response.
    return await responseFromCache || createNetworkErrorResponse();
  }
};

// https://developer.chrome.com/docs/workbox/modules/workbox-strategies/#stale-while-revalidate
const staleWhileRevalidate = async ({ cacheName, request }) => {
  // Always revalidate the response.
  const httpRequest = fetchAndPutToCache(request, cacheName);

  // Return the response from the cache if it exists.
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  // Otherwise, return the response from the network.
  return await httpRequest;
};

/**
 * The `NavigationPreloadManager.enable()` method is used to enable preloading of resources managed by the service worker.
 * https://developer.mozilla.org/en-US/docs/Web/API/NavigationPreloadManager/enable
 *
 * Speed up service worker with navigation preloads:
 * https://web.dev/navigation-preload/
 */
export const enableNavigationPreload = async () => {
  if (globalThis.registration.navigationPreload) {
    await globalThis.registration.navigationPreload.enable();
  }
};

// Pre-cache resources for offline mode or for an immediate response from a service worker.
export const preCacheResources = async (cacheName, resources) => {
  // https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/open
  const cache = await caches.open(cacheName);

  await Promise.all(
    resources.map(async resource => {
      const exist = await caches.match(resource, { cacheName });
      if (!exist) {
        await cache.add(resource);
      }
    })
  );
};

export const STRATEGIES = {
  // Inspired by:
  // https://developer.chrome.com/docs/workbox/modules/workbox-strategies/#cache-first-cache-falling-back-to-network
  CacheFirst: 'CacheFirst',

  // Inspired by:
  // https://developer.chrome.com/docs/workbox/modules/workbox-strategies/#network-first-network-falling-back-to-cache
  NetworkFirst: 'NetworkFirst',

  // Inspired by:
  // https://developer.chrome.com/docs/workbox/modules/workbox-strategies/#stale-while-revalidate
  StaleWhileRevalidate: 'StaleWhileRevalidate',
};

/**
 * Inspired by:
 * https://developer.chrome.com/docs/workbox/modules/workbox-strategies/
 * https://developer.chrome.com/docs/workbox/reference/workbox-strategies/
 */
export const handleRequest = async (strategy, strategyOptions) => {
  switch (strategy) {
    case STRATEGIES.CacheFirst: {
      return cacheFirst(strategyOptions);
    }
    case STRATEGIES.NetworkFirst: {
      return await networkFirst(strategyOptions);
    }
    case STRATEGIES.StaleWhileRevalidate: {
      return staleWhileRevalidate(strategyOptions);
    }
    default: {
      return await fetchAndPutToCache(strategyOptions.request, strategyOptions.cacheName);
    }
  }
};
