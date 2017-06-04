const Nightmare = require('nightmare');
const delay = require('delay');

function fetchPlayByPlay(date, matchup) {
  const nightmare = Nightmare();

  return nightmare
    .goto(`https://watch.nba.com/game/${date}/${matchup}`)
    .click('.play-by-play')
    .click('.filter-buttons .all')
    .evaluate(() => {
      const $infos = document.querySelectorAll(
        '.playbyplay-content .items .player-right'
      );
      return [].slice.apply($infos).map($info => $info.innerText).reverse();
    })
    .end();
}

module.exports = async function watchGame(date, matchup, duration = 30000) {
  let playsCount = 0;

  while (true) {
    const plays = await fetchPlayByPlay(date, matchup);
    console.log(plays.filter((play, i) => i >= playsCount).join('\n'));
    playsCount = plays.length;
    await delay(duration);
  }
};
