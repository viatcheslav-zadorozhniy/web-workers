/**
 * The service worker lifecycle (https://web.dev/service-worker-lifecycle/):
 * `install`
 * `waiting` (in case of updating, when there is an active service worker).
 * `activate`
 *
 * When does service worker update?
 * See https://web.dev/service-worker-lifecycle/#updates for details.
 * After re-fetching the service worker file, browser compares it with an existing byte-wise.
 * In case if difference detected, `install` is triggered.
 *
 * API:
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 *
 * Debug via:
 * Chrome - chrome://inspect/#service-workers
 * Firefox - about:debugging#service-workers
 *
 * Workbox - set of libraries from Google to work with service worker.
 * https://github.com/GoogleChrome/workbox/
 */

import { EVENTS } from './scripts/events.mjs';
import { handleRequest, preCacheResources, STRATEGIES } from './scripts/sw-utils.mjs'

const CACHE_NAMES = {
  Documents: 'documents',
  Images: 'images',
  Scripts: 'scripts',
  Styles: 'styles',
};

const APP_ROUTES = [
  '/',
  '/about/',
  '/contacts/',
];

// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/install_event
globalThis.addEventListener('install', event => {
  /**
   * Force a newly installed service worker to progress into the `activating` state,
   * regardless of whether there is already an active service worker.
   * https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
   */
  globalThis.skipWaiting();

  /**
   * An `install` event handler can be used to pre-cache resources, which the service worker can use offline.
   * https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/install_event#examples
   */
  // event.waitUntil(preCacheResources(CACHE_NAMES.Documents, APP_ROUTES));

  console.log('Service worker installed.');
});

/**
 * An `activate` event handler is a good place to clear outdated caches.
 * https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/activate_event
 */
globalThis.addEventListener('activate', event => {
  /**
   * Force already loaded clients to use newly installed version of the worker immediately (w/o reloading).
   * https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
   * https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil
   */
  event.waitUntil(clients.claim());

  console.log('Service worker activated.');
});

/**
 * Listen to messages sent to the service worker.
 * https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/message_event
 */
addEventListener('message', event => {
  // Run pre-caching app routes during the browser idle period.
  if (event.data.type === EVENTS.BrowserIdle) {
    preCacheResources(CACHE_NAMES.Documents, APP_ROUTES);
  }
});

/**
 * Handle call to the browser `fetch()` method.
 * Can be used to return a cached response.
 * https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent
 * https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/fetch_event
 */
globalThis.addEventListener('fetch', event => {
  const strategyOptions = {
    // https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent/request
    request: event.request,

    // https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent/preloadResponse
    preloadResponsePromise: event.preloadResponse,
  };

  let strategy;

  // https://developer.mozilla.org/en-US/docs/Web/API/Request/destination
  switch (event.request.destination) {
    case 'document': {
      strategy = STRATEGIES.StaleWhileRevalidate;
      strategyOptions.cacheName = CACHE_NAMES.Documents;
      break;
    }
    case 'worker':
    case 'script': {
      strategy = STRATEGIES.NetworkFirst;
      strategyOptions.cacheName = CACHE_NAMES.Scripts;
      break;
    }
    case 'image': {
      strategy = STRATEGIES.CacheFirst;
      strategyOptions.cacheName = CACHE_NAMES.Images;
      break;
    }
    case 'style': {
      strategy = STRATEGIES.CacheFirst;
      strategyOptions.cacheName = CACHE_NAMES.Styles;
      break;
    }
  }

  if (strategy) {
    // https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent/respondWith
    event.respondWith(
      handleRequest(strategy, strategyOptions)
    );
  }
});
