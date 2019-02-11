const gulp = require('gulp');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminPngQuant = require ('imagemin-pngquant');
const imageminJpegtran  = require ('imagemin-jpegtran');
const imageminMozjpeg = require('imagemin-mozjpeg');

const jpegtran = exports.jpegtran = function jpegtran() {
  return gulp.src('./images/*')
    .pipe(imagemin([
      imageminJpegtran(),
    ]))
    .pipe(rename({
      suffix: '-jpegtran',
    }))
    .pipe(gulp.dest('build/jpegtran'))
};

const jpegtranprogressive = exports.jpegtranprogressive = function jpegtranprogressive() {
  return gulp.src('./images/*')
    .pipe(imagemin([
      imageminJpegtran({ progressive: true }),
    ]))
    .pipe(rename({
      suffix: '-jpegtran-progressive',
    }))
    .pipe(gulp.dest('build/jpegtran-progressive'))
};

const recompresslow = exports.recompresslow = function recompresslow() {
  return gulp.src('./images/*')
    .pipe(imagemin([
      imageminJpegRecompress({
        min: 40,
        max: 85,
        quality: 'low',
      }),
    ]))
    .pipe(rename({
      suffix: '-recompress-low',
    }))
    .pipe(gulp.dest('build/recompress-low'))
};

const recompressmedium = exports.recompressmedium = function recompressmedium() {
  return gulp.src('./images/*')
    .pipe(imagemin([
      imageminJpegRecompress({
        min: 60,
        max: 85,
        quality: 'medium',
      }),
    ]))
    .pipe(rename({
      suffix: '-recompress-medium',
    }))
    .pipe(gulp.dest('build/recompress-medium'))
};

const pngquant = exports.pngquant = function pngquant() {
  return gulp.src('./images/*')
    .pipe(imagemin([
      imageminPngQuant({
        speed: 1,
        quality: [.6, .8],
      }),
    ]))
    .pipe(rename({
      suffix: '-pngquant',
    }))
    .pipe(gulp.dest('build/pngquant'))
};

const mozjpeglow = exports.mozjpeglow = function mozjpeglow() {
  return gulp.src('./images/*')
    .pipe(imagemin([
      imageminMozjpeg({
        quality: 80,
      }),
    ]))
    .pipe(rename({
      suffix: '-mozjpeg-low',
    }))
    .pipe(gulp.dest('build/mozjpeg-low'))
};

const mozjpeg = exports.mozjpeg = function mozjpeg() {
  return gulp.src('./images/*')
    .pipe(imagemin([
      imageminMozjpeg({
        quality: 95,
      }),
    ]))
    .pipe(rename({
      suffix: '-mozjpeg',
    }))
    .pipe(gulp.dest('build/mozjpeg'))
};

exports.default = gulp.parallel(
  recompresslow, 
  recompressmedium, 
  jpegtran, 
  jpegtranprogressive,
  mozjpeg,
  mozjpeglow,
)
