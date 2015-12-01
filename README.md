# coding 
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-url]][daviddm-image] [![Code Climate][climate-image]][climate-url] [![Coverage Status][coveralls-image]][coveralls-url]

分析单个 Node 文件，解析其依赖，并将依赖及原文件合并成一个与 Node 无关的文件

* 为什么不用 [browserify](http://browserify.org/) 或 [webmake](https://github.com/medikoo/modules-webmake)?

> 因为它们编译出的文件很丑，而且添加了很多多余的代码。

## 已经有 [rollup](https://github.com/rollup/rollup) 和 [jspm](https://github.com/jspm/jspm-cli) 了，所以放弃此项目！

  
* `coding` 有什么特点？
  
> __缺点：__
>   
> * 需要遵守一定的格式来编写模块，也就是说开源的模块大部分都不适用，所以 `coding` 适合组织自己的代码，就像 [jquery](https://github.com/jquery/jquery) 一样
> * 每个模块即一个变量，会导入到全局之中，所以模块之间需要避免重名，但是支持设置 `global`，设置了的话所有变量会导入到 `global` 下
> 
> __为什么还要用它：__
> 
> * 编译后的文件相对来说好看些
> * 当你有几个文件都需要引用同一个模块时，同时这几个文件并不只针对 Node，还需要针对 Browsers 也起作用
> * 可以组织自己的一个模块库，方便引用
> * 测试也方便，可以分小模块测试


## 安装

```bash
$ npm install --save coding
```

or

```bash
$ npm install --global coding
```

## 模块编写风格

* `require`、`module` 和 `exports` 不能被重新定义，也不能创建它们的别名
* 不支持 `require('foo').bar` 的写法
* `module.exports` 应该写在最外层
* `require("xxx")` 函数中只支持字面量的字符串，不能包含变量，也不能包含任何的表达式


## 使用

In javascript:

```javascript
var coding = require('coding');
coding(filePath, options); // return compiled file content
```

When installed in global 

```bash
coding [options] <file> // Use coding --help to see more helps
```


## options

### global

Type: `string`, Default: `'G'`

模块变量的命名空间

### rename

Type: `function`, Default: `null`

根据模块的文件路径重命名模块

函数的参数为模块对应的路径，如果函数返回的不为字符串，则使用系统默认的模块名称

### addFilePathComment

Type: `boolean`, Default: `true`

在合并后的文件中添加文件路径的注释

### saveMainExport

Type: `boolean`, Default: `false`

是否保留主文件中的 `exports` 声明


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [gulp](http://gulpjs.com/).


## Reference

* [How browserify works](http://benclinkinbeard.com/posts/how-browserify-works/)
* [ECMAScript Tooling Organization](https://github.com/estools)
* [estraverse](https://github.com/estools/estraverse)
* [catharsis](https://github.com/hegemonic/catharsis) - A JavaScript parser for Google Closure Compiler and JSDoc type expressions.
* [ast-query](https://github.com/SBoudrias/AST-query) - Tentative to a simple JavaScript AST modification library
* [ast-types](https://github.com/benjamn/ast-types) - This module provides an efficient, modular, [Esprima](https://github.com/ariya/esprima)-compatible implementation of the [abstract syntax tree](http://en.wikipedia.org/wiki/Abstract_syntax_tree) type hierarchy pioneered by the [Mozilla Parser API](https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API).
* [ast-traverse](https://github.com/olov/ast-traverse) - Simple but flexible AST traversal with pre and post visitors. Works in node and browsers.



## License

Copyright (c) 2015 Zhonglei Qiu. Licensed under the MIT license.


[climate-url]: https://codeclimate.com/github/qiu8310/coding
[climate-image]: https://codeclimate.com/github/qiu8310/coding/badges/gpa.svg
[npm-url]: https://npmjs.org/package/coding
[npm-image]: https://badge.fury.io/js/coding.svg
[travis-url]: https://travis-ci.org/qiu8310/coding
[travis-image]: https://travis-ci.org/qiu8310/coding.svg?branch=master
[daviddm-url]: https://david-dm.org/qiu8310/coding.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/qiu8310/coding
[coveralls-url]: https://coveralls.io/r/qiu8310/coding
[coveralls-image]: https://coveralls.io/repos/qiu8310/coding/badge.png
