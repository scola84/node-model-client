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

  send(model, method, request) {
    const id = ++this.id;

    this.requests.set(id, {
      data: request,
      id,
      method,
      model
    });

    this.socket.send(
      this.socket
      .createMessage()
      .setBody({
        data: request,
        id,
        method,
        name: model.getName()
      })
    );

    return this;
  }

  deleteRequest(request) {
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
      const body = event.message.getBody();
      const request = this.requests.get(body.id);

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
      if (request.method === 'read') {
        this.deleteRequest(request)
          .send(request.model, request.method, request.data);
      }
    });
  }
}

module.exports = Messenger;
