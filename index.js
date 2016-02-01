'use strict';

const DI = require('@scola/di');

const Dispatcher = require('./lib/dispatcher');
const Messenger = require('./lib/messenger');
const Model = require('./lib/model');

class Module extends DI.Module {
  configure() {
    this.inject(Dispatcher)
      .insertArgument(1, this.singleton(Messenger));
  }
}

module.exports = {
  Dispatcher,
  Messenger,
  Model,
  Module
};
