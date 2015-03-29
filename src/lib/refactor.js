var estraverse = require('estraverse'),
  escodegen = require('escodegen'),
  path = require('x-path'),
  requireResolve = require('require-resolve'),
  helper = require('./helper'),
  _ = require('lodash');

function rename(filePath, opts) {
  var res;
  if (opts.rename && typeof opts.rename === 'function') {
    res = opts.rename(filePath);
    if (typeof res === 'string') {
      return res;
    }
  }
  if (opts.baseDir) {
    res = filePath.replace(opts.baseDir, '');
  } else {
    res = path.basename(filePath);
  }
  res = res.replace(/^\/|\.[^\.]+$/g, '');
  return res.split('/').map(function(w) { return w[0] + _.camelCase(w.slice(1)); }).join('.');
}

function removeRequire(ast, filePath, opts) {
  var removePaths = [];
  estraverse.traverse(ast, {
    enter: function(node, parent) {
      if (node.type === 'VariableDeclaration') {
        var declarations = node.declarations,
          decl, i, t, reqFile;

        node.declarations = [];
        for (i = 0; i < declarations.length; i++) {
          decl = declarations[i];
          if (decl.type === 'VariableDeclarator' && decl.init && decl.id && decl.id.type === 'Identifier') {
            if (helper.isRequireNode(decl.init)) {
              reqFile = requireResolve(decl.init.arguments[0].value, filePath).src;

              t = parent._alias || {};
              t[decl.id.name] = rename(reqFile, opts);
              parent._alias = t;
              // console.log(decl.id.name + ' = ' + decl.init.arguments[0].value); // 把下面的所有出现这个名称的变量替换掉
              continue;
            }
          }
          node.declarations.push(decl);
        }

        if (node.declarations.length === 0) {
          removePaths.unshift(this.__current.path);
        }
      }
    }
  });

  removePaths.forEach(function(path) {
    var i, ref = ast;
    for (i = 0; i < path.length - 1; i++) {
      ref = ref[path[i]];
    }
    if (typeof path[i] === 'string') {
      delete ref[path[i]];
    } else if (typeof path[i] === 'number') {
      ref.splice(path[i], 1);
    }
  });
}

function renameRequire(ast, filePath, opts) {
  var aliasMap = {},
    addAlias = function(alias) { if (alias) { _.assign(aliasMap, alias); } },
    delAlias = function(alias) { if (alias) { aliasMap = _.omit(aliasMap, _.keys(alias)); } };

  // rename required module
  estraverse.traverse(ast, {
    enter: function(node, parent) {
      addAlias(node._alias);

      var i, id, param, t;
      // 函数中的参数如果包含有 alias 的话，则之后出现的 alias 全部忽略
      if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
        for (i = 0; i < node.params.length; i++) {
          param = node.params[i];
          if (param.type === 'Identifier' && ((id = param.name) in aliasMap)) {
            t = node._unalias || {};
            t[id] = aliasMap[id];
            node._unalias = t;
          }
        }
        delAlias(node._unalias);

        // 如果在某个 block 中重新定义了 alias，则其 parent 之后出现的 alias 全部忽略
      } else if (node.type === 'VariableDeclaration') {
        for (i = 0; i < node.declarations.length; i++) {
          param = node.declarations[i];
          if (param.id && param.id.type === 'Identifier' && ((id = param.id.name) in aliasMap)) {
            t = parent._unalias || {};
            t[id] = aliasMap[id];
            parent._unalias = t;
          }
        }
        delAlias(parent._unalias);
      }

      if (node.type === 'Identifier' && (node.name in aliasMap)) {
        node.name = opts.global + '.' + aliasMap[node.name];
      }
    },

    leave: function(node, parent) {
      delAlias(node._alias);
      addAlias(node._unalias);
    }
  });
}

var wrap = {
  'type': 'ExpressionStatement',
  'expression': {
    'type': 'CallExpression',
    'callee': {
      'type': 'FunctionExpression',
      'id': null,
      'params': [],
      'defaults': [],
      'body': {
        'type': 'BlockStatement',
        'body': [/* wrapped content */]
      },
      'generator': false,
      'expression': false
    },
    'arguments': []
  }
};

function removeExport(ast, filePath, opts) {
  var bodyNodes = ast.body, node, obj, prop, i, statCount = 0, exportCount = 0, exportMember, exportGlobal = false;

  var exp = rename(filePath, opts);

  for (i = 0; i < bodyNodes.length; i++) {
    node = bodyNodes[i];

    statCount++;

    if (node.type === 'ExpressionStatement' && node.expression && node.expression.type === 'AssignmentExpression') {
      node = node.expression.left;

      if (node && node.type === 'MemberExpression') {
        obj = node.object;
        prop = node.property;
        exportMember = false;

        // exports.foo => module.exports.foo
        if (obj.type === prop.type && obj.type === 'Identifier' && obj.name === 'exports') {
          obj = node.object = {
            type: 'MemberExpression',
            computed: false,
            object: {type: 'Identifier', name: 'module'},
            property: {type: 'Identifier', name: 'exports'}
          };
        }

        if (obj.type === 'MemberExpression' && prop.type === 'Identifier') {
          exportMember = prop.name;
          prop = obj.property;
          obj = obj.object;
        }

        if (obj.type === prop.type && obj.type === 'Identifier' && obj.name === 'module' && prop.name === 'exports') {
          obj.name = opts.global;
          prop.name = exp;

          exportCount++;

          if (!exportMember) {
            exportGlobal = true;
          }
        }
      }
    }
  }

  // 如果 exportGlobal 为 false 的话，要加上 G.exp = {} 的声明
  if (!exportGlobal && exportCount) {
    bodyNodes.unshift({
      'type': 'ExpressionStatement',
      'expression': {
        'type': 'AssignmentExpression',
        'operator': '=',
        'left': {
          'type': 'MemberExpression',
          'computed': false,
          'object': {
            'type': 'Identifier',
            'name': opts.global
          },
          'property': {
            'type': 'Identifier',
            'name': exp
          }
        },
        'right': {
          'type': 'ObjectExpression',
          'properties': []
        }
      }
    });
  }

  // wrap content
  if (statCount > exportCount) {
    var wrapClone = _.cloneDeep(wrap);
    ast.body = [wrapClone];
    wrapClone.expression.callee.body.body = bodyNodes;
  }
}

module.exports = function(filePath, opts, saveExport) {

  //filePath = path.normalizePathSeparate(path.resolve(filePath));
  opts = opts || {};
  opts.global = opts.global || 'G';

  var ast = helper.getFileAST(filePath, true);

  //require('fs').writeFile(filePath.replace(/\.js$/, '.json'), JSON.stringify(ast, null, 2));

  removeRequire(ast, filePath, opts);

  renameRequire(ast, filePath, opts);

  if (!saveExport) {
    removeExport(ast, filePath, opts);
  }

  return escodegen.generate(ast);
};
