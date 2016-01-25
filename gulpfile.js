var gulp = require('gulp');
var g = require('gulp-load-plugins')();
var gulpSync = require('gulp-sync')(gulp);
var path = require('path');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync').create();

var paths = {
    build: {
        main: './build',
        src: './build/src',
        css: './build/css',
        vendor: './build/vendor/'
    },
    sources: './src/**/*.js',
    sass: [
        './src/**/*.scss'
    ],
    scripts: [
        './src/**/*.js'
    ],
    html: [
        './src/**/*.html',
        './src/index.html'
    ],
    static: [
        './src/**/*.json',
        './src/**/*.csv',
        './src/**/*.svg',
        './src/**/*.woff',
        './src/**/*.woff2',
        './src/**/*.ttf',
        './src/**/*.png',
        './src/**/*.gif',
        './src/**/*.ico',
        './src/**/*.jpg',
        './src/**/*.eot',
        './src/index.html'
    ]
};

gulp.task('compile-sass', function() {
    return gulp.src(paths.sass)
        .pipe(g.plumber())
        .pipe(g.sourcemaps.init())
        .pipe(g.sass({
            outputStyle: 'compressed'
        }))
        .pipe(g.autoprefixer())
        .pipe(g.sourcemaps.write('.'))
        .pipe(gulp.dest(paths.build.css));
});

gulp.task('copy-static', function() {
    return gulp.src(paths.static)
    .pipe(gulp.dest(paths.build.main));
});

gulp.task('copy-js', function() {
    return gulp.src(paths.scripts.concat(paths.html))
        .pipe(gulp.dest(paths.build.src));
});

gulp.task('compile-vendor-js', function() {
    var bower = mainBowerFiles();
    var jsFilter = g.filter('**/*.js');
    var cssFilter = g.filter(['**/*.css', '**/*.ttf', '**/*.woff']);
    return gulp.src(bower)
        .pipe(jsFilter)
        .pipe(g.sourcemaps.init())
        .pipe(gulp.dest(paths.build.vendor))
        .pipe(g.concat('vendor.js'))
//        .pipe(g.uglify())
        .pipe(g.sourcemaps.write('.'))
        .pipe(gulp.dest(paths.build.main));
});

gulp.task('compile-vendor-css', function() {
    var bower = mainBowerFiles();
    var jsFilter = g.filter('**/*.js');
    var cssFilter = g.filter(['**/*.css', '**/*.ttf', '**/*.woff']);
    return gulp.src(bower)
        .pipe(cssFilter)
        .pipe(g.sourcemaps.init())
        .pipe(gulp.dest(paths.build.css))
        .pipe(g.concat('vendor.css'))
        .pipe(g.minifyCss())
        .pipe(g.sourcemaps.write('.'))
        .pipe(gulp.dest(paths.build.css));
});

gulp.task('compile-js', ['copy-js'], function() {
    console.log(paths.build.src + '/app.js')
    return gulp.src(paths.build.src + '/app.js')
        .pipe(g.plumber())
        .pipe(g.jspm(
            {
                selfExecutingBundle: true,
                minify: true
            }
        ))
        .pipe(g.rename('app.min.js'))
        .pipe(gulp.dest(paths.build.main));
});

gulp.task('build', [
    'copy-static',
    'compile-js',
    'compile-sass',
    'compile-vendor-js',
    'compile-vendor-css'
]);

var notifyRecompiled = function(recompiledElement) {
    return gulp.src(paths[recompiledElement])
        .pipe(g.notify('recompiled ' + recompiledElement));
}
gulp.task('notify-recompiled-scripts', function() {
    return notifyRecompiled('scripts');
});
gulp.task('notify-recompiled-html', function() {
    return notifyRecompiled('html');
});
gulp.task('notify-recompiled-sass', function() {
    return notifyRecompiled('sass');
});
gulp.task('notify-recompiled-static', function() {
    return notifyRecompiled('static');
});

var recompiledElement;
gulp.task('watch', function() {
    gulp.watch(paths.sass, gulpSync.sync(['compile-sass', 'notify-recompiled-sass']));
    gulp.watch(paths.scripts, gulpSync.sync(['compile-js', 'notify-recompiled-scripts']));
    gulp.watch(paths.html, gulpSync.sync(['compile-js', 'copy-static', 'notify-recompiled-html']));
    gulp.watch(paths.static, gulpSync.sync(['copy-static', 'notify-recompiled-static']));
});

gulp.task('serve', ['build'], function() {
    browserSync.init({
        server: {
            baseDir: './build'
        }
    });
    
    gulp.watch([paths.build.main + '/*.js', paths.build.main + '/*.html']).on('change', browserSync.reload);
});

gulp.task('default', ['build', 'watch', 'serve']);
