'use strict';

const DI = require('@scola/di');

const Messenger = require('./lib/messenger');
const Model = require('./lib/model');

class Module extends DI.Module {
  configure() {
    this.inject(Model).with(
      this.singleton(Messenger)
    );
  }
}

module.exports = {
  Messenger,
  Model,
  Module
};
