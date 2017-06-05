'use strict';

var gulp = require('gulp');
var connect = require('gulp-connect');
var open = require('gulp-open');
var eslint = require('gulp-eslint');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var concatCss = require('gulp-concat-css');
var cleanCSS = require('gulp-clean-css');
var less = require('gulp-less');
var path = require('path');
// var autoprefix = require('gulp-autoprefixer');
// var sourcemap = require('gulp-sourcemaps');
// var browserSync = require('browser-sync');

var config = {
    port: 9005,
    devBaseUrl: 'http://localhost',
    pathsglob: {
        html: './src/*.html',
        js: './src/**/*.js',
        css: './src/css/*.css',
        less: './src/less/*.less',
        dist: './dist',
        mainJs: './src/main.js'
    }
};

gulp.task('less', function () {
    return gulp.src(config.pathsglob.less)
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        // .pipe(gulp.dest('src/css/'))
        .pipe(concatCss("bundle.css"))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/css/'))
        .pipe(connect.reload());
});

gulp.task('concss', function () {
    return gulp.src(config.pathsglob.css)
        .pipe(concatCss("bundle.css"))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('connect', function() {
    connect.server({
        root: ['dist'],
        port: config.port,
        base: config.devBaseUrl,
        livereload: true
    })
});

gulp.task('open', ['connect'], function() {
    gulp.src('dist/index.html')
        .pipe(open({uri: config.devBaseUrl + ':' + config.port + '/'}));
});

gulp.task('html', function() {
    gulp.src(config.pathsglob.html)
        .pipe(gulp.dest(config.pathsglob.dist))
        .pipe(connect.reload());
});

gulp.task('js', function() {
    browserify(config.pathsglob.mainJs)
        .transform(reactify)
        .bundle()
        .on('error', console.error.bind(console))
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(config.pathsglob.dist + '/scripts'))
        .pipe(connect.reload())
});

// gulp.task('css', function() {
//     gulp.src(config.paths.css)
//         .pipe(gulp.dest(config.pathsglob.dist + '/css'))
//         .pipe(connect.reload())
// });

gulp.task('lint', function() {
    return gulp.src(config.pathsglob.js)
        .pipe(eslint({config: 'eslint.config.json'}))
        .pipe(eslint.format());
});

gulp.task('watch', function() {
    gulp.watch(config.pathsglob.html, ['html']);
    gulp.watch(config.pathsglob.js, ['js', 'lint']);
    gulp.watch(config.pathsglob.less, ['less']);
});

gulp.task('default', ['html', 'less', 'js', 'lint', 'open', 'watch']);
