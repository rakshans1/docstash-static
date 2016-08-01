const gulp        = require('gulp');
const browserSync = require('browser-sync');
const sass        = require('gulp-sass');
const prefix      = require('gulp-autoprefixer');
const cp          = require('child_process');
const cleanCSS    = require('gulp-clean-css');
const uglify      = require('gulp-uglify');
const htmlmin     = require('gulp-htmlmin');
const imagemin    = require('gulp-imagemin');
const plumber = require('gulp-plumber');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build','js'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('assets/css/main.sass')
        .pipe(plumber())
        .pipe(sass.sync({
            includePaths: ['css'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('assets/css'));
});

gulp.task('js', function() {
  return gulp.src('assets/js/main.js')
    .pipe(uglify())
    .pipe(gulp.dest('assets/js/min/'));
});
gulp.task('html', function() {
  return gulp.src('_site/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('_site'))
});
gulp.task('image', () =>
    gulp.src('assets/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('assets/img/'))
);
/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('assets/css/**/*.scss', ['sass']);
    gulp.watch('assets/js/**', ['js','jekyll-rebuild']);
    gulp.watch(['*.html', '_layouts/*.html', '_includes/*.html'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);
