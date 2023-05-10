import { EVENTS } from './events.mjs';

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.mjs', {
        type: 'module',

        /**
         * The values determine if and how the browser's standard HTTP cache comes into play
         * when making the HTTP request to check for updated service worker resources.
         *
         * The default value is 'imports'.
         * https://developer.chrome.com/blog/fresher-sw/#updateviacache
         */
        // updateViaCache: 'all',

        /**
         * Control all content under the specified app's origin.
         * The default value is equal to the service worker file folder and can't be higher.
         */
        // scope: '/about/',
      });

      console.log('Service worker registered.');

      const registration = await navigator.serviceWorker.ready;

      console.log('Service worker ready.');

      /**
       * Notify the service worker about the browser's idle period.
       * The service worker will use it to pre-cache app routes.
       *
       * https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
       */
      requestIdleCallback(() => {
        // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker/postMessage
        registration.active.postMessage({ type: EVENTS.BrowserIdle });
      });
    } catch (error) {
      console.error('Service worker registration failed.', error);
    }
  }
};

registerServiceWorker();
