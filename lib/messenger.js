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

  addHandlers() {
    this.bindListener('message', this.socket, this.handleMessage);
  }

  removeHandlers() {
    this.unbindListener('message', this.socket, this.handleMessage);
  }

  send(model, method, data) {
    this.requests.set(++this.id, {
      model,
      method,
      data
    });

    this.socket.send(
      this.socket
      .createMessage()
      .setBody({
        id: this.id,
        name: model.getName(),
        method,
        data
      })
    );

    return this;
  }

  delete(id) {
    this.models.delete(id);
    return this;
  }

  handleMessage(event) {
    const body = event.message.getBody();
    const request = this.requests.get(body.id);

    if (request) {
      request.model.handleMessage(event, request);
    }
  }
}

module.exports = Messenger;
