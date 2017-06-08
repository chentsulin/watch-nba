const path = require('path');

const Nightmare = require('nightmare');
const blessed = require('blessed');
const delay = require('delay');
const leftPad = require('left-pad');

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

function createBox(left) {
  return blessed.box({
    top: '0',
    left,
    width: '35%',
    height: '100%',
    tags: true,
    scrollable: true,
    scrollbar: true,
    mouse: true,
    border: {
      type: 'line',
    },
    style: {
      fg: 'white',
      bg: 'black',
      border: {
        fg: '#f0f0f0',
      },
      scrollbar: {
        bg: 'blue',
      },
    },
  });
}

function getRenderContent(plays, info) {
  return plays
    .map(play => (play.indexOf(info.team) !== -1 ? play.trim() : ''))
    .join('\n');
}

module.exports = async function watchGame(gameUrlCode, duration = 30000) {
  // gameUrlCode = '20170601/CLEGSW'; // Test..
  // Create a screen object.
  const screen = blessed.screen({
    smartCSR: true,
  });

  screen.title = gameUrlCode;

  // Create two box
  const awayBox = createBox('0');
  const homeBox = createBox('35%');

  // Append our box to the screen.
  screen.append(awayBox);
  screen.append(homeBox);

  // Create a box perfectly centered horizontally and vertically.
  const teamBox = blessed.bigtext({
    font: __dirname + '/../fonts/ter-u12n.json',
    fontBold: __dirname + '/../fonts/ter-u12b.json',
    top: 0,
    left: '70%',
    width: '30%',
    height: '40%',
    tags: true,
    border: {
      type: 'line',
    },
    style: {
      fg: 'white',
      bg: 'black',
      border: {
        fg: '#f0f0f0',
      },
    },
  });

  screen.append(teamBox);

  const scoreBox = blessed.bigtext({
    font: __dirname + '/../fonts/ter-u12n.json',
    fontBold: __dirname + '/../fonts/ter-u12b.json',
    top: '40%',
    left: '70%',
    width: '30%',
    height: '40%',
    tags: true,
    border: {
      type: 'line',
    },
    style: {
      fg: 'white',
      bg: 'black',
      border: {
        fg: '#f0f0f0',
      },
    },
  });

  screen.append(scoreBox);

  // Quit on Escape, q, or Control-C.
  screen.key(['escape', 'q', 'C-c'], () => {
    return process.exit(0);
  });

  // Focus our element.
  awayBox.focus();

  // Render the screen.
  screen.render();

  while (true) {
    const { away, home, plays, isFinal } = await fetchPlayByPlay(gameUrlCode);

    awayBox.setContent(getRenderContent(plays, away));
    homeBox.setContent(getRenderContent(plays, home));

    teamBox.setContent(`${away.team} ${home.team}`);
    scoreBox.setContent(`${leftPad(away.score, 3)}-${leftPad(home.score, 3)}`);

    screen.render();

    await delay(duration);
  }
};
