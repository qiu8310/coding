var _ = require('lodash'),
  fs = require('fs'),
  esprima = require('esprima');

exports.isRequireNode = function(node) {
  return _.isMatch(node, {type: 'CallExpression', callee: {name: 'require', type: 'Identifier'}});
};

exports.getFileAST = function(filepath, opts) {
  opts = opts || {};
  var content = fs.readFileSync(filepath, {encoding: 'utf8'});
  if (typeof opts.transform === 'function') {
    var tmpContent = opts.transform(filepath, content);
    if (typeof tmpContent === 'string') {
      content = tmpContent;
    }
  }

  //var ast = esprima.parse(content, {range: !hideRangeAndLoc, loc: !hideRangeAndLoc});
  //fs.writeFileSync(filepath + '.ast.json', JSON.stringify(ast, null, 2));

  return esprima.parse(content, {range: !opts.hideRangeAndLoc, loc: !opts.hideRangeAndLoc});
};
