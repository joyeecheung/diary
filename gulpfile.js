'use strict';

const path = require('path');
const http = require('http');
const st = require('st');
const fs = require('fs');

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const merge = require('merge-stream');

const webpack = require('webpack-stream');
const Promise = require('bluebird');
const ls = Promise.promisify(require('node-dir').files);
const _ = require('lodash');
const moment = require('moment');

const config = require('./config')
const submodule = config.repo.as_submodule;
const highlight = require('highlight.js');

function getFirstAndLastFile(files) {
  let sorted = files
    .map(file => path.basename(file).split('.')[0]) // strip out dir names
    .filter(file => /\d{4}-\d{2}-\d{2}/.test(file))  // filter out articles
    .sort(); // lexical order = chronological order for ISO Date

  return {
    first: sorted[0],
    last: sorted[sorted.length - 1]
  };
}

let filePromise = ls(submodule).then(getFirstAndLastFile);

const srcPath = {
  webpackConfig: './webpack.config.js',
  webpackPlugins: './webpack.plugins.config.js',
  script: './src/scripts/',
  style: './src/styles/',
  template: './src/templates/'
};

const destPath = {
  style: './dist/styles/',
  script: './dist/scripts/',
  base: './dist/'
};

// --------------------------------
// JavaScript packing
// --------------------------------


function packjs(entry, dest, debug) {
  let webpackConfig = require(srcPath.webpackConfig);
  let p = require(srcPath.webpackPlugins);

  if (debug) {
    webpackConfig.plugins = [p.sourcemap, p.common, p.ignoreLocale];
  } else {
    webpackConfig.plugins = [p.uglify, p.common, p.ignoreLocale]
  }

  return gulp.src(entry)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(dest))
    .pipe(plugins.livereload());
}

gulp.task('js', () => packjs(srcPath.script + 'index.js', destPath.script));
gulp.task('js-debug', () => packjs(srcPath.script + 'index.js', destPath.script, true));

// --------------------------------
// PostCSS
// --------------------------------
function compileCSS(debug) {
  let theme = gulp.src('./node_modules/highlight.js/styles/tomorrow.css')
    .pipe(gulp.dest(destPath.style))

  let processors = [require('cssnext')(), require('cssnano')()];

  let css = gulp.src(srcPath.style + '**/*.css')
    .pipe(plugins.debug())
    .pipe(plugins.if(debug, plugins.sourcemaps.init()))
    .pipe(plugins.postcss(processors))
    .pipe(plugins.if(debug, plugins.sourcemaps.write()))
    .pipe(gulp.dest(destPath.style))
    .pipe(plugins.livereload());

  return merge(theme, css);
}

gulp.task('css', () => compileCSS());
gulp.task('css-debug', () => compileCSS(true));

// --------------------------------
// Generate markup
// --------------------------------

gulp.task('index', function() {
  return gulp.src(srcPath.template + 'index.jade')
    .pipe(plugins.data(filePromise.then(data => _.assign({}, config, data))))
    .pipe(plugins.jade())
    .pipe(gulp.dest(destPath.base))
    .pipe(plugins.livereload());
});

function highlightCode(code, lang) {
  if (lang) {
    return highlight.highlight(lang, code, true).value;
  } else {
    return highlight.highlightAuto(code).value;
  }
}

function layoutDiary(file) {
  let name = path.basename(file.path)
                 .replace(path.extname(file.path), '');
  let date = moment(new Date(name));

  if (!date.isValid()) {
    return _.assign({}, config, {
      layout: srcPath.template + 'layout/plain-layout.jade',
      title: name
    });
  } else if (name.length > 7) {   // full date
    return _.assign({}, config, {
      layout: srcPath.template + 'layout/diary-layout.jade',
      title: date.format('MMMM D, YYYY')
    });
  } else {  // month summary
    return _.assign({}, config, {
      layout: srcPath.template + 'layout/month-layout.jade',
      title: date.format('MMMM, YYYY')
    });
  }
}

function generateDiary(layout) {
  return gulp.src(submodule + '/**/*.md')
    .pipe(plugins.if(!layout,
      plugins.changed(destPath.base, {extension: '.html'})))
    .pipe(plugins.debug())
    .pipe(plugins.markdown({ highlight: highlightCode }))
    .pipe(plugins.layout(layoutDiary))
    .pipe(gulp.dest(destPath.base))
    .pipe(plugins.livereload());
}

gulp.task('markup', ['index'], () => generateDiary());
gulp.task('relayout', ['index'], () => generateDiary(true));

// ------------------------
//  Watch
// ------------------------
gulp.task('watch', ['server'], function() {
  plugins.livereload.listen({ basePath: destPath.base });
  gulp.watch(['./' + submodule + '/**/*.md'], ['markup']);
  gulp.watch([srcPath.template + 'index.jade'], ['index']);
  gulp.watch([srcPath.template + 'layout/*.jade'], ['relayout']);
  gulp.watch(srcPath.style + '**/*.css', ['css']);
  gulp.watch([srcPath.webpackConfig, srcPath.webpackPlugins,
              srcPath.script + '**/*.js'], ['js-debug']);
});

gulp.task('build-debug', ['js-debug','markup', 'css-debug']);
gulp.task('build', ['js','markup', 'css']);

// ------------------------
//  Launch server
// ------------------------
function serve(done) {
  http.createServer(
    st({
      path: destPath.base,
      url: '/diary',
      index: 'index.html',
      cache: false
    })
  ).listen(8000, done);
  console.log('Server listening on http://localhost:8000/diary/');
}

gulp.task('server', ['build-debug'], serve);
gulp.task('preview', ['build'], serve);

// ------------------------
//  Deploy
// ------------------------
gulp.task('deploy', ['build'], function() {
  return gulp.src(destPath.base + '**/*')
    .pipe(plugins.ghPages());
});

gulp.task('default', ['server', 'watch']);
