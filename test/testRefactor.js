var should = require('should'),
  path = require('path'),
  _ = require('lodash'),
  refactor = require('../src/lib/refactor');

describe('refactor', function () {
  var join = path.join,
    root = join(__dirname, 'res', 'refactor');

  it('simple exports', function() {
    refactor(join(root, 'fn.js')).should.be.eql('G.fn = function () {\n    return \'fn\';\n};');
    refactor(join(root, 'var.js')).should.be.eql('G.var = \'var\';');
  });

  it('config export global', function() {
    refactor(join(root, 'var.js'), {global: 'GG'}).should.be.eql('GG.var = \'var\';');
    refactor(join(root, 'var.js'), {global: 'G', rename: function() {return 'T';}}).should.be.eql('G.T = \'var\';');
    refactor(join(root, 'var.js'), {global: 'G', rename: function() {}}).should.be.eql('G.var = \'var\';');
    refactor(join(root, 'var.js'), {global: 'GG'}, true).should.be.eql("module.exports = 'var';");
  });

  it('wrap no export lines', function() {
    refactor(join(root, 'wrap-export.js')).should.be.eql("(function () {\n    var a = 'a';\n}());");
    refactor(join(root, 'wrap-export2.js')).should.be.eql("(function () {\n    G.wrapExport2 = {};\n    var a = 'a';\n    G.wrapExport2.a = a;\n}());");
    refactor(join(root, 'wrap-export3.js')).should.be.eql("(function () {\n    var a = 'a';\n    G.wrapExport3 = a;\n}());");
  });

  it('require involve', function() {
    refactor(join(root, 'req-1.js')).should.be.eql("G.req1 = G.fn(1, 2);");
    refactor(join(root, 'req-2.js')).should.be.eql("(function () {\n    var b = 'b';\n    G.req2 = G.fn(1, 2);\n}());");
    refactor(join(root, 'req-3.js')).should.be.eql("(function () {\n    function b(a) {\n        return a + 1;\n    }\n    G.req3 = G.fn;\n}());");
    refactor(join(root, 'req-4.js')).should.be.eql("(function () {\n    function b() {\n        var a = 1;\n        return a + 1;\n    }\n    G.req4 = G.fn;\n}());");
  });
});