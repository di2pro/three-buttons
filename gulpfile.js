const path = require("path");
const gulp = require("gulp");
const gulpClean = require("gulp-clean");
const gulpIf = require("gulp-if");
const sass = require("sass");
const gulpSass = require("gulp-sass")(sass);
const gulpSourcemaps = require("gulp-sourcemaps");
const gulpPlumber = require("gulp-plumber");
const gulpPostcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const browserSync = require("browser-sync").create();
const packageJson = require("./package.json");

const gulpTasks = exports;
const isProdBuild = process.env.NODE_ENV === "production";
const destPath = path.resolve(__dirname, "dist", packageJson.version);

gulpTasks.cleanDest = function cleanDest() {
  return gulp
    .src(destPath, { read: false, allowEmpty: true })
    .pipe(gulpClean());
};

gulpTasks.scss = function scss() {
  const postcssPlugins = [autoprefixer(), cssnano()];
  return gulp
    .src(path.resolve(__dirname, "src", "assets", "main.scss"))
    .pipe(gulpIf(!isProdBuild, gulpPlumber()))
    .pipe(gulpIf(!isProdBuild, gulpSourcemaps.init()))
    .pipe(gulpSass())
    .pipe(gulpIf(!isProdBuild, gulpSourcemaps.write(".")))
    .pipe(gulpIf(isProdBuild, gulpPostcss(postcssPlugins)))
    .pipe(gulp.dest(path.join(destPath, "assets")));
};

gulpTasks.copyPublic = function copyPublic() {
  return gulp
    .src(path.resolve(__dirname, "public", "**", "*"))
    .pipe(gulp.dest(destPath));
};

gulpTasks.copyRoot = function copyRoot() {
  return gulp
    .src(path.resolve(__dirname, "src", "index.html"))
    .pipe(gulp.dest(path.join(__dirname, "dist")));
};

gulpTasks.build = gulp.parallel(
  gulpTasks.scss,
  gulpTasks.copyPublic,
  gulpTasks.copyRoot
);
gulpTasks.buildClean = gulp.series(gulpTasks.cleanDest, gulpTasks.build);
gulpTasks.watch = function watch() {
  return gulp.watch(
    [
      path.join(__dirname, "src", "assets", "**", "*.scss"),
      path.join(__dirname, "public", "index.html"),
    ],
    gulpTasks.build
  );
};

gulpTasks.serve = function serve() {
  browserSync.init({
    server: {
      baseDir: path.join(__dirname, "dist"),
    },
    notify: false,
  });

  browserSync.watch(destPath).on("change", browserSync.reload);
};
gulpTasks.develop = gulp.series(
  gulpTasks.buildClean,
  gulp.parallel(gulpTasks.watch, gulpTasks.serve)
);
gulpTasks.default = gulpTasks.develop;
