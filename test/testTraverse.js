var should = require('should'),
  path = require('path'),
  _ = require('lodash'),
  traverse = require('../src/lib/traverse');

describe('traverse', function () {
  var join = path.join,
    root = join(__dirname, 'res');

  describe('#errors', function() {
    it('should throw IllegalRequireCallExpression error', function() {
      (function() {traverse(join(root, 'err', 'IllegalRequireCallExpression.js'))}).should.throw(Error);
    });

    it('should throw IllegalLiteralArgument error', function() {
      (function() {traverse(join(root, 'err', 'IllegalLiteralArgument.js'))}).should.throw(Error);
    });

    it('should throw RequiredFileNotFound error', function() {
      (function() {traverse(join(root, 'err', 'RequiredFileNotFound.js'))}).should.throw(Error);
    });

    it('should throw RequiredFileNotFound error', function() {
      (function() {traverse(join(root, 'err', 'RequiredFileNotFound2.js'))}).should.throw(Error);
    });

    it('should throw RequiredFileNotFound error', function() {
      (function() {traverse(join(root, 'err', 'RequiredFileNotFound3.js'))}).should.throw(Error);
    });
  });


  describe('#cache feature', function() {
    before(function() {
      this.mainFile = join(root, 'abc.js');
      this.items = traverse(this.mainFile);

      this.moduleRoot = join(__dirname, 'res', 'node_modules');
      this.moduleAsFile = join(this.moduleRoot, 'a', 'a.js');
      this.moduleBsFile = join(this.moduleRoot, 'b', 'index.js');
      this.moduleCsFile = join(this.moduleRoot, 'c', 'index.js');

      var eBase = join('node_modules', 'e', 'e.js');
      this.moduleAEsFile = join(this.moduleRoot, 'a', eBase);
      this.moduleBEsFile = join(this.moduleRoot, 'b', eBase);
      this.moduleCEsFile = join(this.moduleRoot, 'c', eBase);
    });

    after(function() {
      this.items = null;
    });

    it('should cache same name and version\'s sub module', function () {
      // module a, b, c all required module e, but module c required one different version module e
      var self = this;
      this.items.should.have.length(1);
      this.items[0].deepDepends.should.containEql(self.moduleAEsFile);
      this.items[0].deepDepends.should.not.containEql(self.moduleBEsFile);
      //_.find(this.items, {value: self.moduleAsFile}).deepDepends.should.containEql(self.moduleAEsFile);
      //_.find(this.items, {value: self.moduleBsFile}).deepDepends.should.containEql(self.moduleAEsFile);
      //_.find(this.items, {value: self.moduleCsFile}).deepDepends.should.containEql(self.moduleCEsFile);
    });
  });

});