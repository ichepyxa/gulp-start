const { src, dest, watch, parallel, series } = require('gulp')
const concat = require('gulp-concat')
const imagemin = require('gulp-imagemin')
const uglify = require('gulp-uglify-es').default
const autoprefixer = require('gulp-autoprefixer')
const browserSync = require('browser-sync').create()
const scss = require('gulp-sass')(require('sass'))
const del = require('del')

function browserSyncOnChange() {
	browserSync.init({
		server: {
			baseDir: './app/',
		},
	})
}

function cleanDist() {
	return del('./dist')
}

function images() {
	return src('./app/images/**/*')
		.pipe(
			imagemin([
				imagemin.gifsicle({ interlaced: true }),
				imagemin.mozjpeg({ quality: 75, progressive: true }),
				imagemin.optipng({ optimizationLevel: 5 }),
				imagemin.svgo({
					plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
				}),
			])
		)
		.pipe(dest('./dist/images'))
}

function scripts() {
	return src(['./app/js/**/*.js', '!./app/js/main.min.js'])
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(dest('./app/js'))
		.pipe(browserSync.stream())
}

function styles() {
	return src(['./app/scss/**/*.scss'])
		.pipe(scss({ outputStyle: 'compressed' }))
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 10 version'],
				grid: true,
			})
		)
		.pipe(concat('style.min.css'))
		.pipe(dest('./app/css'))
		.pipe(browserSync.stream())
}

function build() {
	return src(
		[
			'./app/css/style.min.css',
			'./app/fonts/**/*',
			'./app/js/main.min.js',
			'./app/**/*.html',
		],
		{ base: './app' }
	).pipe(dest('./dist'))
}

function watching() {
	watch(['./app/js/**/*.js', '!./app/js/main.min.js'], scripts)
	watch(['./app/scss/**/*.scss'], styles)
	watch(['./app/**/*.html']).on('change', browserSync.reload)
}

exports.styles = styles
exports.scripts = scripts
exports.watching = watching
exports.browserSync = browserSyncOnChange
exports.images = images
exports.cleanDist = cleanDist

exports.build = series(cleanDist, images, build)
exports.default = parallel(styles, scripts, browserSyncOnChange, watching)
