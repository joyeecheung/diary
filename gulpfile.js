var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var path = require('path');
var http = require('http');
var st = require('st');
var moment = require('moment');

// PostCSS
gulp.task('css', function () {
  var processors = [
    require('autoprefixer-core')({browsers: ['last 1 version']}),
    require('css-mqpacker'),
    require('csswring')
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
    .pipe(gulp.dest('./dist/css/'));

  return gulp.src('./diary/**/*.md').pipe(plugins.markdown({
      highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value;
      }
    }))
    .pipe(plugins.layout(function(file) {
      var name = path.parse(file.path).name;
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
    }))
    .pipe(gulp.dest('./dist/'))
    .pipe(plugins.livereload());
});

// watch
gulp.task('watch', ['server'], function() {
  plugins.livereload.listen({ basePath: 'dist' });
  gulp.watch(['./diary/**/*.md', './src/jade/**/*.jade'], ['markup']);
  gulp.watch('./src/css/**/*.css', ['css']);
});

gulp.task('build', ['markup', 'css']);

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
    .pipe(plugins.ghPages());
});

gulp.task('default', ['server', 'watch']);
