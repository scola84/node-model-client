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
    return this.process('read', data, this.validateRead(data));
  }

  write(data) {
    return this.process('write', data, this.validateWrite(data));
  }

  delete(data) {
    return this.process('delete', data, this.validateDelete(data));
  }

  process(name, data, validatedData) {
    validatedData = validatedData || {};

    if (validatedData.error) {
      return this.emit('error', data, validatedData);
    }

    this.messenger.send(this, name, validatedData);
    return this;
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

  validateRead(data) {
    return data;
  }

  validateWrite(data) {
    return data;
  }

  validateDelete(data) {
    return data;
  }
}

module.exports = Model;
