const Nightmare = require('nightmare');
const blessed = require('blessed');
const delay = require('delay');

function fetchPlayByPlay(gameUrlCode) {
  const nightmare = Nightmare();

  return nightmare
    .goto(`https://watch.nba.com/game/${gameUrlCode}`)
    .click('.play-by-play')
    .click('.filter-buttons .all')
    .evaluate(() => {
      const away = {
        team: document.querySelector('.game-away').getAttribute('data-id'),
        score: document.querySelector('.game-score .away-score').innerText,
      };

      const home = {
        team: document.querySelector('.game-home').getAttribute('data-id'),
        score: document.querySelector('.game-score .home-score').innerText,
      };

      const isFinal =
        document.querySelector('.game-score .game-state').innerText === 'Final';

      const $infos = document.querySelectorAll(
        '.playbyplay-content .items .player-right'
      );

      const plays = [].slice.apply($infos).map($info => $info.innerText);

      return {
        away,
        home,
        plays,
        isFinal,
      };
    })
    .end();
}

module.exports = async function watchGame(gameUrlCode, duration = 30000) {
  gameUrlCode = '20170601/CLEGSW'; // Test..
  // Create a screen object.
  const screen = blessed.screen({
    smartCSR: true,
  });

  screen.title = gameUrlCode;

  // Create a box perfectly centered horizontally and vertically.
  const box = blessed.box({
    top: 'center',
    left: '0',
    width: '70%',
    height: '100%',
    tags: true,
    border: {
      type: 'line',
    },
    style: {
      fg: 'white',
      bg: 'magenta',
      border: {
        fg: '#f0f0f0',
      },
    },
  });

  // Append our box to the screen.
  screen.append(box);

  // Quit on Escape, q, or Control-C.
  screen.key(['escape', 'q', 'C-c'], () => {
    return process.exit(0);
  });

  // Focus our element.
  box.focus();

  // Render the screen.
  screen.render();

  while (true) {
    const { away, home, plays, isFinal } = await fetchPlayByPlay(gameUrlCode);
    box.setContent(plays.join('\n'));
    screen.render();
    playsCount = plays.length;
    await delay(duration);
  }
};
