var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var path = require('path');
var http = require('http');
var st = require('st');
var moment = require('moment');

// --------------------------------
// JavaScript packing
gulp.task('js', function () {
  return gulp.src("./src/js/index.js")
    .pipe(plugins.webpack( require('./webpack.config.js') ))
    .pipe(gulp.dest('./dist/js/'))
    .pipe(plugins.livereload());
});

// --------------------------------
// PostCSS
function compileCSS(debug) {
  gulp.src('./node_modules/highlight.js/styles/tomorrow.css')
    .pipe(gulp.dest('./dist/css/'))

  var processors = [require('cssnext')()];

  return gulp.src('./src/css/**/*.css')
    .pipe(plugins.debug())
    .pipe(plugins.if(debug, plugins.sourcemaps.init()))
    .pipe(plugins.postcss(processors))
    .pipe(plugins.if(debug, plugins.sourcemaps.write()))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(plugins.livereload());
}

gulp.task('css-debug', function () {
  return compileCSS(true);
});

gulp.task('css', function () {
  return compileCSS();
});

// --------------------------------
// Generate markup

function generateIndex() {
  return gulp.src('./src/jade/index.jade')
    .pipe(plugins.jade())
    .pipe(gulp.dest('./dist/'))
    .pipe(plugins.livereload());
}

function highlightCode(code, lang) {
  if (lang) {
    return require('highlight.js').highlight(lang, code, true).value;
  } else {
    return require('highlight.js').highlightAuto(code).value;
  }
}

function layoutDiary(file) {
  var name = path.basename(file.path).replace(path.extname(file.path), '');
  var date = moment(new Date(name));
  if (!date.isValid()) {
    return {
      layout: './src/jade/layout/plain-layout.jade',
      data_lang: 'en',
      title: name
    }
  } else if (name.length > 7) {   // full date
    return {
      layout: './src/jade/layout/diary-layout.jade',
      data_lang: 'en',
      title: date.format('MMMM D, YYYY')
    }
  } else {  // month summary
    return {
      layout: './src/jade/layout/month-layout.jade',
      data_lang: 'en',
      title: date.format('MMMM, YYYY')
    }
  }
}

function generateDiary(layout) {
  return gulp.src('./diary/**/*.md')
    .pipe(plugins.if(!layout,
      plugins.changed('./dist/', {extension: '.html'})))
    .pipe(plugins.debug())
    .pipe(plugins.markdown({ highlight: highlightCode }))
    .pipe(plugins.layout(layoutDiary))
    .pipe(gulp.dest('./dist/'))
    .pipe(plugins.livereload());
}

gulp.task('markup', function() {
  generateIndex();
  generateDiary();
});

gulp.task('relayout', function() {
  generateIndex();
  generateDiary(true);
});

// watch
gulp.task('watch', ['server'], function() {
  plugins.livereload.listen({ basePath: 'dist' });
  gulp.watch(['./diary/**/*.md'], ['markup']);
  gulp.watch(['./src/jade/**/*.jade'], ['relayout']);
  gulp.watch('./src/css/**/*.css', ['css']);
  gulp.watch([ 'webpack.config.js', './src/js/**/*.js'], ['js']);
});

gulp.task('build-debug', ['js','markup', 'css-debug']);
gulp.task('build', ['js','markup', 'css']);

// Launch server
gulp.task('server', ['build-debug'], function(done) {
  http.createServer(
    st({
      path: __dirname + '/dist',
      url: '/diary',
      index: 'index.html',
      cache: false }
    )
  ).listen(8000, done);
  console.log('Server listening on http://localhost:8000/diary/')
});

gulp.task('deploy', ['build'], function() {
  return gulp.src('./dist/**/*')
    .pipe(plugins.ghPages());
});

gulp.task('default', ['server', 'watch']);
