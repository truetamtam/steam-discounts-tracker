var gulp = require('gulp');
var notifier = require('node-notifier');
var jsdom = require('jsdom');
var jf = require('jsonfile');
var gutil = require('gulp-util');

var games = jf.readFileSync("watch/games.json");


gulp.task("watch", function () {
    observe();
    setInterval(observe, eachMinutes(5));
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

gulp.task('default', ['watch']);