// Less configuration
var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('less', function() {
    return gulp.src('./css/*.less')
        .pipe(less())
        .pipe(gulp.dest('./css/'));
});

gulp.task('default', function() {
    gulp.series(['less']);
    gulp.watch('./css/*.less', gulp.series(['less']));
})