/// <binding BeforeBuild='gulp' Clean='gulp-clean' />
// Include Gulp
var gulp = require('gulp');

// Include plugins
var plugins = require("gulp-load-plugins")({
    pattern: ['gulp-*', 'gulp.*', 'main-bower-files', 'pump'],
    replaceString: /\bgulp[\-.]/
});

// Define default destination folder
var dest = 'wwwroot/';

gulp.task('clean', function (cb) {
    plugins.pump([
        gulp.src([dest + 'css', dest + 'js', dest + 'images']),
        plugins.clean()
    ], cb);
});

gulp.task('mainJs', ['mainJsMin'], function (cb) {
    plugins.pump([
        gulp.src(plugins.mainBowerFiles().concat(['Scripts/site.js', 'bower_components/jscolor-picker/*'])),
        plugins.filter('**/*.js'),
        plugins.concat('main.js'),
        gulp.dest(dest + 'js')
    ], cb);
});

gulp.task('mainCss', ['mainCssMin', 'images', 'favicon'], function (cb) {

    // Create filter instance inside task function 
    var cssFilter = plugins.filter('**/*.css', { restore: true });
    var scssFilter = plugins.filter('**/*.scss', { restore: true });
    var cssFiles = ['Css/site.css'];

    plugins.pump([
        gulp.src(plugins.mainBowerFiles().concat(cssFiles)),
        scssFilter,
        plugins.sass().on('error', plugins.sass.logError),
        scssFilter.restore,
        cssFilter,
        plugins.order([
            "*",
            "Site.css"
        ]),
        plugins.concat('main.css'),
        gulp.dest(dest + 'css')
    ], cb);
});

gulp.task('images', function (cb) {
    var imageFilter = plugins.filter(['**/*.gif', '**/*.png']);
    var imageFiles = ['bower_components/jscolor-picker/*', 'Images/*'];

    plugins.pump([
        gulp.src(imageFiles),
        imageFilter,
        gulp.dest(dest + 'images')
    ], cb);
});

gulp.task('favicon', function (cb) {
    plugins.pump([
        gulp.src(['favicon.ico']),
        gulp.dest(dest)
    ], cb);
});

gulp.task('mainJsMin', function (cb) {
    plugins.pump([
        gulp.src(plugins.mainBowerFiles().concat(['Scripts/site.js', 'bower_components/jscolor-picker/*'])),
        plugins.filter('**/*.js'),
        plugins.concat('main.min.js'),
        plugins.uglify(),
        gulp.dest(dest + 'js')
    ], cb);
});

gulp.task('mainCssMin', function (cb) {

    // Create filter instance inside task function 
    var cssFilter = plugins.filter('**/*.css', { restore: true });
    var scssFilter = plugins.filter('**/*.scss', { restore: true });
    var cssFiles = ['Css/site.css'];

    plugins.pump([
        gulp.src(plugins.mainBowerFiles().concat(cssFiles)),
        scssFilter,
        plugins.sass().on('error', plugins.sass.logError),
        scssFilter.restore,
        cssFilter,
        plugins.cleanCss({ debug: true }, function (details) {
            console.log(details.name + ': ' + details.stats.originalSize + ' => ' + details.stats.minifiedSize + ' bytes');
        }),
        plugins.order([
            "*",
            "Site.css"
        ]),
        plugins.concat('main.min.css'),
        gulp.dest(dest + 'css')
    ], cb);
});

gulp.task('individualJs', ['individualJsMin'], function (cb) {
    plugins.pump([
        gulp.src(['Scripts/*.js', '!Scripts/site.js']),
        gulp.dest(dest + 'js')
    ], cb);
});

gulp.task('individualJsMin', function (cb) {
    plugins.pump([
        gulp.src(['Scripts/*.js', '!Scripts/site.js']),
        plugins.uglify(),
        plugins.rename({ suffix: ".min", extname: ".js" }),
        gulp.dest(dest + 'js')
    ], cb);
});

gulp.task('individualCss', ['individualCssMin'],  function (cb) {
    plugins.pump([
        gulp.src(['Css/*.css', '!Css/site.css']),
        gulp.dest(dest + 'css')
    ], cb);
});

gulp.task('individualCssMin', function (cb) {
    plugins.pump([
        gulp.src(['Css/*.css', '!Css/site.css']),
        plugins.cleanCss({ debug: true }, function (details) {
            console.log(details.name + ': ' + details.stats.originalSize + ' => ' + details.stats.minifiedSize + ' bytes');
        }),
        plugins.rename({
            suffix: ".min",
            extname: ".css"
        }),
        gulp.dest(dest + 'css')
    ], cb);
});


gulp.task('main', ['mainJs','mainCss'], function () {
});

gulp.task('individual', ['individualJs', 'individualCss'], function () {
});

gulp.task('default', ['gulp'], function () {
});

gulp.task('gulp', ['main', 'individual'], function () {
});

gulp.task('gulp-clean', ['clean'], function () {
});