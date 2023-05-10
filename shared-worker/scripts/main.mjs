import { BROADCAST_CHANNELS } from './common/broadcast-channels.mjs';
import { EVENTS } from './common/events.mjs';
import { createCommentHTML } from './common/utils.mjs';

// https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker
const sharedWorker = new SharedWorker('/scripts/shared-worker.mjs', {
  type: 'module',
  name: 'user-worker',
});

/**
 * Listen to messages from the shared worker.
 * https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/message_event
 *
 * To start receive messages the port must be activated by calling `port.start()`.
 * This is only needed when using the `addEventListener('message')` method,
 * `onmessage` setter calls `port.start()` implicitly.
 * https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/start
 */
sharedWorker.port.onmessage = event => {
  if (event.data.type === EVENTS.StateTransfer) {
    renderComments(event.data.payload);
  }
};

// https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel/BroadcastChannel
const commentsBroadcastChannel = new BroadcastChannel(BROADCAST_CHANNELS.Comments);

/**
 * Close connection to the broadcast channel.
 * https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel/close
 */
// commentsBroadcastChannel.close();

/**
 * Listen to messages from the `BroadcastChannel`.
 * https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel/message_event
 */
commentsBroadcastChannel.addEventListener('message', event => {
  const { type, payload } = event.data;

  switch(type) {
    case EVENTS.CommentsLoaded: {
      renderComments(payload);
      break;
    }
    case EVENTS.CommentAdded: {
      renderComments([payload]);
      break;
    }
  }
});

const renderComments = comments => {
  const html = comments.map(createCommentHTML).join('');
  document.getElementById('comments').insertAdjacentHTML('afterbegin', html);
};

/**
 * MessagePort.postMessage()
 * https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/postMessage
 */
const sendMessageToWorker = message => {
  sharedWorker.port.postMessage(message);
};

document.getElementById('add-comment-btn').addEventListener('click', () => {
  const commentFormControl = document.getElementById('comment');

  if (!commentFormControl.value) {
    return;
  }

  sendMessageToWorker({
    type: EVENTS.AddComment,
    payload: { body: commentFormControl.value },
  });

  commentFormControl.value = '';
  commentFormControl.focus();
});
