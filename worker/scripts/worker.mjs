/**
 * Pay attention that the global object from inside the worker
 * is available using `self` or `globalThis` and not `window`.
 */

// https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/name
const workerName = globalThis.name || 'worker';

console.log(`${workerName} initialized.`);

/**
 * Stop the worker from inside.
 * https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/close
 */
// close();

/**
 * Listen to messages sent to the worker.
 * https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/message_event
 */
addEventListener('message', event => {
  console.log(`${workerName} received a new message:`, event.data);

  /**
   * DedicatedWorkerGlobalScope.postMessage()
   * https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/postMessage
   *
   * The data is serialized using the structured clone algorithm.
   * https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
   */
  setTimeout(() => { // Add timer to emulate some work in the worker.
    postMessage(event.data);
  }, 2000);
});
