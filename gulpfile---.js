const {
    src,
    dest,
    parallel,
    series,
    watch
} = require('gulp');

// Load plugins

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
// const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');
const browsersync = require('browser-sync').create();
const inject = require('gulp-inject');


///// put path to css,js in html
function combine() {
    const sources = gulp.src(['./dist/**/*.js', './dist/**/*.css'], {read: false});
    const target = gulp.src('./index.html');
    return target.pipe(inject(sources))
     .pipe(gulp.dest('./dist'));
}

// Clean assets

function clear() {
    return src('./dist/*', {
            read: false
        })
        .pipe(clean());
}

// JS function 

function js() {
    const source = './src/js/*.js';

    return src(source)
        .pipe(changed(source))
        .pipe(concat('bundle.js'))
        .pipe(uglify())
        .pipe(rename({
            extname: '.js'
        }))
        .pipe(dest('./dist/js/'))
        .pipe(browsersync.stream());
}

// CSS function 

function css() {
    const source = './src/scss/*';

    return src(source)
        .pipe(changed(source))
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(rename({
            extname: '.css'
        }))
        .pipe(cssnano())
        .pipe(dest('./dist/css/'))
        .pipe(browsersync.stream());
}

// Optimize images

function img() {
    return src('./src/img/*')
        .pipe(imagemin())
        .pipe(dest('./dist/img'));
}

// check html

function html() {
    const source = './index.html';
    return src(source)
        .pipe(dest('./dist/'))
        .pipe(browsersync.stream());
}

// Watch files

function watchFiles() {
    watch('./src/scss/*', css);
    watch('./src/js/*', js);
    watch('./src/img/*', img);
    watch('./index.html', html);
}

// BrowserSync

function browserSync() {
    browsersync.init({
        server: {
            baseDir: './'
        },
        port: 3000
    });
}


// Tasks to define the execution of the functions simultaneously or in series

exports.watch = parallel(watchFiles, browserSync);
exports.default = series(clear, parallel(js, css));
exports.combine = parallel(combine);


// -----------------------------------------------------

var replace = require('gulp-replace');
var fs = require('fs');
var removeCode = require('gulp-remove-code');
var htmlmin = require('gulp-htmlmin');

HTML_FILES = './dist/index.html';

gulp.task('clean-html', function() {
  return gulp.src(HTML_FILES, { allowEmpty: true })
    .pipe(removeCode({ production: true }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('compile-sass', function() {
  return gulp.src('./src/scss/*.scss') 
  .pipe(sass({outputStyle: 'compressed'}))                    
  .pipe(gulp.dest('./dist/css'));          
});

gulp.task('add-styles', function () {
    const sources = gulp.src(['./dist/**/*.css'], {read: false});
    const target = gulp.src('./index.html');
    return target.pipe(inject(sources))
     .pipe(gulp.dest('./dist'));
});


gulp.task('compile-js', function() {
    const source = './src/js/*.js';
    return gulp.src(source) 
    .pipe(changed(source))
        .pipe(concat('bundle.js'))
        .pipe(uglify())
        .pipe(rename({
            extname: '.js'
        }))
        .pipe(dest('./dist/js/'));        
  });
  
  gulp.task('add-js', function () {
      const sources = gulp.src(['./dist/**/*.js'], {read: false});
      const target = gulp.src('./index.html');
      return target.pipe(inject(sources))
       .pipe(gulp.dest('./dist'));
  });

function getCSSFilename(linkTag) {
  var hrefValue = /href\=\"([A-Za-z0-9/._]*)\"/g;
  var cssFilename = linkTag.match(hrefValue);
  cssFilename = cssFilename[0].replace("href=\"", "").replace("\"", "");
  return cssFilename;
}

function getJSFilename(linkTag) {
    var hrefValue = /src\=\"([A-Za-z0-9/._]*)\"/g;
    var cssFilename = linkTag.match(hrefValue);
    cssFilename = cssFilename[0].replace("src=\"", "").replace("\"", "");
    return cssFilename;
  }

gulp.task('inject-styles', function () {
  return gulp.src("./dist/index.html")
      .pipe(replace(/<link rel="stylesheet" href="[^"]*"*>/g, function(linkTag) {
          var style = fs.readFileSync(`.${getCSSFilename(linkTag)}`, 'utf8');
          return '<style>\n \t\t' + style + '\n \t</style>';
      }))
      .pipe(replace(/<script src="[^"]*"*>/g, function(linkTag) {
        var js = fs.readFileSync(`.${getJSFilename(linkTag)}`, 'utf8');
        return '<script>\n \t\t' + js + '\n \t</script>';
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('minify', () => {
    return gulp.src('./dist/*.html')
        .pipe(htmlmin({removeComments: true })) ///////, collapseWhitespace: true
      .pipe(gulp.dest('dist'));
  });

gulp.task('build', gulp.series('compile-sass', 'compile-js', 'clean-html', 'add-styles', 'add-js', 'inject-styles', 'minify'));


