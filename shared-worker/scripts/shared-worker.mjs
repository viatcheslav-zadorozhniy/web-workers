/**
 * Debug via:
 * Chrome - chrome://inspect/#workers
 * Firefox - about:debugging#workers
 */

import { BROADCAST_CHANNELS } from './common/broadcast-channels.mjs';
import { EVENTS } from './common/events.mjs';
import { fetchComments, addComment } from './common/utils.mjs';

// https://developer.mozilla.org/en-US/docs/Web/API/SharedWorkerGlobalScope/name
const workerName = globalThis.name || 'shared-worker';

console.log(`${workerName} initialized.`);

// https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel/BroadcastChannel
const commentsBroadcastChannel = new BroadcastChannel(BROADCAST_CHANNELS.Comments);

/**
 * Close connection to the broadcast channel.
 * https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel/close
 */
// commentsBroadcastChannel.close();

/**
 * BroadcastChannel.postMessage()
 * https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel/postMessage
 */
const sendMessageToBroadcastChannel = message => {
  commentsBroadcastChannel.postMessage(message);
};

/**
 * Listen to the new connections to the worker.
 * https://developer.mozilla.org/en-US/docs/Web/API/SharedWorkerGlobalScope/connect_event
 */
globalThis.addEventListener('connect', event => {
  console.log(`A new connection to the ${workerName} was established.`);

  /**
   * Listen to messages sent to the shared worker.
   * https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/message_event
   * 
   * To start receive messages the port must be activated by calling `port.start()`.
   * This is only needed when using the `addEventListener('message')` method,
   * `onmessage` setter calls `port.start()` implicitly.
   * https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/start
   */
  event.ports[0].onmessage = async event => {
    if (event.data.type === EVENTS.AddComment) {
      const comment = await addComment(event.data.payload);

      comments.unshift(comment);

      sendMessageToBroadcastChannel({
        type: EVENTS.CommentAdded,
        payload: comment,
      });
    }
  };

  // Notify the new port about the current state if present.
  if (comments.length) {
    /**
     * MessagePort.postMessage()
     * https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/postMessage
     */
    event.ports[0].postMessage({
      type: EVENTS.StateTransfer,
      payload: comments,
    });
  }
});

let comments = [];

const loadAndBroadcastComments = async () => {
  comments = await fetchComments();

  sendMessageToBroadcastChannel({
    type: EVENTS.CommentsLoaded,
    payload: comments,
  });
};

// Fetch comments once - on worker initialization.
loadAndBroadcastComments();
