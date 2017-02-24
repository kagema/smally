// variables
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    concat = require('gulp-concat'),
    compass = require('gulp-compass')
    browserify = require('gulp-browserify'),
    runSequence = require('run-sequence'),
    plumber = require('gulp-plumber'),
    connect = require('gulp-connect'),
    cReload = connect.reload,
    del = require('del'),
    jade = require('gulp-jade'),
    pug = require('gulp-pug'),
    jsonminify = require('gulp-jsonminify'),
    filesize = require('gulp-filesize'),
    notify = require('gulp-notify'),
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    pngcrush = require('imagemin-pngcrush'),
    chalk = require('chalk');

var env,
  jadeSrc,
  jadeStyle,
  sassSrc,
  htmlSrc,
  sassStyle,
  jsonSrc,
  imagesSrc,
  outputDir;

env = process.env.NODE_ENV || 'development';
// env = process.env.NODE_ENV || 'production';

if (env === 'development') {
  outputDir = 'builds/development/';
  sassStyle = 'expanded';
  jadePretty = true;
} else {
  outputDir = 'builds/production/';
  sassStyle = 'compressed';
  jadePretty = false;
}

jsSrc = [
    'components/js/script.js',
];

htmlSrc = [
    'builds/development/index.html'
];

sassSrc = [
    'components/scss/*.{scss,sass}'
];

jadeSrc = [
    'components/jade/index.jade'
];

jsonSrc = [
    'builds/development/js/*.json'
];

imagesSrc = [
  'builds/development/images/*.{jpg,jpeg,svg,png}'
];

gulp.task('connect', function () {
  connect.server({
    root: outputDir,
    livereload: true
  });
});

gulp.task('images', function () {
  gulp.src(imagesSrc)
    .pipe(gulpif(env === 'production', imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngcrush()]
    })))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
    .pipe(connect.reload())
});

// gulp.task('coffee', function() {
//   gulp.src(coffeeSrc)
//     .pipe(coffee({ bare:true })
//       .on('error', gutil.log))
//     .pipe(gulp.dest('components/js'));
// });

gulp.task('js', function() {
  gulp.src(jsSrc)
    .pipe(concat('script.js'))
    .pipe(browserify())
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest( outputDir + 'js' ))
    .pipe(connect.reload())
});

gulp.task('json', function () {
  gulp.src(jsonSrc)
    .pipe(gulpif(env === 'production', jsonminify()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'js')))
    .pipe(connect.reload())
})

gulp.task('jade', function () {
  gulp.src(jadeSrc)
    .pipe(pug({
      pretty: jadePretty
    })
      .on('error', gutil.log))
    .pipe(gulp.dest(outputDir))
    .pipe(connect.reload())
});

gulp.task('html', function() {
  gulp.src(htmlSrc)
    .pipe(connect.reload())
})

gulp.task('sass', function() {
  gulp.src(sassSrc)
    .pipe(compass({
      sass: 'components/scss',
      image: outputDir + 'images',
      style: sassStyle
    }))
      .on('error', gutil.log)
    .pipe(gulp.dest( outputDir + 'css' ))
    .pipe(connect.reload())
});

gulp.task('watch', function() {
  gulp.watch(jadeSrc, ['jade']);
  // gulp.watch(coffeeSrc, ['coffee']);
  gulp.watch(jsSrc, ['js']);
  gulp.watch(sassSrc, ['sass']);
  gulp.watch(jsonSrc, ['json']);
  gulp.watch(imagesSrc, ['images']);
  gulp.watch(htmlSrc, ['html']);
});

gulp.task('clean', function () {
  del(['builds/production/**', '!builds/production']);
});

gulp.task('default', ['jade', 'json', 'html',  'js', 'sass', 'images', 'connect', 'watch']);
