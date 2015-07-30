var gulp = require('gulp')
  , plumber = require('gulp-plumber')
  , Promise = require('bluebird')
  , notify = require('gulp-notify')
  , jade = require('gulp-jade')
  , connect = require('gulp-connect')
  , Builder = require('systemjs-builder');

gulp.task('connect', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('views', function() {
  return gulp.src('views/index.jade').pipe(plumber({
    errorHandler: notify.onError(function(err) {
      return "Error: " + err.message;
      console.trace(err);
      this.emit('end');
    })
  })).pipe(jade({
    layout: false,
    pretty: true
  })).pipe(connect.reload()).pipe(gulp.dest('./'));

});

gulp.task('build', function() {
  var builder = new Builder();
  return builder.loadConfig('./config.js').then(function() {
    return builder.build('arborjs/main', './index.js', { 
      runtime: true
    });
  });
});

gulp.task('watch', function() {
  gulp.watch(['views/index.jade', 'js/**/*.js'], ['views', 'build']);
});

gulp.task('default', ['connect', 'watch']);
