'use strict';

const EventHandler = require('@scola/events');

class Messenger extends EventHandler {
  constructor() {
    super();

    this.id = 0;
    this.socket = null;
    this.requests = new Map();
  }

  open(socket) {
    this.socket = socket;
    this.addHandlers();

    return this;
  }

  close() {
    this.removeHandlers();
    this.socket = null;

    return this;
  }

  send(method, meta, data, model) {
    const id = ++this.id;
    const name = model ? model.getName() : model;

    this.sendRequest(method, meta, data, name, id);
    this.saveRequest(method, meta, data, model, id);

    return this;
  }

  sendRequest(method, meta, data, model, id) {
    const message = this.socket
      .createMessage()
      .setBody({
        data,
        meta,
        method,
        model
      });

    if (id) {
      message.addHead(id);
    }

    this.socket.send(message);
  }

  saveRequest(method, meta, data, model, id) {
    this.requests.set(id, {
      data,
      id,
      meta,
      method,
      model
    });
  }

  deleteRequest(request) {
    if (request.meta.bind) {
      this.sendRequest('select', {
        unbind: true
      }, null, request.model.getName(), request.id);
    }

    this.requests.delete(request.id);
    return this;
  }

  deleteModel(model) {
    const requests = new Map(this.requests);

    requests.forEach((request) => {
      if (request.model === model) {
        this.deleteRequest(request);
      }
    });
  }

  addHandlers() {
    this.bindListener('message', this.socket, this.handleMessage);
    this.bindListener('open', this.socket, this.handleOpen);
  }

  removeHandlers() {
    this.unbindListener('message', this.socket, this.handleMessage);
    this.unbindListener('open', this.socket, this.handleOpen);
  }

  handleMessage(event) {
    try {
      const id = Number(event.message.sliceHead());
      const request = this.requests.get(id);

      if (request) {
        request.model.handleMessage(event, request);
      }
    } catch (error) {
      this.emit('error', {
        error
      });
    }
  }

  handleOpen() {
    const requests = new Map(this.requests);

    requests.forEach((request) => {
      if (request.method === 'select') {
        this.sendRequest(
          request.method,
          request.meta,
          request.data,
          request.model.getName(),
          request.id
        );
      } else {
        this.deleteRequest(request);
      }
    });
  }
}

module.exports = Messenger;
