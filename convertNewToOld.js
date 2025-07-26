function convertNewToOld(data) {
  if (!data || data.length === 0) return null;

  return data.map((item) => ({
    id: item.id,
    GameID: item.id,
    Season: item.season,
    Day: item.date.start, // Assuming start date is the game day
    Status: item.status.long,
    Quarter: item.periods.current,
    Updated: new Date().toISOString(), // Placeholder for updated time
    AwayTeam: item.teams.visitors.name,
    DateTime: item.date.start, // Assuming start is the datetime
    HomeTeam: item.teams.home.name,
    IsClosed: item.status.short === 2, // Assuming 2 means the game is finished
    LastPlay: "", // No direct mapping available
    Quarters: item.scores.visitors.linescore.map((_, i) => (i === 4 ? {
      Name: (i + 4).toString(),
      GameID: item.id,
      Number: i + 4,
      AwayScore: item.scores.visitors.linescore[i] ? +item.scores.visitors.linescore[i] : 0,
      HomeScore: item.scores.home.linescore[i] ? +item.scores.home.linescore[i] : 0,
    } : {
      Name: (i + 1).toString(),
      GameID: item.id,
      Number: i + 1,
      AwayScore: item.scores.visitors.linescore[i] ? +item.scores.visitors.linescore[i] : 0,
      HomeScore: item.scores.home.linescore[i] ? +item.scores.home.linescore[i] : 0,
      QuarterID: 171148 + i
    })),
    UmpireID: null,
    OverUnder: 0, // No direct mapping
    RefereeID: null,
    StadiumID: 0, // No direct mapping
    Attendance: null,
    AwayTeamID: item.teams.visitors.id,
    HomeTeamID: item.teams.home.id,
    OverPayout: 0, // No direct mapping
    SeasonType: 0, // No direct mapping
    SeriesInfo: null,
    AlternateID: null,
    CrewChiefID: null,
    DateTimeUTC: item.date.start, // Assuming same as DateTime
    PointSpread: 0, // No direct mapping
    UnderPayout: 0, // No direct mapping
    GlobalGameID: item.id,
    NeutralVenue: false, // No direct mapping
    AwayTeamScore: item.scores.visitors.points,
    HomeTeamScore: item.scores.home.points,
    GameEndDateTime: null, // No direct mapping
    GlobalAwayTeamID: item.teams.visitors.id,
    GlobalHomeTeamID: item.teams.home.id,
    AwayTeamMoneyLine: 0, // No direct mapping
    HomeTeamMoneyLine: 0, // No direct mapping
    AwayRotationNumber: 0, // No direct mapping
    HomeRotationNumber: 0, // No direct mapping
    InseasonTournament: false, // No direct mapping
    TimeRemainingMinutes: null, // No direct mapping
    TimeRemainingSeconds: null, // No direct mapping
    PointSpreadAwayTeamMoneyLine: 0, // No direct mapping
    PointSpreadHomeTeamMoneyLine: 0, // No direct mapping
    competitions: item.scores.visitors.linescore.map((score, i) => ({
      Name: (i + 1).toString(),
      GameID: item.id,
      Number: i + 1,
      AwayScore: item.scores.visitors.linescore[i] ? +item.scores.visitors.linescore[i] : 0,
      HomeScore: item.scores.home.linescore[i] ? +item.scores.home.linescore[i] : 0,
      QuarterID: 171148 + i
    })),
    rounds: [],
    currentTeam: "", // No direct mapping
    defeatTeam: "", // No direct mapping
    currentTeamLogo: "", // No direct mapping
    defeatTeamLogo: "", // No direct mapping
    Channel: "", // No direct mapping
  }));
}


module.exports = { convertNewToOld };