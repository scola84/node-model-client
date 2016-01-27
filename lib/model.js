'use strict';

const EventHandler = require('@scola/events');

class Model extends EventHandler {
  constructor(messenger) {
    super();

    this.id = null;
    this.name = null;
    this.messenger = messenger;
    this.events = new Map();
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
    return this;
  }

  listen(events, context) {
    this.events.set(context, events);

    Object.keys(events).forEach((key) => {
      context.bindListener(key, this, events[key]);
    });

    return this;
  }

  destroy() {
    this.events.forEach((events, context) => {
      Object.keys(events).forEach((key) => {
        context.unbindListener(key, this, events[key]);
      });
    });

    return this;
  }

  select(data) {
    data.name = data.name || 'select';
    this.messenger.send(this, 'select', data);

    return this;
  }

  insert(data) {
    data.name = data.name || 'insert';
    this.messenger.send(this, 'insert', data);

    return this;
  }

  update(data) {
    data.name = data.name || 'update';
    this.messenger.send(this, 'update', data);

    return this;
  }

  delete(data) {
    data.name = data.name || 'delete';
    this.messenger.send(this, 'delete', data);

    return this;
  }

  handleMessage(event, request) {
    const body = event.message.getBody();

    if (request.method !== 'select' || !request.data.bind) {
      this.messenger.delete(body.id);
      this.destroy();
    }

    if (body.method === 'error') {
      return this.emit('error', body.data);
    }

    if (body.data.result.length === 0) {
      return this.emit('empty');
    }

    body.data.result.forEach((item, index) => {
      this.emit(body.method, item, index);
    });
  }
}

module.exports = Model;
