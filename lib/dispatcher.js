'use strict';

const lodashGet = require('lodash.get');
const lodashHas = require('lodash.has');

class Dispatcher {
  constructor(models, messenger) {
    this.models = models;
    this.messenger = messenger;
  }

  get(name) {
    if (!lodashHas(this.models, name)) {
      throw new Error('@scola.model.not-found');
    }

    const model = lodashGet(this.models, name).get();

    if (!model.getMessenger()) {
      model.setMessenger(this.messenger);
    }

    return model;
  }
}

module.exports = Dispatcher;
