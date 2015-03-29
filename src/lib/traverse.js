/**
 * Traverse js file according require statements
 * @module traverse
 */

var path = require('x-path'),
  util = require('util'),
  estraverse = require('estraverse'),
  requireResolve = require('require-resolve'),
  _ = require('lodash'),
  helper = require('./helper'),
  dep = require('dep.js');

function getErrorData(msg, file, node, opts) {
  return JSON.stringify(
    _.assign(
      {msg: msg, file: file, line: node.loc.start.line, column: node.loc.start.column}, opts
    )
  );
}

var depFileMap = {};

function findAllRequiredFile(filePath) {
  var ast = helper.getFileAST(filePath),
    result = [];

  //require('fs').writeFile(filePath.replace(/\.js$/, '.json'), JSON.stringify(ast, null, 2));

  estraverse.traverse(ast, {
    enter: function(node, parent) {
      if (helper.isRequireNode(node)) {
        if (node.arguments.length === 1) {
          var arg = node.arguments[0];
          if (arg.type === 'Literal') {
            var depFileKey,
              depFile = requireResolve(arg.value, filePath);
            if (!depFile) {
              throw new Error(getErrorData('required file not found', filePath, node));
            } else {
              depFileKey = util.format('%s@%s:%s',
                depFile.pkg.name,
                depFile.pkg.version,
                depFile.src.replace(depFile.pkg.root, ''));

              result.push(((depFileKey in depFileMap) ?
                depFileMap[depFileKey] : (depFileMap[depFileKey] = depFile)).src);
            }
          } else {
            throw new Error(getErrorData('require function should have only literal argument', filePath, node));
          }
        } else {
          throw new Error(getErrorData('require function should have only one argument', filePath, node));
        }
      }
    }
  });

  return result;
}

function traverse(files) {
  files = [].concat(files).map(function(f) { return path.normalizePathSeparate(path.resolve(f)); });
  var queue = [].concat(files);
  var depFragments = [];

  var queueFile, depFiles, processedFiles = [];
  while (queue.length) {
    queueFile = queue.shift();

    if (processedFiles.indexOf(queueFile) < 0) {
      depFiles = findAllRequiredFile(queueFile);
      depFragments.push({value: queueFile, depends: depFiles});

      queue.push.apply(queue, depFiles);
      processedFiles.push(queueFile);
    }
  }

  var result = [];
  depFragments = dep(depFragments);
  _.each(files, function(f) {
    result.push(_.find(depFragments, {value: f}));
  });

  return result;
}

module.exports = traverse;
