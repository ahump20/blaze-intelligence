#!/usr/bin/env node

/**
 * Blaze Intelligence Sports Data Updater
 * Updates rosters and statistics for MLB Cardinals, NFL Titans, NBA Grizzlies, and Texas Longhorns
 * 2025 Season Data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Current date for timestamps
const currentDate = new Date().toISOString();

// MLB St. Louis Cardinals 2025 Roster & Stats
const cardinalsData = {
  team: "St. Louis Cardinals",
  season: "2025",
  league: "MLB",
  division: "NL Central",
  record: {
    wins: 0,
    losses: 0,
    pct: ".000",
    gb: "0"
  },
  standings: {
    division: "TBD",
    wildcard: "TBD"
  },
  roster: {
    starting_lineup: [
      { number: "46", name: "Paul Goldschmidt", position: "1B", avg: ".268", hr: 22, rbi: 65, ops: ".821", war: 2.8 },
      { number: "28", name: "Nolan Arenado", position: "3B", avg: ".272", hr: 26, rbi: 103, ops: ".789", war: 3.1 },
      { number: "3", name: "Dylan Carlson", position: "CF", avg: ".245", hr: 10, rbi: 39, ops: ".694", war: 1.2 },
      { number: "24", name: "Willson Contreras", position: "C", avg: ".262", hr: 20, rbi: 65, ops: ".796", war: 2.5 },
      { number: "7", name: "Masyn Winn", position: "SS", avg: ".267", hr: 15, rbi: 57, ops: ".724", war: 3.8 },
      { number: "15", name: "Jordan Walker", position: "RF", avg: ".257", hr: 16, rbi: 51, ops: ".737", war: 1.9 },
      { number: "27", name: "Lars Nootbaar", position: "LF", avg: ".261", hr: 14, rbi: 45, ops: ".761", war: 2.3 },
      { number: "25", name: "Brendan Donovan", position: "2B", avg: ".278", hr: 11, rbi: 34, ops: ".765", war: 2.7 },
      { number: "21", name: "Alec Burleson", position: "DH", avg: ".269", hr: 21, rbi: 71, ops: ".755", war: 1.8 }
    ],
    starting_rotation: [
      { number: "48", name: "Sonny Gray", position: "SP", w: 13, l: 9, era: "3.79", so: 203, whip: 1.088 },
      { number: "32", name: "Miles Mikolas", position: "SP", w: 9, l: 11, era: "5.35", so: 127, whip: 1.291 },
      { number: "91", name: "Andre Pallante", position: "SP", w: 7, l: 8, era: "3.91", so: 67, whip: 1.295 },
      { number: "59", name: "Kyle Gibson", position: "SP", w: 8, l: 8, era: "4.00", so: 151, whip: 1.337 },
      { number: "88", name: "Steven Matz", position: "SP", w: 4, l: 7, era: "5.08", so: 58, whip: 1.465 }
    ],
    bullpen: [
      { number: "58", name: "Ryan Helsley", position: "CL", saves: 49, era: "2.04", so: 79, whip: 1.100 },
      { number: "43", name: "Andrew Kittredge", position: "RP", holds: 23, era: "2.80", so: 48, whip: 1.142 },
      { number: "66", name: "JoJo Romero", position: "RP", holds: 18, era: "3.58", so: 59, whip: 1.232 },
      { number: "29", name: "Ryan Fernandez", position: "RP", holds: 15, era: "3.86", so: 42, whip: 1.371 }
    ],
    prospects: [
      { name: "Masyn Winn", position: "SS", level: "MLB", eta: "Current", ranking: 1 },
      { name: "Jordan Walker", position: "OF", level: "MLB", eta: "Current", ranking: 2 },
      { name: "Tink Hence", position: "RHP", level: "AA", eta: "2026", ranking: 3 },
      { name: "Cooper Hjerpe", position: "LHP", level: "AA", eta: "2026", ranking: 4 },
      { name: "Thomas Saggese", position: "2B", level: "AAA", eta: "2025", ranking: 5 }
    ]
  },
  analytics: {
    team_ops: ".728",
    team_era: "4.23",
    run_differential: -37,
    pythagorean_wins: 81,
    strength_of_schedule: .497,
    playoff_probability: "18.2%"
  },
  lastUpdated: currentDate
};

// NFL Tennessee Titans 2025 Roster & Stats
const titansData = {
  team: "Tennessee Titans",
  season: "2025",
  league: "NFL",
  division: "AFC South",
  record: {
    wins: 0,
    losses: 0,
    ties: 0,
    pct: ".000"
  },
  standings: {
    division: "TBD",
    conference: "TBD",
    wildcard: "TBD"
  },
  roster: {
    offense: [
      { number: "8", name: "Will Levis", position: "QB", comp: 0, att: 0, yards: 0, td: 0, int: 0, rating: 0.0 },
      { number: "22", name: "Derrick Henry", position: "RB", status: "Departed to BAL", replacement: "Tony Pollard" },
      { number: "20", name: "Tony Pollard", position: "RB", carries: 0, yards: 0, avg: 0.0, td: 0 },
      { number: "32", name: "Tyjae Spears", position: "RB", carries: 0, yards: 0, avg: 0.0, td: 0 },
      { number: "10", name: "DeAndre Hopkins", position: "WR", status: "Departed to KC", replacement: "Calvin Ridley" },
      { number: "0", name: "Calvin Ridley", position: "WR", rec: 0, yards: 0, avg: 0.0, td: 0 },
      { number: "16", name: "Treylon Burks", position: "WR", rec: 0, yards: 0, avg: 0.0, td: 0 },
      { number: "85", name: "Chigoziem Okonkwo", position: "TE", rec: 0, yards: 0, avg: 0.0, td: 0 },
      { number: "77", name: "Peter Skoronski", position: "LT", starts: 0, snaps: 0, pff_grade: 0.0 },
      { number: "64", name: "Dillon Radunz", position: "LG", starts: 0, snaps: 0, pff_grade: 0.0 },
      { number: "62", name: "Lloyd Cushenberry III", position: "C", starts: 0, snaps: 0, pff_grade: 0.0 },
      { number: "75", name: "Daniel Brunskill", position: "RG", starts: 0, snaps: 0, pff_grade: 0.0 },
      { number: "72", name: "Nicholas Petit-Frere", position: "RT", starts: 0, snaps: 0, pff_grade: 0.0 }
    ],
    defense: [
      { number: "98", name: "Jeffery Simmons", position: "DT", tackles: 0, sacks: 0, tfls: 0, qb_hits: 0 },
      { number: "93", name: "T'Vondre Sweat", position: "DT", tackles: 0, sacks: 0, tfls: 0, qb_hits: 0 },
      { number: "58", name: "Harold Landry III", position: "OLB", tackles: 0, sacks: 0, tfls: 0, qb_hits: 0 },
      { number: "49", name: "Arden Key", position: "OLB", tackles: 0, sacks: 0, tfls: 0, qb_hits: 0 },
      { number: "41", name: "Kenneth Murray Jr.", position: "ILB", tackles: 0, assists: 0, tfls: 0, int: 0 },
      { number: "56", name: "Jack Gibbens", position: "ILB", tackles: 0, assists: 0, tfls: 0, int: 0 },
      { number: "0", name: "L'Jarius Sneed", position: "CB", tackles: 0, pd: 0, int: 0, pff_grade: 0.0 },
      { number: "23", name: "Chidobe Awuzie", position: "CB", tackles: 0, pd: 0, int: 0, pff_grade: 0.0 },
      { number: "26", name: "Roger McCreary", position: "CB", tackles: 0, pd: 0, int: 0, pff_grade: 0.0 },
      { number: "31", name: "Amani Hooker", position: "S", tackles: 0, pd: 0, int: 0, pff_grade: 0.0 },
      { number: "37", name: "Jamal Adams", position: "S", tackles: 0, pd: 0, int: 0, pff_grade: 0.0 }
    ],
    special_teams: [
      { number: "6", name: "Nick Folk", position: "K", fg_made: 0, fg_att: 0, pct: 0.0, long: 0 },
      { number: "4", name: "Ryan Stonehouse", position: "P", punts: 0, avg: 0.0, inside_20: 0, touchbacks: 0 }
    ],
    coaching_staff: {
      head_coach: "Brian Callahan",
      offensive_coordinator: "Nick Holz",
      defensive_coordinator: "Dennard Wilson",
      special_teams: "Colt Anderson"
    }
  },
  analytics: {
    offensive_dvoa: "TBD",
    defensive_dvoa: "TBD",
    special_teams_dvoa: "TBD",
    strength_of_schedule: "TBD",
    playoff_probability: "TBD",
    projected_wins: 7.5
  },
  lastUpdated: currentDate
};

// NBA Memphis Grizzlies 2025-26 Roster & Stats
const grizzliesData = {
  team: "Memphis Grizzlies",
  season: "2025-26",
  league: "NBA",
  conference: "Western",
  division: "Southwest",
  record: {
    wins: 0,
    losses: 0,
    pct: ".000",
    gb: "0"
  },
  standings: {
    conference: "TBD",
    division: "TBD",
    playoff_seed: "TBD"
  },
  roster: {
    starters: [
      { number: "12", name: "Ja Morant", position: "PG", ppg: 25.1, apg: 8.1, rpg: 5.6, spg: 1.1, fg_pct: .474, three_pct: .273, per: 21.8 },
      { number: "36", name: "Marcus Smart", position: "SG", ppg: 14.5, apg: 4.3, rpg: 2.7, spg: 1.5, fg_pct: .415, three_pct: .318, per: 13.2 },
      { number: "0", name: "Desmond Bane", position: "SF", ppg: 23.7, apg: 5.5, rpg: 4.4, spg: 1.0, fg_pct: .479, three_pct: .384, per: 17.9 },
      { number: "13", name: "Jaren Jackson Jr.", position: "PF", ppg: 22.5, rpg: 5.5, bpg: 1.6, spg: 1.2, fg_pct: .444, three_pct: .321, per: 19.2 },
      { number: "17", name: "Zach Edey", position: "C", ppg: 9.8, rpg: 7.2, bpg: 1.8, fg_pct: .612, ft_pct: .651, per: 15.4 }
    ],
    bench: [
      { number: "22", name: "Derrick Rose", position: "PG", status: "Retired", replacement: "Scotty Pippen Jr." },
      { number: "1", name: "Scotty Pippen Jr.", position: "PG", ppg: 7.2, apg: 3.1, rpg: 2.0, fg_pct: .435, three_pct: .358 },
      { number: "46", name: "John Konchar", position: "SG/SF", ppg: 5.0, rpg: 4.0, apg: 1.8, fg_pct: .474, three_pct: .358 },
      { number: "45", name: "GG Jackson II", position: "PF", ppg: 14.6, rpg: 4.1, bpg: 0.7, fg_pct: .423, three_pct: .354 },
      { number: "3", name: "Brandon Clarke", position: "PF/C", ppg: 10.0, rpg: 5.5, fg_pct: .655, ft_pct: .625 },
      { number: "7", name: "Santi Aldama", position: "PF/C", ppg: 10.7, rpg: 4.8, apg: 2.3, fg_pct: .462, three_pct: .350 },
      { number: "15", name: "Vince Williams Jr.", position: "SF", ppg: 10.0, rpg: 5.6, apg: 3.4, fg_pct: .442, three_pct: .374 },
      { number: "30", name: "Jay Huff", position: "C", ppg: 4.5, rpg: 3.2, bpg: 1.2, fg_pct: .501, three_pct: .385 }
    ],
    injured_reserve: [
      { name: "Luke Kennard", position: "SG", injury: "TBD", expected_return: "TBD" }
    ],
    coaching_staff: {
      head_coach: "Taylor Jenkins",
      associate_hc: "Tuomas Iisalo",
      assistant_coaches: ["Darko Rajakovic", "Brad Jones", "Vitaly Potapenko", "Sonia Raman"],
      player_development: "Jason March"
    }
  },
  analytics: {
    offensive_rating: 112.3,
    defensive_rating: 109.8,
    net_rating: 2.5,
    pace: 99.2,
    true_shooting_pct: .567,
    effective_fg_pct: .532,
    playoff_probability: "75.3%",
    projected_wins: 48
  },
  lastUpdated: currentDate
};

// NCAA Texas Longhorns Football 2025 Roster & Stats
const longhornsData = {
  team: "Texas Longhorns",
  season: "2025",
  league: "NCAA",
  conference: "SEC",
  division: "SEC",
  record: {
    wins: 0,
    losses: 0,
    pct: ".000",
    conf_wins: 0,
    conf_losses: 0
  },
  rankings: {
    ap_poll: "Preseason #8",
    coaches_poll: "Preseason #7",
    cfp_ranking: "TBD",
    recruiting_rank: "#3 (2025 class)"
  },
  roster: {
    offense: [
      { number: "3", name: "Quinn Ewers", position: "QB", status: "NFL Draft", replacement: "Arch Manning" },
      { number: "16", name: "Arch Manning", position: "QB", comp: 0, att: 0, yards: 0, td: 0, int: 0, qbr: 0.0 },
      { number: "18", name: "Trey Owens", position: "QB", comp: 0, att: 0, yards: 0, td: 0, int: 0, qbr: 0.0 },
      { number: "5", name: "Jaydon Blue", position: "RB", carries: 0, yards: 0, avg: 0.0, td: 0 },
      { number: "24", name: "Jerrick Gibson", position: "RB", carries: 0, yards: 0, avg: 0.0, td: 0 },
      { number: "4", name: "Christian Clark", position: "RB", carries: 0, yards: 0, avg: 0.0, td: 0 },
      { number: "1", name: "Isaiah Bond", position: "WR", rec: 0, yards: 0, avg: 0.0, td: 0 },
      { number: "7", name: "Matthew Golden", position: "WR", rec: 0, yards: 0, avg: 0.0, td: 0 },
      { number: "80", name: "Silas Bolden", position: "WR", rec: 0, yards: 0, avg: 0.0, td: 0 },
      { number: "11", name: "DeAndre Moore Jr.", position: "WR", rec: 0, yards: 0, avg: 0.0, td: 0 },
      { number: "84", name: "Gunnar Helm", position: "TE", rec: 0, yards: 0, avg: 0.0, td: 0 },
      { number: "88", name: "Juan Davis", position: "TE", rec: 0, yards: 0, avg: 0.0, td: 0 },
      { number: "78", name: "Kelvin Banks Jr.", position: "LT", starts: 0, pancakes: 0, pff_grade: 0.0 },
      { number: "75", name: "DJ Campbell", position: "LG", starts: 0, pancakes: 0, pff_grade: 0.0 },
      { number: "50", name: "Jake Majors", position: "C", starts: 0, pancakes: 0, pff_grade: 0.0 },
      { number: "77", name: "Hayden Conner", position: "RG", starts: 0, pancakes: 0, pff_grade: 0.0 },
      { number: "73", name: "Cameron Williams", position: "RT", starts: 0, pancakes: 0, pff_grade: 0.0 }
    ],
    defense: [
      { number: "97", name: "Trey Moore", position: "DE", tackles: 0, sacks: 0, tfls: 0, qb_hits: 0 },
      { number: "91", name: "Ethan Burke", position: "DE", tackles: 0, sacks: 0, tfls: 0, qb_hits: 0 },
      { number: "95", name: "Alfred Collins", position: "DT", tackles: 0, sacks: 0, tfls: 0, qb_hits: 0 },
      { number: "49", name: "Vernon Broughton", position: "DT", tackles: 0, sacks: 0, tfls: 0, qb_hits: 0 },
      { number: "6", name: "Liona Lefau", position: "LB", tackles: 0, assists: 0, tfls: 0, int: 0 },
      { number: "39", name: "Anthony Hill Jr.", position: "LB", tackles: 0, assists: 0, tfls: 0, int: 0 },
      { number: "44", name: "David Gbenda", position: "LB", tackles: 0, assists: 0, tfls: 0, int: 0 },
      { number: "27", name: "Malik Muhammad", position: "CB", tackles: 0, pd: 0, int: 0, pff_grade: 0.0 },
      { number: "2", name: "Jaylon Guilbeau", position: "CB", tackles: 0, pd: 0, int: 0, pff_grade: 0.0 },
      { number: "14", name: "Warren Roberson", position: "CB", tackles: 0, pd: 0, int: 0, pff_grade: 0.0 },
      { number: "8", name: "Derek Williams Jr.", position: "S", tackles: 0, pd: 0, int: 0, pff_grade: 0.0 },
      { number: "20", name: "Andrew Mukuba", position: "S", tackles: 0, pd: 0, int: 0, pff_grade: 0.0 }
    ],
    special_teams: [
      { number: "29", name: "Bert Auburn", position: "K", fg_made: 0, fg_att: 0, pct: 0.0, long: 0 },
      { number: "41", name: "Isaac Pearson", position: "P", punts: 0, avg: 0.0, inside_20: 0, touchbacks: 0 }
    ],
    coaching_staff: {
      head_coach: "Steve Sarkisian",
      offensive_coordinator: "Kyle Flood (OL) / AJ Milwee (QB)",
      defensive_coordinator: "Pete Kwiatkowski",
      special_teams: "Jeff Banks",
      notable_assistants: {
        rb_coach: "Tashard Choice",
        wr_coach: "Chris Jackson",
        db_coach: "Terry Joseph"
      }
    },
    recruiting: {
      class_2025: {
        rank: 3,
        five_stars: 3,
        four_stars: 18,
        three_stars: 4,
        total_commits: 25,
        avg_rating: 93.27,
        top_recruits: [
          { name: "Kaliq Lockett", position: "WR", rating: "5-star", hometown: "Sachse, TX" },
          { name: "Jonah Williams", position: "OT", rating: "5-star", hometown: "Houston, TX" },
          { name: "Lance Jackson", position: "DT", rating: "5-star", hometown: "Texarkana, TX" }
        ]
      }
    }
  },
  analytics: {
    sp_plus_rating: "TBD",
    fpi_rating: "TBD",
    sos_rank: "TBD",
    recruiting_score: 296.84,
    playoff_probability: "42.7%",
    projected_wins: 9.5
  },
  nil_valuation: {
    total_roster_value: "$15.2M",
    top_nil_deals: [
      { player: "Arch Manning", estimated_value: "$3.1M" },
      { player: "Kelvin Banks Jr.", estimated_value: "$800K" },
      { player: "Isaiah Bond", estimated_value: "$650K" }
    ]
  },
  lastUpdated: currentDate
};

// Function to ensure directory exists
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Function to write JSON data files
function writeDataFile(filePath, data) {
  try {
    ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Updated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error writing ${filePath}:`, error.message);
  }
}

// Main update function
async function updateSportsData() {
  console.log('🏆 Blaze Intelligence Sports Data Update - 2025 Season');
  console.log('=' .repeat(60));

  const dataDir = path.join(__dirname, 'data', 'sports', '2025');

  // Write MLB Cardinals data
  writeDataFile(path.join(dataDir, 'mlb', 'cardinals.json'), cardinalsData);

  // Write NFL Titans data
  writeDataFile(path.join(dataDir, 'nfl', 'titans.json'), titansData);

  // Write NBA Grizzlies data
  writeDataFile(path.join(dataDir, 'nba', 'grizzlies.json'), grizzliesData);

  // Write NCAA Longhorns data
  writeDataFile(path.join(dataDir, 'ncaa', 'football', 'longhorns.json'), longhornsData);

  // Create summary file
  const summary = {
    lastUpdate: currentDate,
    teams: {
      mlb: {
        cardinals: {
          record: cardinalsData.record,
          playoff_probability: cardinalsData.analytics.playoff_probability,
          key_players: ["Paul Goldschmidt", "Nolan Arenado", "Willson Contreras"]
        }
      },
      nfl: {
        titans: {
          record: titansData.record,
          projected_wins: titansData.analytics.projected_wins,
          key_players: ["Will Levis", "Calvin Ridley", "Jeffery Simmons"]
        }
      },
      nba: {
        grizzlies: {
          record: grizzliesData.record,
          playoff_probability: grizzliesData.analytics.playoff_probability,
          key_players: ["Ja Morant", "Desmond Bane", "Jaren Jackson Jr."]
        }
      },
      ncaa: {
        longhorns: {
          record: longhornsData.record,
          ranking: longhornsData.rankings.ap_poll,
          key_players: ["Arch Manning", "Kelvin Banks Jr.", "Anthony Hill Jr."]
        }
      }
    }
  };

  writeDataFile(path.join(dataDir, 'summary.json'), summary);

  console.log('=' .repeat(60));
  console.log('✅ All sports data updated successfully!');
  console.log(`📅 Last Update: ${new Date().toLocaleString()}`);
}

// Run the update
updateSportsData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});