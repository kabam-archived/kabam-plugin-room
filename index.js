var slugify = require('slugify2'),
  async = require('async');

exports.name = "kabamPluginRoom";

exports.model = require('./lib/models.js');
exports.routes = require('./lib/routes.js');
