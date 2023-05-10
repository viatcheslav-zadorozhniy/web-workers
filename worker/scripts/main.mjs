const initializeWorker = () => {
  // https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker
  const worker = new Worker('/scripts/worker.mjs', {
    type: 'module',
    name: 'demo-worker',
  });

  /**
   * Stop the worker from outside.
   * https://developer.mozilla.org/en-US/docs/Web/API/Worker/terminate
   */
  // worker.terminate();

  /**
   * Worker.postMessage()
   * https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage
   *
   * The data is serialized using the structured clone algorithm.
   * https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
   */
  const sendMessageToWorker = message => {
    worker.postMessage(message);
  };

  let messageDate = new Date();

  /**
   * Messages can be sent to the worker even if its loading/initialization is in progress.
   * It will get them after initialization.
   */
  sendMessageToWorker({ messageDate });
  console.log('A new message has posted to the worker.');

  /**
   * Listen to messages from the worker.
   * https://developer.mozilla.org/en-US/docs/Web/API/Worker/message_event
   */
  worker.addEventListener('message', event => {
    console.log('window received a new message:', event.data);
    console.log('messageDate objects are equal:', event.data.messageDate === messageDate);
  });

  document.getElementById('send-message-button').addEventListener('click', () => {
    messageDate = new Date();
    sendMessageToWorker({ messageDate });
  });
};

document.getElementById('initialize-worker-button').addEventListener('click', event => {
  document.getElementById('worker-section').style.display = 'block';
  event.target.style.display = 'none';
  initializeWorker();
});
