'use strict';

var mau = require('mau');
var path = require('path');
var rimraf = require('rimraf');
var through = require('through2');
var debug = require('debug')('gulp-peaches');
var PluginError = require('gulp-util').PluginError;
var _ = require('lodash');

// Consts
var PLUGIN_NAME = 'gulp-peaches';

module.exports = function gulpPeaches(options) {

  var defaultOpt = {
    server: {
      'name': 'tfs',
      'root': './tmp',
      'tmp': './tmp'
    }
  };

  options = _.extend(defaultOpt, options);

  return through.obj(function transform(file, enc, callback) {
    if (file.isNull()) return callback(null, file);
    if (file.isStream()) return callback(new PluginError(PLUGIN_NAME, 'Streaming not supported.'));

    var that = this;
    var code = file.contents.toString();
    peaches(code, options, function(err, styleText) {
      if (err) {
        debug('file %s error %s', file.path, err);
        return callback(new PluginError(err));
      }

      debug('file %s success', file.path);
      file.contents = new Buffer(styleText);
      that.push(file);

      if (options.server.tmp) {
        var tmp = path.resolve(options.server.tmp);
        debug('remove tmp %s', tmp);
        rimraf(tmp, callback);
      } else {
        callback();
      }
    });
  });
};