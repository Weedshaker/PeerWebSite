var chai = require('chai');
var expect = chai.expect;
var dom2hscript = require('../index');
var h = require('hyperscript');
describe("dom2hscript", function() {

  describe("parseHTML()", function() {

    it("return same html from hyperscript", function() {
      var html = '<div>Hello world</div>';
      var input = dom2hscript.parseHTML(html);
      var output = eval(input);
      expect(output.outerHTML).to.be.equal(html,"Basic div");
      html = '<span>Hello world</span>';
      input = dom2hscript.parseHTML(html);
      output = eval(input);
      expect(output.outerHTML).to.be.equal(html,"Basic span");
    });

    it("not return different html from hyperscript", function() {
      var html = '<div>Hello world</div>';
      var input = dom2hscript.parseHTML(html);
      var output = eval(input);
      expect(output.outerHTML).to.not.be.equal(html + "different","Basic div");
      html = '<span>Hello world</span>';
      input = dom2hscript.parseHTML(html);
      output = eval(input);
      expect(output.outerHTML).to.not.be.equal(html + "different","Basic span");
    });

    it("should parse id from html to hyperscript", function() {
      var html = '<div id="hello">Hello world</div>';
      var input = dom2hscript.parseHTML(html);
      var output = eval(input);
      expect(output.outerHTML).to.be.equal(html);
      
    });

    it("should parse classes from html to hyperscript", function() {
      var html = '<div class="hello">Hello world</div>';
      var input = dom2hscript.parseHTML(html);
      var output = eval(input);
      expect(output.outerHTML).to.be.equal(html,"a single class");
      html = '<div class="hello world">Hello world</div>';
      input = dom2hscript.parseHTML(html);
      output = eval(input);
      expect(output.outerHTML).to.be.equal(html,"multiple classes");
      
    });

    it("should parse styles from html to hyperscript", function() {
      var html = '<div style="color: red; ">Hello world</div>';
      var input = dom2hscript.parseHTML(html);
      var output = eval(input);
      expect(output.outerHTML).to.be.equal(html,"a single style");
      html = '<div style="color: red; position: absolute; ">Hello world</div>';
      input = dom2hscript.parseHTML(html);
      output = eval(input);
      expect(output.outerHTML).to.be.equal(html,"multiple styles");
      var background = 'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7';
      input = dom2hscript.parseHTML('<div style="background-image: url(\'' + background + '\')">test</div>');
      output = eval(input);
      expect(output.outerHTML.indexOf(background)).to.not.equal(-1,"base64 encoded image");

    });

    it("should parse data attributes from html to hyperscript", function() {
      var html = '<div data-test="foo">Hello world</div>';
      var input = dom2hscript.parseHTML(html);
      var output = eval(input);
      expect(output.outerHTML).to.be.equal(html,"a single attribute");

    });


    it("should parse nested html to hyperscript", function() {
      var html = '<div style="color: red; "><a href="#test">Hello world</a></div>';
      var input = dom2hscript.parseHTML(html);
      var output = eval(input);
      expect(output.outerHTML).to.be.equal(html,"a single child");
      var html = '<div style="color: red; ">'+ 
        '<ul><li><a href="#test">Hello world</a></li>' + 
        '<li><a href="#test">Hello world</a></li></ul></div>';
      input = dom2hscript.parseHTML(html);
      output = eval(input);
      expect(output.outerHTML).to.be.equal(html,"multiple children");
    });

    it("should parse body tags to hyperscript", function() {
      var html = '<body><div style="color: red; "><a href="#test">Hello world</a></div></body>';
      var input = dom2hscript.parseHTML(html);
      var output = eval(input);
      expect(output.outerHTML).to.be.equal(html);
    });

    it("should ignore invalid html", function() {
      var html = '<div style="color: red; " asdasd=2><a href="#test">Hello world</a></div>';
      var input = dom2hscript.parseHTML(html);
      var output = eval(input);
      expect(output.outerHTML).to.be.equal('<div style="color: red; "><a href="#test">Hello world</a></div>',"a single child");
    });

    it("should ignore comments", function() {
      var html = '<div>Hello World<!-- Comment --></div>';
      var input = dom2hscript.parseHTML(html);
      var output = eval(input);
      expect(output.outerHTML).to.be.equal('<div>Hello World</div>',"a single child");
    });

    it("should parse document without errors", function() {
      var html = "<div>Hello \n world's fair " + '"ok"</div>';
      var input = dom2hscript.parseHTML(html);
      var output = eval(input);
    });

    

  });

});
