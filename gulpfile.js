const gulp = require("gulp");
const gutil = require("gulp-util");
const inject = require("gulp-inject");
const htmlMin = require("gulp-htmlmin");

const cssMinifyOptions = true;
const jsMinifyOptions = {
  mangle: {
    toplevel: true,
  },
  output: {
    quote_style: 1,
  },
};

const htmlMinifyOptions = {
  collapseWhitespace: true,
  quoteCharacter: "'",
  removeComments: true,
  minifyCSS: cssMinifyOptions,
  minifyJS: jsMinifyOptions,
};

const htmlStream = gulp.src("index.html").pipe(htmlMin(htmlMinifyOptions));

gulp.task("default", function () {
  return gulp
    .src("./minifyhtml.h")
    .pipe(
      inject(htmlStream, {
        starttag: "// inject:html",
        endtag: "// endinject",
        transform: function (filePath, file) {
          const ecscapedContents = file.contents
            .toString("utf8")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n");

          gutil.log(
            "Minified HTML length",
            gutil.colors.magenta(ecscapedContents.length)
          );

          // Split into 78 char lines, ensure lines don't tail with an odd number of backslashes
          let lines = [];
          const MAX_LINE_LENGTH = 78;
          while (lines.join().length < ecscapedContents.length - 2) {
            let line = ecscapedContents.slice(
              lines.join().length,
              lines.join().length + MAX_LINE_LENGTH - 1
            );
            const tailingBackslashes = line.match(/\\+$/);
            // check if trailing backslashes is an odd number
            if (tailingBackslashes && tailingBackslashes[0].length & 1) {
              line = line.slice(0, MAX_LINE_LENGTH - 2);
            }
            lines.push(line);
          }

          let output =
            lines
              .map(function (line) {
                return '"' + line + '"';
              })
              .join("\n") +
            "\n// Length: " +
            ecscapedContents.length;
            
          console.log(output);

          return output;
        },
      })
    )
    .pipe(gulp.dest("."));
});
