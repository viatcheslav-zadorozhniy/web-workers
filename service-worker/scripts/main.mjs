if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.mjs', {
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
  });
}
