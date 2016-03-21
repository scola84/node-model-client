'use strict';

const scolaAssign = require('@scola/assign');

class Dispatcher {
  constructor(models, validator, messenger) {
    this.models = models;
    this.validator = validator;
    this.messenger = messenger;
  }

  addModels(models) {
    scolaAssign(this.models, models);
    return this;
  }

  get(name) {
    if (!this.models[name]) {
      throw new Error('@scola.model.not-found');
    }

    const model = this.models[name].get();

    if (!model.getMessenger()) {
      model
        .setValidator(this.validator)
        .setMessenger(this.messenger);
    }

    return model;
  }
}

module.exports = Dispatcher;
