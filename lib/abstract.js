'use strict';

const EventHandler = require('@scola/events');

class AbstractModel extends EventHandler {
  constructor() {
    super();

    this.messenger = null;
    this.validator = null;

    this.meta = {};
    this.values = {};
    this.changes = {};

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

  destroy() {
    this.events.forEach((events, context) => {
      this.unlisten(context);
    });

    this.messenger.deleteModel(this);
    return this;
  }

  listen(events, context) {
    this.events.set(context, events);

    Object.keys(events).forEach((key) => {
      context.bindListener(key, this, events[key]);
    });

    return this;
  }

  unlisten(context) {
    if (!this.events.has(context)) {
      return this;
    }

    const events = this.events.get(context);
    this.events.delete(context);

    Object.keys(events).forEach((key) => {
      context.unbindListener(key, this, events[key]);
    });

    return this;
  }

  id(id) {
    this.meta.id = id;
    return this;
  }

  filter(filter) {
    this.meta.filter = filter;
    return this;
  }

  order(order) {
    this.meta.order = order;
    return this;
  }

  limit(limit) {
    this.meta.limit = limit;
    return this;
  }

  get(name) {
    return this.values[name];
  }

  set(name, value) {
    this.changes[name] = value;
    return this;
  }

  getAll() {
    return this.values;
  }

  setAll(values) {
    Object.assign(this.values, values);
    return this;
  }

  commit() {
    return this.setAll(this.changes).clear();
  }

  clear() {
    this.changes = {};
    return this;
  }

  notify() {
    this.emit('local', this.changes);
    return this;
  }

  validate(changes) {
    return changes;
  }

  select() {
    return this.send('select');
  }

  bindSelect() {
    return this.send('select', null, {
      bind: true
    });
  }

  unbindSelect() {
    return this.send('select', null, {
      unbind: true
    });
  }

  insert() {
    try {
      const changes = this.validate(this.changes);
      this.send('insert', changes);
    } catch (error) {
      this.emit('error', error);
    }

    return this;
  }

  update() {
    try {
      const changes = this.validate(this.changes);
      this.send('update', changes);
    } catch (error) {
      this.emit('error', error);
    }

    return this;
  }

  delete() {
    return this.send('delete');
  }

  send(method, data, meta) {
    meta = Object.assign({}, this.meta, meta);
    this.messenger.send(method, meta, data, this);
    return this;
  }

  handleMessage(event, request) {
    const response = event.message.getBody();

    if (!request.meta.bind) {
      this.messenger.deleteRequest(request);
    }

    if (response.method === 'select') {
      this.setAll(response.data);
    }

    if (response.method === 'change') {
      this.handleChange(response);
    }

    if (response.method === 'error') {
      response.data.error = new Error(response.data.error);
    }

    this.emit(response.method, request, response, event);
  }

  handleChange(response) {
    response.method = 'remote';
    return this.setAll(response.data);
  }
}

module.exports = AbstractModel;
