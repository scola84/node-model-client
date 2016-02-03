'use strict';

const DI = require('@scola/di');

const Abstract = require('./lib/abstract');
const Dispatcher = require('./lib/dispatcher');
const Messenger = require('./lib/messenger');

class Module extends DI.Module {
  configure() {
    this.inject(Dispatcher)
      .insertArgument(2, this.singleton(Messenger));
  }
}

module.exports = {
  Abstract,
  Dispatcher,
  Messenger,
  Module
};
