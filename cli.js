#!/usr/bin/env node
'use strict';


var program = require('commander');
var coding = require('./');

program
  .version(require(require('path').join(__dirname, 'package.json')).version)
  .usage('[options] <file>')
  .option('-g, --global <name>', 'Global namespace')
  .option('-c, --comment', 'Add file path comment')
  .option('-e, --export', 'Save main file\'s export')
  .parse(process.argv);


if (!program.args.length) {
  program.help();
} else {
  var opts = {};
  if (program.global) {
    opts.global = program.global;
  }
  opts.addFilePathComment = program.comment;
  opts.saveMainExport = program.export;

  console.log(coding(program.args[0], opts));
}



