var assert = require('assert');
var sassCompare = require('../index');

describe('Sass Convert', function() {
  it('compares the CSS output of Ruby Sass and Libsass', function(done) {
    this.timeout(0);

    sassCompare({
      input: './test/fixtures/test.scss'
    }, done);
  });
});
