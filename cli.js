#!/usr/bin/env node
'use strict';

var program = require('commander');
var coding = require('./');

program
  .version(require(require('path').join(__dirname, 'package.json')).version)
  .usage('[options] <file>')
  .option('--transform <process_function>', 'Transform file content', function(func) {
    try {
      func = require(func);
    } catch(e) {}

    if (typeof func === 'function') {
      return func
    }

    throw new Error('Transform should be function');
  })
  .option('-g, --global <name>', 'Global namespace')
  .option('--no-global', 'Disable global namespace')
  .option('-c, --comment', 'Add file path comment')
  .option('-e, --export', 'Save main file\'s export')
  .parse(process.argv);

if (!program.args.length) {
  program.help();
} else {
  var opts = {};

  if (typeof program.global === 'string' || program.global === false) {
    opts.global = program.global;
  }

  opts.transform = program.transform;
  opts.addFilePathComment = program.comment;
  opts.saveMainExport = program.export;

  console.log(coding(program.args[0], opts));
}
