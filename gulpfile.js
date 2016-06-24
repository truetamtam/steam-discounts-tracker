var gulp = require('gulp');
var notifier = require('node-notifier');
var jsdom = require('jsdom');
var jf = require('jsonfile');

var games = jf.readFileSync("watch/games.json");


gulp.task("watch", function () {
    observe();
    setInterval(observe, 30000);
});

function observe() {
    console.log('Check all games pages.');
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
    console.log('Check game page: ' + game.title);
    if(game.currentPercent < game.minimumPercent) {
        notifier.notify({
          title: game.title,
          message: "Скидка: " + game.currentPercent + "%"
        });
    }
    console.log('Minimum percent: ' + game.minimumPercent);
    console.log('Current percent: ' + game.currentPercent);
}

gulp.task('default', ['watch']);