let project_folder = require("path").basename(__dirname);
let source_folder = "#source";

let path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/"
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/scss/style.scss",
    allscss: source_folder + "/scss/**/.scss",
    js: source_folder + "/js/script.js",
    img: source_folder + "/img/**/*.+(jpg|png|svg|gif|ico|webp)",
    fonts: source_folder + "/fonts/*.ttf"
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.+(jpg|png|svg|gif|ico|webp)"
  },
  clean: "./" + project_folder + "/"
}

let { src, dest } = require("gulp"),
  gulp = require("gulp");
let browsersync = require("browser-sync").create();
let fileinclude = require("gulp-file-include");
let del = require("del");
let scss = require("gulp-sass");
let autoprefixer = require("gulp-autoprefixer");
let group_media = require("gulp-group-css-media-queries");
let clean_css = require("gulp-clean-css");
let rename = require("gulp-rename");
let imagemin = require("gulp-imagemin");
let ttf2woff = require("gulp-ttf2woff");
let ttf2woff2 = require("gulp-ttf2woff2");
let uglify = require("gulp-uglify-es").default;


function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    directory: true,
    notify: false
  })
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(
      group_media()
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["Last 4 versions"],
        cascade: true
      })
    )
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js() {
  return src(path.src.js)         // путь к исходникам
    .pipe(fileinclude())          // собираем подключаемые файлы скриптов в один файл
    .pipe(dest(path.build.js))    // выгружаем в конечную папку
    .pipe(
      uglify()                    // минимизируем и оптимизируем файл скриптов
    )
    .pipe(
      rename({                    // переименовываем минимизированный файл
        extname: ".min.js"
      })
    )
    .pipe(dest(path.build.js))    // выгружаем переименованный и минимизированный файл в конечную папку
    .pipe(browsersync.stream())   // обновляем браузер
}

function images() {
  return src(path.src.img)
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3 // 0 to 7
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function fonts() {
  return src(path.src.fonts)
    .pipe(dest(path.build.fonts))
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts))
    .pipe(src(path.src.fonts))
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))
}

function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

function clean(params) {
  return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(css, js, html, images, fonts));

let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;