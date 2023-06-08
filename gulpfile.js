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
const fileinclude = require('gulp-file-include');
var htmlreplace = require('gulp-html-replace');
var replace = require('gulp-replace');


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

////// include head main and footer into index.html
async function includeHTML(){
    return gulp.src([
      './index.html'
      ])
      .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
      }))
      .pipe(replace('./dist', '.'))
      .pipe(gulp.dest('./dist/'))
      .pipe(browsersync.stream());
} 


function addLinks(){
    // const sources = gulp.src(['./dist/css/*.css'], {read: false}, {ignorePath: 'app', addRootSlash: false});
    // const target = gulp.src('./dist/index.html');
    // return target.pipe(inject(sources))
    //  .pipe(gulp.dest('./dist'));

        // return gulp.src("./dist/index.html")
        //     .pipe(replace('./dist', '.'))
        //     .pipe(gulp.dest('./dist/index.html'));
        return src(['./index.html'])
            .pipe(replace('./dist', '.'))
            .pipe(dest('dist/'));
}

// Watch files

function watchFiles() {
    watch('./src/scss/*', css);
    watch('./src/js/*', js);
    watch('./src/img/*', img);
    watch(['./src/*.html'], includeHTML);
}

// BrowserSync

function browserSync() {
    browsersync.init({
        server: {
            baseDir: './dist'
        },
        port: 3000
    });
}


// Tasks to define the execution of the functions simultaneously or in series

exports.watch = parallel( includeHTML, watchFiles, browserSync);
exports.default = series(clear, parallel(js, css));


// -----------------------------------------------------

var fs = require('fs');
var removeCode = require('gulp-remove-code');
var htmlmin = require('gulp-htmlmin');

HTML_FILES = './index.html';

gulp.task('includeHTM-Build', function() {
    return gulp.src([
      './index.html'
      ])
      .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
      }))
      .pipe(gulp.dest('./dist/'));
});

gulp.task('clean-html', function() {
  return gulp.src(HTML_FILES, { allowEmpty: true })
    .pipe(removeCode({ production: true }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('compile-sass', function() {
  return gulp.src('./src/scss/*.scss') 
  .pipe(sass({outputStyle: 'compressed'}))                    
  .pipe(gulp.dest('./dist/css'));          
});

gulp.task('add-styles', function () {
    const sources = gulp.src(['./dist/**/*.css'], {read: false});
    const target = gulp.src('./dist/index.html');
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
      const target = gulp.src('./dist/index.html');
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
          var style = fs.readFileSync(`${getCSSFilename(linkTag)}`, 'utf8');
          return '<style>\n \t\t' + style + '\n \t</style>';
      }))
      .pipe(replace(/<script src="[^"]*"*>/g, function(linkTag) {
        var js = fs.readFileSync(`${getJSFilename(linkTag)}`, 'utf8');
        return '<script>\n \t\t' + js + '\n \t</script>';
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('minify', () => {
    return gulp.src('./dist/*.html')
        .pipe(htmlmin({removeComments: true })) ///////, collapseWhitespace: true
        .pipe(gulp.dest('dist'));
  });


    gulp.task('removeHtmlElements', function () {
        return gulp.src('./dist/*.html')
        .pipe(htmlreplace({ remove : '' }))
        .pipe(gulp.dest('./dist/'));
    });

gulp.task('build', gulp.series('includeHTM-Build', 'compile-sass', 'compile-js', 'inject-styles', 'removeHtmlElements', 'minify'));


// 'compile-sass', 'compile-js', 'clean-html', 'add-styles', 'add-js', 'inject-styles', 'minify'


