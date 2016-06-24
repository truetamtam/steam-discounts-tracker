var gulp = require('gulp');
var notifier = require('node-notifier');
var jsdom = require('jsdom');
var jf = require('jsonfile');
var gutil = require('gulp-util');
var argv = require('yargs')
    .default('each', 1)
    .argv;

var games = jf.readFileSync("watch/games.json");


init();

gulp.task("watch", function () {
    observe();
    setInterval(observe, eachMinutes(argv.each));
});

function observe() {
    gutil.log('Check all games pages.');
    games.forEach(function(game) {
        checkGamePage(game);
    });
}

function checkGamePage(game) {
    jsdom.env(
      game.url,
      ["http://code.jquery.com/jquery.js"],
      function (err, window) {
        var parsedPercent = parseInt(window.$(".discount_pct").html(), 10);
        game.currentPercent = parsedPercent;
        checkGamePercent(game);

        // write games.json file
        jf.writeFileSync("watch/games.json", games);
      }
    );
}

function checkGamePercent(game) {
    gutil.log(gutil.colors.yellow('Check game page: ' + game.title));
    if(game.currentPercent < game.minimumPercent) {
        notifier.notify({
          title: game.title,
          message: "Скидка: " + game.currentPercent + "%"
        });
    }
    gutil.log('Minimum percent: ' + gutil.colors.blue(game.minimumPercent));
    gutil.log('Current percent: ' + gutil.colors.green(game.currentPercent));
}

function eachMinutes(minutes) {
    return 1000 * 60 * minutes;
}

function init() {
    if(argv.each < 1) {
      gutil.log('Argument "each minutes" must be more than 1');
      process.exit();
    }
}

gulp.task('default', ['watch']);

gulp.task('help', function() {
    console.log('arguments:');
    console.log('--each=[int]');
});