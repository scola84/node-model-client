'use strict';

const EventHandler = require('@scola/events');

class Model extends EventHandler {
  constructor() {
    super();

    this.messenger = null;
    this.validator = null;
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

  getValidator() {
    return this.validator;
  }

  setValidator(validator) {
    this.validator = validator;
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
    const validData = this.validateRead(data);

    if (validData.error) {
      return this.emit('error', data, validData);
    }

    this.messenger.send(this, 'read', validData);
    return this;
  }

  write(data) {
    const validData = this.validateWrite(data);

    if (validData.error) {
      return this.emit('error', data, validData);
    }

    this.messenger.send(this, 'write', validData);
    return this;
  }

  delete(data) {
    const validData = this.validateDelete(data);

    if (validData.error) {
      return this.emit('error', data, validData);
    }

    this.messenger.send(this, 'delete', validData);
    return this;
  }

  validateRead(data) {
    return data;
  }

  validateWrite(data) {
    return data;
  }

  validateDelete(data) {
    return data;
  }

  handleMessage(event, request) {
    const body = event.message.getBody();

    if (!request.data.bind) {
      this.messenger.deleteRequest(request);
    }

    if (body.method === 'error') {
      body.data.error = new Error(body.data.error);
    }

    this.emit(body.method, request.data, body.data, event);
  }
}

module.exports = Model;
