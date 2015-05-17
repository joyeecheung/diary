var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var autoprefixer = require('autoprefixer-core');
var mqpacker = require('css-mqpacker');
var csswring = require('csswring');

var path = require('path');
var http = require('http');
var st = require('st');

// PostCSS
gulp.task('css', function () {
  var processors = [
    autoprefixer({browsers: ['last 1 version']}),
    mqpacker,
    csswring
  ];

  return gulp.src('./src/css/**/*.css')
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.postcss(processors))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest('./dist/css/'))
    .pipe(plugins.livereload());
});

// Generate markup
gulp.task('markup', function() {
  gulp.src('./node_modules/highlight.js/styles/tomorrow.css')
    .pipe(gulp.dest('./dist/'));

  gulp.src('./diary/**/*.md', {
    base: './diary'
  }).pipe(plugins.markdown({
      highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value;
      }
    }))
    .pipe(plugins.layout({
      layout: './src/jade/layout/diary-layout.jade'
    }))
    .pipe(gulp.dest('./dist/'))
    .pipe(plugins.livereload());
});

// watch
gulp.task('watch', ['server'], function() {
  plugins.livereload.listen({ basePath: 'dist' });
  gulp.watch(['./my-tech-diary/**/*.md', './src/jade/**/*.jade'], ['markup']);
  gulp.watch('./src/css/**/*.css', ['css']);
});

gulp.task('build', ['diary', 'css']);

// Launch server
gulp.task('server', ['build'], function(done) {
  http.createServer(
    st({
      path: __dirname + '/dist',
      url: '/diary',
      index: 'index.html',
      cache: false }
    )
  ).listen(8000, done);
});

gulp.task('deploy', ['build'], function() {
  return gulp.src('./dist/**/*')
    .pipe(deploy());
});

gulp.task('default', ['server', 'watch']);
