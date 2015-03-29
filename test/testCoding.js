'use strict';


/*
  ASSERT:
    ok(value, [message]) - Tests if value is a true value.
    equal(actual, expected, [message]) - Tests shallow, coercive equality with the equal comparison operator ( == ).
    notEqual(actual, expected, [message]) - Tests shallow, coercive non-equality with the not equal comparison operator ( != ).
    deepEqual(actual, expected, [message]) - Tests for deep equality.
    notDeepEqual(actual, expected, [message]) - Tests for any deep inequality.
    strictEqual(actual, expected, [message]) - Tests strict equality, as determined by the strict equality operator ( === )
    notStrictEqual(actual, expected, [message]) - Tests strict non-equality, as determined by the strict not equal operator ( !== )
    throws(block, [error], [message]) - Expects block to throw an error.
    doesNotThrow(block, [error], [message]) - Expects block not to throw an error.
    ifError(value) - Tests if value is not a false value, throws if it is a true value. Useful when testing the first argument, error in callbacks.

  SHOULD.JS:
    http://shouldjs.github.io/
*/

var coding = require('../');
var path = require('x-path');
var grunt = require('grunt');
var should = require('should');

describe('coding', function () {

  var join = path.join,
    root = join(__dirname, 'res', 'coding');

  it('should work', function () {
    coding(join(root, 'main.js'), {addFilePathComment: true})
      .should.be.eql(grunt.file.read(join(root, 'out-comment.js')));

    coding(join(root, 'main.js'), {addFilePathComment: false})
      .should.be.eql(grunt.file.read(join(root, 'out-no-comment.js')));
  });
});
