'use strict';

const EventHandler = require('@scola/events');

class AbstractModel extends EventHandler {
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

  read(request) {
    return this.process('read', request, this.validateRead(request));
  }

  write(request) {
    return this.process('write', request, this.validateWrite(request));
  }

  delete(request) {
    return this.process('delete', request, this.validateDelete(request));
  }

  process(name, request, validatedRequest) {
    request = request || {};
    validatedRequest = validatedRequest || {};

    if (validatedRequest.error) {
      return this.emit('error', request, validatedRequest);
    }

    this.messenger.send(this, name, request);
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

  validateRead(request) {
    return request;
  }

  validateWrite(request) {
    return request;
  }

  validateDelete(request) {
    return request;
  }
}

module.exports = AbstractModel;
