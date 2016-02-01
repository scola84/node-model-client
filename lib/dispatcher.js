'use strict';

const lodashGet = require('lodash.get');
const lodashHas = require('lodash.has');

class Dispatcher {
  constructor(models, validator, messenger) {
    this.models = models;
    this.validator = validator;
    this.messenger = messenger;
  }

  get(name) {
    if (!lodashHas(this.models, name)) {
      throw new Error('@scola.model.not-found');
    }

    const model = lodashGet(this.models, name).get();

    if (!model.getMessenger()) {
      model
        .setValidator(this.validator)
        .setMessenger(this.messenger);
    }

    return model;
  }
}

module.exports = Dispatcher;
