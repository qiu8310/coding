var _ = require('lodash'),
  fs = require('fs'),
  esprima = require('esprima');

exports.isRequireNode = function(node) {
  return _.isMatch(node, {type: 'CallExpression', callee: {name: 'require', type: 'Identifier'}});
};

exports.getFileAST = function(filepath, hideRangeAndLoc) {

  var content = fs.readFileSync(filepath, {encoding: 'utf8'});
  return esprima.parse(content, {range: !hideRangeAndLoc, loc: !hideRangeAndLoc});
};
