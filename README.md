# Web Workers

## Table of contents
- [What is their purpose?](#what-is-their-purpose)
- [Concepts and usage](#concepts-and-usage)
- [Worker types](#worker-types)
  - [Dedicated worker](#dedicated-worker)
  - [Shared worker](#shared-worker)
  - [Service worker](#service-worker)


## What is their purpose?
Web Workers allows running code (JS file) in a background thread separate from the main execution thread of an app.

Time-intensive processing can be delegated to them not to block/slow down the main thread.


## Concepts and usage
A worker is an object created using a constructor (e.g. [Worker()](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)) that runs JS file in the background thread.

Most of the standard JavaScript sets of functions are available from inside the worker.
But there are some exceptions: for example, you can't access DOM ([more details](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers)).

Communication between the worker and the main thread is done via a system of messages.
Both sides have a `postMessage()` method to send their messages.

The `onmessage` event handler is used to respond to the message (contained within the [message event](https://developer.mozilla.org/en-US/docs/Web/API/Worker/message_event) `data` property).
The data is copied (using a [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)) rather than shared.


## Worker types
- [Dedicated workers](https://developer.mozilla.org/en-US/docs/Web/API/Worker) - utilized by a single script.
- [Shared workers](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker) - utilized by multiple scripts running in different windows, IFrames, etc., within the same domain.
- [Service workers](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker) - act as proxy servers between the app, the browser, and the network.


### Dedicated worker
A [dedicated worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker) is created using the [Worker()](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker) constructor, specifying the URL of a script to execute.

E.g.
```js
const worker = new Worker('worker.js');
```

To start [the demo](./worker/) run:
```
npm run start:worker
```

### Shared worker
A [shared worker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker) is created using the [SharedWorker()](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker) constructor, specifying the URL of a script to execute.

E.g.
```js
const sharedWorker = new SharedWorker('shared-worker.js');
```

To start [the demo](./shared-worker/) run:
```
npm run shared-worker
```

### Service worker
A [service worker](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker) is an event-driven worker. It can control the routes it is associated with by intercepting and modifying navigation and resource requests.

It is registered using the [ServiceWorkerContainer.register()](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register) method.

E.g.
```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
```

To start [the demo](./service-worker/) run:
```
npm run service-worker
```
and then open http://localhost:8888/
