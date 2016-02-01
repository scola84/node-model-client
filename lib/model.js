'use strict';

const EventHandler = require('@scola/events');

class Model extends EventHandler {
  constructor() {
    super();

    this.messenger = null;
    this.context = null;

    this.events = new Map();
  }

  getName() {
    throw new Error('not_implemented');
  }

  getMessenger() {
    return this.messenger;
  }

  setMessenger(messenger) {
    this.messenger = messenger;
    return this;
  }

  getContext() {
    return this.context;
  }

  setContext(context) {
    this.context = context;
    return this;
  }

  destroy() {
    this.events.forEach((events, context) => {
      Object.keys(events).forEach((key) => {
        context.unbindListener(key, this, events[key]);
      });
    });

    this.messenger.deleteModel(this);

    return this;
  }

  listen(events, context) {
    context = context || this.context;

    this.events.set(context, events);

    Object.keys(events).forEach((key) => {
      context.bindListener(key, this, events[key]);
    });

    return this;
  }

  read(data) {
    this.messenger.send(this, 'read', data);
    return this;
  }

  write(data) {
    this.messenger.send(this, 'write', data);
    return this;
  }

  delete(data) {
    this.messenger.send(this, 'delete', data);
    return this;
  }

  handleMessage(event, request) {
    const body = event.message.getBody();

    if (!request.data.bind) {
      this.messenger.deleteRequest(request);
    }

    this.emit(body.method, request.data, body.data, event);
  }
}

module.exports = Model;
