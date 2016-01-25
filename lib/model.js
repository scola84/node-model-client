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
    this.data = data;
    this.messenger.send(this, 'select', data);

    return this;
  }

  insert(data) {
    this.data = data;
    this.messenger.send(this, 'insert', data);

    return this;
  }

  update(data) {
    data.id = this.data.id;
    this.messenger.send(this, 'update', data);

    return this;
  }

  delete() {
    this.messenger.send(this, 'delete', {
      id: this.id
    });

    return this;
  }

  handleMessage(event, request) {
    const body = event.message.getBody();

    if (request.method !== 'select' || !request.data.bind) {
      this.messenger.delete(body.id);
      this.destroy();
    }

    this.emit(request.method, body.data);
  }
}

module.exports = Model;
