var async = require('async');
var extend = require('util')._extend;
var path = require('path');
var spawn = require('child_process').spawn;
var sass = require('node-sass');
var cssDiff = require('css-diff');
var rimraf = require('rimraf').sync;
var fs = require('fs');
var colors = require('colors');

module.exports = function(options, cb) {
  var sc = new SassCompare(options);
  sc.init(cb);
}

function SassCompare(options) {
  this.options = extend({}, options);
  this.messages = '';
}

/**
 * Kicks off the comparison process. This includes compiling CSS with both Ruby Sass and Libsass, comparing the files, and then cleaning them up.
 */
SassCompare.prototype.init = function(cb) {
  var _this = this;

  async.series([
    this.setup.bind(this),
    this.compileRuby.bind(this),
    this.compileLibsass.bind(this),
    this.compare.bind(this),
    this.cleanup.bind(this),
    this.report.bind(this)
  ], function(err, results) {
    if (err) throw err;
    cb();
  });
}

/**
 * Creates a temporary directory to store the CSS files to be compared.
 */
SassCompare.prototype.setup = function(cb) {
  fs.mkdir(path.join(process.cwd(), '.sass-compare'), cb);
}

/**
 * Deletes the `.sass-compare` and `.sass-cache` folders from the working directory.
 */
SassCompare.prototype.cleanup = function(cb) {
  rimraf(path.join(process.cwd(), '.sass-compare'));
  rimraf(path.join(process.cwd(), '.sass-cache'));
  cb();
}

/**
 * Uses Ruby Sass to compile the input Sass file to `.sass-compare/ruby.css`.
 */
SassCompare.prototype.compileRuby = function(cb) {
  var _this = this;
  var args = [this.options.input, './.sass-compare/ruby.css'];
  var time = process.hrtime();
  var rubySass = spawn('sass', args);

  rubySass.stderr.on('data', function(data) {
    console.log(data.toString());
  });

  rubySass.on('error', function(err) {
    console.log(err);
  });

  rubySass.on('close', function(code) {
    if (code !== 0) {
      console.log('Some kind of error happened.');
      return '';
    }

    var compileTime = (process.hrtime(time)[1] / 1000000).toFixed(2);
    var message = '\n    Ruby Sass took ' + compileTime + 'ms to compile.';
    _this.messages += message.green;
    cb();
  });
}

/**
 * Uses Libsass (via node-sass) to compile the input Sass file to `.sass-compare/libsass.css`.
 */
SassCompare.prototype.compileLibsass = function(cb) {
  var _this = this;
  var outputPath = path.join(process.cwd(), '.sass-compare', 'libsass.css');
  var time = process.hrtime();

  sass.render({
    file: this.options.input
  }, function(err, data) {
    if (err) {
      console.log('Libsass ran into this error:\n' + err);
      cb(err);
    }

    var compileTime = (process.hrtime(time)[1] / 1000000).toFixed(2);
    var message = '\n    Libsass took ' + compileTime + 'ms to compile.\n';
    _this.messages += message.green;

    fs.writeFile(outputPath, data.css, function() {
      cb(err, data);
    });
  });
}

/**
 * Compares the two CSS files saved to `.sass-compare`.
 */
SassCompare.prototype.compare = function(cb) {
  var _this = this;
  var filePath = path.join(process.cwd(), '.sass-compare');
  var files = [
    path.join(filePath, 'libsass.css'),
    path.join(filePath, 'ruby.css')
  ];

  cssDiff({
    files: files,
    omit: ['comment'],
    visual: true
  }).then(function(diff) {
    if (diff.different) {
      console.log(diff.visual);
      _this.messages += '\n    Found differences! Red lines show where Libsass is different.'.red;
    }
    else {
      _this.messages += '\n    No differences found.'.green;
    }

    cb();
  });
}

/**
 * TODO: pretty-print the errors, comparison, etc.
 */
SassCompare.prototype.report = function(cb) {
  console.log(this.messages + '\n');
  cb();
}
