var gulp = require('gulp'),
    postcss = require('gulp-postcss'),
    px2rem = require('postcss-px2rem'),
    babel = require('gulp-babel'),
    less = require('gulp-less'),
    uglify = require('gulp-uglify');

gulp.task('less', function () {
    var processors = [px2rem({remUnit: 75})];
    gulp.src('./src/less/*.less')
        .pipe(less())
        .pipe(postcss(processors))
        .pipe(gulp.dest('./demo/css'));
});

gulp.task('taskES6', function () {
    gulp.src('./src/js/*.js')
        .pipe(babel({presets: ['es2015']}))
        // .pipe(uglify({ mangle: false }))
        .pipe(gulp.dest('./demo/js'));
});

gulp.task('lessWatch', function () {
    gulp.watch('./src/less/*.less', ['less']);
});

gulp.task('startWatch', function () {
    gulp.watch('./src/js/*.js', ['taskES6']);
});

gulp.task('default', ['less','lessWatch', 'taskES6', 'startWatch']);

