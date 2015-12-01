/*
 * coding
 * https://github.com/qiu8310/coding"
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

'use strict';

var traverse = require('./lib/traverse'),
  refactor = require('./lib/refactor'),
  path = require('x-path'),
  _ = require('lodash'),
  EOL = require('os').EOL;

module.exports = function(filePath, opts) {
  opts = _.assign({
    global: 'G',
    rename: null,
    transform: null,  // should be function
    addFilePathComment: true,
    saveMainExport: false // 是否保留主文件中的 module.exports
  }, opts || {});

  function fileComment(f, relative) {
    if (relative) {
      f = path.relative(path.dirname(relative), f);
    } else {
      f = path.basename(f);
    }
    return opts.addFilePathComment ? '// file: ' + f + EOL : '';
  }

  //traverse(filePath).forEach(function(group) {
  var group = traverse(filePath)[0];
  var content = [], start = '', end = '';
  if (!opts.global) {
    start = '(function () {' + EOL;
    end = EOL + '})();' + EOL;
    opts.global = '_G';
  }
  content.push('var ' + opts.global + ' = {};' + EOL);

  group.deepDepends.forEach(function(f) {
    content.push(fileComment(f, group.value) + refactor(f, opts) + EOL);
  });
  content.push(fileComment(group.value) + refactor(group.value, opts, opts.saveMainExport) + EOL);

  return start + content.join(EOL) + end;
  //});
};
