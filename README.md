# Sass Compare

Sass Compare compares the CSS output of Ruby Sass and Libsass on the same `.scss` file. If you maintain a Sass codebase that has to be compatible with both, this tool will help you ensure you aren't getting screwed by minor differences in the compilers.

## Usage

You know how to install it!

```bash
npm install sass-compare --save-dev
```

Feed the compare function a Sass file and let it do the rest. It will print to the console when it's done.

```js
var sassCompare = require('sass-compare');

sassCompare({
  file: './path/to/sass.scss'
}, function() {
  // You can run a callback after the reporting is done.
});
```

## Local Development

```bash
git clone https://github.com/gakimball/sass-compare.git
cd sass-compare
npm install
npm test
```
