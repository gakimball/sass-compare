var assert = require('assert');
var sassCompare = require('../index');

describe('Sass Convert', function() {
  it('reports that two compiled CSS files are identical', function(done) {
    this.timeout(0);

    sassCompare({
      input: './test/fixtures/test-same.scss'
    }, done);
  });

  it('reports differences between two compiled CSS files', function(done) {
    this.timeout(0);

    sassCompare({
      input: './test/fixtures/test-different.scss'
    }, done);
  });
});
