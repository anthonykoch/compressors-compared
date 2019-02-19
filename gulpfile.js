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
    .pipe(rename(createPath('.[jpegtran]')))
    .pipe(gulp.dest('build/jpegtran'))
};

const jpegtranprogressive = exports.jpegtranprogressive = function jpegtranprogressive() {
  return gulp.src('./images/*')
    .pipe(imagemin([
      imageminJpegtran({ progressive: true }),
    ]))
    .pipe(rename(createPath('.[jpegtran-progressive]')))
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
    .pipe(rename(createPath('.[recompress-low]')))
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
    .pipe(rename(createPath('.[recompress-medium]')))
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
    .pipe(rename(createPath('.[pngquant]')))
    .pipe(gulp.dest('build/pngquant'))
};

const mozjpegmedium = exports.mozjpegmedium = function mozjpegmedium() {
  return gulp.src('./images/*')
    .pipe(imagemin([
      imageminMozjpeg({
        quality: 80,
      }),
    ]))
    .pipe(rename(createPath('.[mozjpeg-medium]')))
    .pipe(gulp.dest('build/mozjpeg-medium'))
};

const mozjpeg = exports.mozjpeg = function mozjpeg() {
  return gulp.src('./images/*')
    .pipe(imagemin([
      imageminMozjpeg({
        quality: 95,
      }),
    ]))
    .pipe(rename(createPath('.[mozjpeg]')))
    .pipe(gulp.dest('build/mozjpeg'))
};

exports.default = gulp.parallel(
  recompresslow, 
  recompressmedium, 
  jpegtran, 
  jpegtranprogressive,
  mozjpeg,
  mozjpegmedium,
)

const createPath = (name) => (path) => {
  path.basename = path.basename.replace(/\.\[original\]/, '')
  path.basename += name
}
