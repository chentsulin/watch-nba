module.exports = function mapTeamToColor(team) {
  switch (team) {
    case 'GSW':
      return '#f2de31';
    case 'CLE':
      return '#b7543d';
    default:
      return '#fff';
  }
};
