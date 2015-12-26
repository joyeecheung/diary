var path = require('path');
var http = require('http');
var st = require('st');
var fs = require('fs');

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var merge = require('merge-stream');

var webpack = require('webpack-stream');
var Promise = require('bluebird');
var ls = Promise.promisify(require('node-dir').files);
var _ = require('lodash');
var moment = require('moment');

var config = require('./config')
var submodule = config.repo.as_submodule;

var filePromise = ls(submodule).then(function(files) {
  var firstAndLast = getFirstAndLastFile(files);
  return {
    first: firstAndLast[0],
    last: firstAndLast[1]
  };
});

// --------------------------------
// JavaScript packing
// --------------------------------
var webpackConfigPath = './webpack.config.js';
var webpackPluginsPath = './webpack.plugins.config.js';

function packjs(entry, dest, debug) {
  var config = require(webpackConfigPath);
  var p = require(webpackPluginsPath);

  if (debug) {
    config.plugins = [p.sourcemap, p.common, p.ignoreLocale];
  } else {
    config.plugins = [p.uglify, p.common, p.ignoreLocale]
  }

  return gulp.src(entry)
    .pipe(webpack(config))
    .pipe(gulp.dest(dest))
    .pipe(plugins.livereload());
}

gulp.task('js', function () {
  return packjs("./src/js/index.js", './dist/js/');
});

gulp.task('js-debug', function () {
  return packjs("./src/js/index.js", './dist/js/', true);
});

// --------------------------------
// PostCSS
// --------------------------------
function compileCSS(debug) {
  var theme = gulp.src('./node_modules/highlight.js/styles/tomorrow.css')
    .pipe(gulp.dest('./dist/css/'))

  var processors = [require('cssnext')(), require('cssnano')()];

  var css = gulp.src('./src/css/**/*.css')
    .pipe(plugins.debug())
    .pipe(plugins.if(debug, plugins.sourcemaps.init()))
    .pipe(plugins.postcss(processors))
    .pipe(plugins.if(debug, plugins.sourcemaps.write()))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(plugins.livereload());

  return merge(theme, css);
}

gulp.task('css-debug', function () {
  return compileCSS(true);
});

gulp.task('css', function () {
  return compileCSS();
});

// --------------------------------
// Generate markup
// --------------------------------
function getFirstAndLastFile(files) {
  var sorted = files.map(function(file) {
    return path.basename(file).split('.')[0];  // strip out dir names
  }).filter(function(file) {  // filter out articles
    return /\d{4}-\d{2}-\d{2}/.test(file);
  }).sort(); // lexical order = chronological order for ISO Date

  return [sorted[0], sorted[sorted.length - 1]];
}

gulp.task('index', function() {
  return gulp.src('./src/jade/index.jade')
    .pipe(plugins.data(filePromise.then(function(data) {
        return _.assign({}, config, data);
      })))
    .pipe(plugins.jade())
    .pipe(gulp.dest('./dist/'))
    .pipe(plugins.livereload());
});

function highlightCode(code, lang) {
  if (lang) {
    return require('highlight.js').highlight(lang, code, true).value;
  } else {
    return require('highlight.js').highlightAuto(code).value;
  }
}

function layoutDiary(file) {
  var name = path.basename(file.path)
                 .replace(path.extname(file.path), '');
  var date = moment(new Date(name));

  var locals = _.assign({}, config);
  locals.data_lang = 'en';

  if (!date.isValid()) {
    locals.layout = './src/jade/layout/plain-layout.jade';
    locals.title = name;
  } else if (name.length > 7) {   // full date
    locals.layout = './src/jade/layout/diary-layout.jade';
    locals.title = date.format('MMMM D, YYYY');
  } else {  // month summary
    locals.layout = './src/jade/layout/month-layout.jade';
    locals.title = date.format('MMMM, YYYY');
  }
  return locals;
}

function generateDiary(layout) {
  return gulp.src(submodule + '/**/*.md')
    .pipe(plugins.if(!layout,
      plugins.changed('./dist/', {extension: '.html'})))
    .pipe(plugins.debug())
    .pipe(plugins.markdown({ highlight: highlightCode }))
    .pipe(plugins.layout(layoutDiary))
    .pipe(gulp.dest('./dist/'))
    .pipe(plugins.livereload());
}

gulp.task('markup', ['index'], function() {
  return generateDiary();
});

gulp.task('relayout', ['index'], function() {
  return generateDiary(true);
});

// ------------------------
//  Watch
// ------------------------
gulp.task('watch', ['server'], function() {
  plugins.livereload.listen({ basePath: 'dist' });
  gulp.watch(['./' + submodule + '/**/*.md'], ['markup']);
  gulp.watch(['./src/jade/index.jade'], ['index']);
  gulp.watch(['./src/jade/layout/*.jade'], ['relayout']);
  gulp.watch('./src/css/**/*.css', ['css']);
  gulp.watch([ 'webpack.config.js', './src/js/**/*.js'], ['js-debug']);
});

gulp.task('build-debug', ['js-debug','markup', 'css-debug']);
gulp.task('build', ['js','markup', 'css']);

// ------------------------
//  Launch server
// ------------------------
function serve(done) {
  http.createServer(
    st({
      path: __dirname + '/dist',
      url: '/diary',
      index: 'index.html',
      cache: false }
    )
  ).listen(8000, done);
  console.log('Server listening on http://localhost:8000/diary/');
}

gulp.task('server', ['build-debug'], serve);
gulp.task('preview', ['build'], serve);

// ------------------------
//  Deploy
// ------------------------
gulp.task('deploy', ['build'], function() {
  return gulp.src('./dist/**/*')
    .pipe(plugins.ghPages());
});

gulp.task('default', ['server', 'watch']);
