// export interface NewPlayer {
//     id: number
//     name: string
//     nickname: string
//     code: string
//     city?: string
//     logo?: string
//     allStar: boolean
//     nbaFranchise: boolean
//     leagues: Leagues
//   }

//   export interface OldPlayer {
//     Key: string
//     City: string
//     Name: string
//     Active: boolean
//     TeamID: number
//     Division?: string
//     LeagueID: number
//     HeadCoach?: string
//     StadiumID?: number
//     Conference?: string
//     GlobalTeamID: number
//     PrimaryColor?: string
//     TertiaryColor?: string
//     SecondaryColor?: string
//     NbaDotComTeamID: number
//     QuaternaryColor?: string
//     WikipediaLogoUrl?: string
//     WikipediaWordMarkUrl: any
//   }

//   export interface Leagues {
//     standard?: Standard
//     vegas?: Vegas
//     utah?: Utah
//     sacramento?: Sacramento
//     africa?: Africa
//   }

//   export interface Standard {
//     conference?: string
//     division?: string
//   }

//   export interface Vegas {
//     conference: string
//     division?: string
//   }

//   export interface Utah {
//     conference: string
//     division?: string
//   }

//   export interface Sacramento {
//     conference: string
//     division?: string
//   }

//   export interface Africa {
//     conference: any
//     division: any
//   }

function convertPlayerNewToOld(params) {
  return params.map((player) => ({
    Key: player.code,
    City: player.city || "",
    Name: player.name,
    Active: player.nbaFranchise,
    TeamID: player.id,
    LeagueID: player.leagues.standard ? 1 : 0, // Example logic
    GlobalTeamID: player.id,
    NbaDotComTeamID: player.id,
    WikipediaLogoUrl: player.logo || "",
    WikipediaWordMarkUrl: null,
  }));
}

module.exports = { convertPlayerNewToOld };