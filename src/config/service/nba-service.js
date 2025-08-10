const axios = require("axios");
const { pool } = require("../db");
const {
  recordByUserId,
  recordByFetchData,
  internalCreateRecord,
  conditionList,
} = require("./records-service");
const { getTotalPrice, getDataByMappingArray } = require("../utils/totalArray");
const { convertNewToOld } = require("../../../convertNewToOld");
const { convertPlayerNewToOld } = require("../../../convertPlayerNewToOld");

const API_KEY = "9e488e405fcc49a38c09b5944bad49c5";
const BASE_URL = "https://api.sportsdata.io/v3/nba/scores/json";

const queryDatabase = async (query, params) => {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (error) {
    console.error("Database query error:", error.message);
    throw error;
  }
};

const fetchAndInsertData = async (type, name, endpoint) => {
  try {
    const response = await axios.get(`${BASE_URL}/${endpoint}`, {
      headers: { "Ocp-Apim-Subscription-Key": API_KEY },
    });
    const jsonResponse = JSON.stringify(response.data);

    // Insert into database
    const insertQuery = `
            INSERT INTO nba (type, json_response) 
            VALUES ($1, $2) RETURNING id, type
        `;
    await queryDatabase(insertQuery, [name, `{ "result": ${jsonResponse} }`]);
    console.log(`Inserted ${type}: success`);
  } catch (error) {
    console.error(
      `Error fetching and inserting ${type}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

const fetchAndInsertDataNew = async (type, name, date, preDate) => {
  console.log("====================================");
  console.log("date : ", date);
  console.log("preDate : ", preDate);
  console.log("====================================");
  try {
    const response = await axios.get(
      `https://v2.nba.api-sports.io/games?date=` + date,
      {
        headers: {
          "x-rapidapi-host": "v2.nba.api-sports.io",
          "x-rapidapi-key": "5f800af6bb86e88a6521d4e9071bb559",
        },
      }
    );
    const jsonResponse = convertNewToOld(response.data?.response ?? []) ?? [];

    const response2 = await axios.get(
      `https://v2.nba.api-sports.io/games?date=` + preDate,
      {
        headers: {
          "x-rapidapi-host": "v2.nba.api-sports.io",
          "x-rapidapi-key": "5f800af6bb86e88a6521d4e9071bb559",
        },
      }
    );
    const jsonResponse2 = convertNewToOld(response2.data?.response ?? []) ?? [];

    // Insert into database
    const insertQuery = `
            INSERT INTO nba (type, json_response) 
            VALUES ($1, $2) RETURNING id, type
        `;

    const arrayDates = jsonResponse?.filter((item) => {
      const now = new Date(item.DateTimeUTC);
      const gmt7Offset = +7 * 60;
      const gmt7Date = new Date(
        now.getTime() + now.getTimezoneOffset() * 60000 + gmt7Offset * 60000
      );

      return new Date(gmt7Date).toISOString().split("T")[0] === date;
    });

    const arrayDates2 = jsonResponse2?.filter((item) => {
      const now = new Date(item.DateTimeUTC);
      const gmt7Offset = +7 * 60;
      const gmt7Date = new Date(
        now.getTime() + now.getTimezoneOffset() * 60000 + gmt7Offset * 60000
      );

      return new Date(gmt7Date).toISOString().split("T")[0] === date;
    });

    await queryDatabase(insertQuery, [
      name,
      `{ "result": ${JSON.stringify([...arrayDates, ...arrayDates2])} }`,
    ]);
    console.log(`Inserted ${type}: success`);
  } catch (error) {
    console.error(
      `Error fetching and inserting ${type}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

const fetchAndInsertDataNew2 = async (type, name, date) => {
  try {
    const response = await axios.get(`https://v2.nba.api-sports.io/teams`, {
      headers: {
        "x-rapidapi-host": "v2.nba.api-sports.io",
        "x-rapidapi-key": "5f800af6bb86e88a6521d4e9071bb559",
      },
    });
    const jsonResponse = JSON.stringify(
      convertPlayerNewToOld(response.data.response)
    );

    // Insert into database
    const insertQuery = `
            INSERT INTO nba (type, json_response) 
            VALUES ($1, $2) RETURNING id, type
        `;
    await queryDatabase(insertQuery, [name, `{ "result": ${jsonResponse} }`]);
    console.log(`Inserted ${type}: success`);
  } catch (error) {
    console.error(
      `Error fetching and inserting ${type}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

const fetchNBAData = async () => {
  const now = new Date();
  const gmt7Offset = 9 * 60;
  const gmt7Date = new Date(
    now.getTime() + now.getTimezoneOffset() * 60000 + gmt7Offset * 60000
  );
  gmt7Date.setDate(gmt7Date.getDate()); // test

  console.log("====================================");
  console.log("now", now);
  console.log("now - 7 hour", gmt7Date);
  console.log("====================================");

  const today = gmt7Date.toISOString().split("T")[0];
  const yesterday = new Date(gmt7Date);
  const tomorrow = new Date(gmt7Date);
  tomorrow.setDate(tomorrow.getDate() + 1); // sit
  yesterday.setDate(yesterday.getDate() - 1);

  const formattedDate = tomorrow.toISOString().split("T")[0];
  const formattedPrevDate = yesterday.toISOString().split("T")[0];

  await fetchAndInsertDataNew2("players", "players", "AllTeams");
  await fetchAndInsertDataNew(
    "games",
    "currentGames",
    `${today}`,
    `${formattedPrevDate}`
  );
  await fetchAndInsertDataNew(
    "games",
    "nextGames",
    `${formattedDate}`,
    `${today}`
  );
};

const fetchCurrentGameData = async () => {
  const now = new Date();
  const gmt7Offset = 0 * 60;
  const gmt7Date = new Date(
    now.getTime() + now.getTimezoneOffset() * 60000 + gmt7Offset * 60000
  );

  gmt7Date.setDate(gmt7Date.getDate()); // test
  const yesterday = new Date(gmt7Date);
  const tomorrow = new Date(gmt7Date);
  tomorrow.setDate(tomorrow.getDate() + 1); // sit
  yesterday.setDate(yesterday.getDate() - 1);

  const today = gmt7Date.toISOString().split("T")[0];
  const formattedPrevDate = yesterday.toISOString().split("T")[0];

  await fetchAndInsertDataNew(
    "games",
    "currentGames",
    `${today}`,
    `${formattedPrevDate}`
  );

  const currentGameQuery =
    "SELECT json_response FROM nba WHERE type = 'currentGames' ORDER BY created_at DESC LIMIT 1";

  const [currentGame] = await Promise.all([
    queryDatabase(currentGameQuery, []),
  ]);

  const games = currentGame.rows[0]?.json_response?.result ?? [];

  const rawRecords = await recordByFetchData();
  const records = rawRecords.rows;

  await Promise.all(
    records.map(async (record) => {
      const gameId = record.record_data.id;
      const game = games.find((game) => game.GameID === gameId);

      if (!game) {
        console.log("====================================");
        console.log("invalid game", gameId);
        console.log("====================================");

        return;
      }

      if (!game.Quarters) {
        console.log("====================================");
        console.log("invalid quarter", gameId);
        console.log("====================================");

        return;
      }

      if (game.Quarters.length === 0) {
        console.log("====================================");
        console.log("empty quarter");
        console.log("====================================");

        return;
      }

      if (game.Quarters[0] === 0) {
        console.log("====================================");
        console.log("empty quarter");
        console.log("====================================");

        return;
      }

      const rounds = Array.from({ length: 6 }).map((item, index) => ({
        isWin: checkWinner(record.random.random, game.Quarters, index),
        isTemplate: false,
        name: `${record.random.random[index]}`,
      }));

      await internalCreateRecord(record.id, {
        ...record.record_data,
        Quarters: game.Quarters,
        rounds,
      });
    })
  );
};

const checkWinner = (answer, quarters, index) => {
  const rawQuarters = Array.from({ length: 6 })
    .map((_, index) => {
      if (index === 4) {
        return {
          Name: "Q1+Q2",
          GameID: quarters[0].GameID,
          Number: 3,
          AwayScore: quarters[0]?.AwayScore + quarters[1]?.AwayScore,
          HomeScore: quarters[0]?.HomeScore + quarters[1]?.HomeScore,
        };
      }

      if (index === 5) {
        return {
          Name: "Q3+Q4",
          GameID: quarters[0].GameID,
          Number: 6,
          AwayScore:
            quarters[0]?.AwayScore +
            quarters[1]?.AwayScore +
            quarters[2]?.AwayScore +
            quarters[3]?.AwayScore +
            (quarters[4]?.AwayScore || 0),
          HomeScore:
            quarters[0]?.HomeScore +
            quarters[1]?.HomeScore +
            quarters[2]?.HomeScore +
            quarters[3]?.HomeScore +
            (quarters[4]?.HomeScore || 0),
        };
      }

      if (index === 2 || index === 3) {
        return { ...quarters[index], Number: index === 2 ? 4 : 5 };
      }

      return quarters[index];
    })
    .sort((first, second) => {
      return first.Number - second.Number;
    });

  const answerInfo = answer[index];

  const quarter = rawQuarters.find((quarter) => quarter.Number === index + 1);

  const checkScore =
    (quarter.HomeScore + quarter.AwayScore) % 2 === 0 ? "2" : "1";
  return answerInfo === checkScore;
};

const getHomePageData = async (uid) => {
  const playersQuery =
    "SELECT json_response FROM nba WHERE type = 'players' ORDER BY created_at DESC LIMIT 1";
  const currentGameQuery =
    "SELECT json_response FROM nba WHERE type = 'currentGames' ORDER BY created_at DESC LIMIT 1";
  const nextGameQuery =
    "SELECT json_response FROM nba WHERE type = 'nextGames' ORDER BY created_at DESC LIMIT 1";

  const [players, currentGame, nextGame] = await Promise.all([
    queryDatabase(playersQuery, []),
    queryDatabase(currentGameQuery, []),
    queryDatabase(nextGameQuery, []),
  ]);

  const record = await recordByUserId(uid);

  return {
    record: record.rows
      .sort(
        (a, b) =>
          new Date(b.record_data.DateTimeUTC).valueOf() -
          new Date(a.record_data.DateTimeUTC).valueOf()
      )
      .map((item, index) => ({ ...item, show: index < 20 }))
      ?.filter((item) => item.show),
    players: players.rows.length > 0 ? players.rows[0]?.json_response : null,
    currentGame:
      currentGame.rows.length > 0 ? currentGame.rows[0]?.json_response : null,
    nextGame: nextGame.rows.length > 0 ? nextGame.rows[0]?.json_response : null,
  };
};

const getHistoryPageData = async (uid, teamId) => {
  const record = await recordByUserId(uid);

  return {
    record: record.rows?.filter((item) => item.record_data.thisGame === teamId),
  };
};

// ✅ Refactor: อ่านง่ายขึ้น, ลดซ้ำ, กัน null, คงผลลัพธ์เดิม
const getTotalData = async (uid, teamId) => {
  try {
    const [record, rawCondition] = await Promise.all([
      recordByUserId(uid),
      conditionList(),
    ]);

    const conditions = rawCondition?.rows?.[0]?.json_response?.results ?? [];

    // ---------- Helpers ----------
    const toTs = (d) => new Date(d).valueOf();

    // บันทึกที่ "ใช้ได้": ไม่ใช่ template และมีคะแนน Q1 (AwayScore) > 0
    const isUsable = (r) =>
      !r?.rounds?.[0]?.isTemplate && !!(r?.Quarters?.[0]?.AwayScore || 0);

    // บันทึกที่ "ยังไม่สมบูรณ์/ถัดไป": เป็น template หรือยังไม่มีคะแนน Q1
    const isNextUsable = (r) =>
      r?.rounds?.[0]?.isTemplate || !(r?.Quarters?.[0]?.AwayScore || 0);

    const byTeamSorted = (rows) =>
      (rows ?? [])
        .filter((it) => it?.record_data?.thisGame === teamId)
        .sort(
          (a, b) =>
            toTs(a.record_data?.DateTimeUTC) - toTs(b.record_data?.DateTimeUTC)
        )
        .map((it) => it.record_data)
        .filter(Boolean);

    // สร้าง array [1|0] จาก rounds เพื่อส่งไปคิด total
    const roundsToBinary = (rec) =>
      (rec?.rounds ?? []).map((r) => (r?.isWin ? 1 : 0));

    // สร้าง Quarters สำหรับรายการที่ "คำนวณแล้ว" (เติม 3/4/5/6 ตาม logic เดิม)
    const buildQuartersCalculated = (item) =>
      (item?.rounds ?? [])
        .map((_, idx) => {
          if (idx === 2) {
            return { ...item.Quarters?.[idx], Name: "4", Number: 4 };
          }
          if (idx === 3) {
            return { ...item.Quarters?.[idx], Name: "5", Number: 5 };
          }
          if (idx === 4) {
            return {
              AwayScore:
                (item.Quarters?.[0]?.AwayScore || 0) +
                (item.Quarters?.[1]?.AwayScore || 0),
              GameID: 14870,
              HomeScore:
                (item.Quarters?.[0]?.HomeScore || 0) +
                (item.Quarters?.[1]?.HomeScore || 0),
              Name: "3",
              Number: 3,
              QuarterID: 171148,
            };
          }
          if (idx === 5) {
            return {
              AwayScore:
                (item.Quarters?.[0]?.AwayScore || 0) +
                (item.Quarters?.[1]?.AwayScore || 0) +
                (item.Quarters?.[2]?.AwayScore || 0) +
                (item.Quarters?.[3]?.AwayScore || 0) +
                (item.Quarters?.[4]?.AwayScore || 0),
              GameID: 14870,
              HomeScore:
                (item.Quarters?.[0]?.HomeScore || 0) +
                (item.Quarters?.[1]?.HomeScore || 0) +
                (item.Quarters?.[2]?.HomeScore || 0) +
                (item.Quarters?.[3]?.HomeScore || 0) +
                (item.Quarters?.[4]?.HomeScore || 0),
              Name: "6",
              Number: 6,
              QuarterID: 171148,
            };
          }
          return { ...(item.Quarters?.[idx] ?? {}) };
        })
        .sort((a, b) => (a?.Number ?? 0) - (b?.Number ?? 0));

    // สร้าง Quarters สำหรับ "ถัดไป" (ซ่อนไว้ด้วยค่าว่าง)
    const buildQuartersNext = (item) =>
      (item?.rounds ?? [])
        .map((_, idx) => {
          const blank = { AwayScore: "", HomeScore: "" };
          if (idx === 2)
            return {
              ...(item.Quarters?.[idx] ?? {}),
              ...blank,
              Name: "4",
              Number: 4,
            };
          if (idx === 3)
            return {
              ...(item.Quarters?.[idx] ?? {}),
              ...blank,
              Name: "5",
              Number: 5,
            };
          if (idx === 4)
            return {
              ...blank,
              GameID: 14870,
              Name: "3",
              Number: 3,
              QuarterID: 171148,
            };
          if (idx === 5)
            return {
              ...blank,
              GameID: 14870,
              Name: "6",
              Number: 6,
              QuarterID: 171148,
            };
          return { ...(item.Quarters?.[idx] ?? {}), ...blank };
        })
        .sort((a, b) => (a?.Number ?? 0) - (b?.Number ?? 0));

    // รวม array ของค่าเงินในหนึ่งเกม
    const packTotal = (arr = []) => ({
      rounds: arr,
      totalPriceByRound: arr.reduce((acc, n) => acc + (Number(n) || 0), 0),
    });

    // ---------- Pipeline ----------
    const allByTeam = byTeamSorted(record?.rows);

    const mainRecords = allByTeam.filter(isUsable);
    const nextMainRecords = allByTeam.filter(isNextUsable);

    // ใช้สำหรับคิดผลรวมราคา
    const rawRecordRounds = mainRecords.map(roundsToBinary).filter(Boolean);

    const records = getTotalPrice(
      getDataByMappingArray(rawRecordRounds),
      conditions
    ).map(packTotal);

    // recordLasts = records + mock [1,1,1,1,1,1] รายการท้าย (ตามโค้ดเดิม)
    const recordLasts = getTotalPrice(
      getDataByMappingArray([...rawRecordRounds, [1, 1, 1, 1, 1, 1]]),
      conditions
    ).map(packTotal);

    // แปลง mainRecords -> รูปแบบที่ต้องการแสดง
    const newRecords = mainRecords.map((item, idx) => ({
      defeatTeamLogo: item?.defeatTeamLogo,
      currentTeamLogo: item?.currentTeamLogo,
      rounds: item?.rounds ?? [],
      currentTeam: item?.currentTeam,
      defeatTeam: item?.defeatTeam,
      DateTimeUTC: item?.DateTimeUTC,
      Quarters: buildQuartersCalculated(item),
      totals: records[idx],
    }));

    // next record (ตัวล่าสุดจาก nextMainRecords หลัง reverse เหมือนเดิม)
    const firstMock = conditions?.[0] ?? 0;
    const latestNext =
      [...nextMainRecords]
        .map((item) => ({
          defeatTeamLogo: item?.defeatTeamLogo,
          currentTeamLogo: item?.currentTeamLogo,
          rounds: item?.rounds ?? [],
          currentTeam: item?.currentTeam,
          defeatTeam: item?.defeatTeam,
          DateTimeUTC: item?.DateTimeUTC,
          Quarters: buildQuartersNext(item),
          totals:
            (recordLasts?.[recordLasts.length - 1]?.rounds?.[0] ?? 0) === 0
              ? packTotal([
                  firstMock,
                  firstMock,
                  firstMock,
                  firstMock,
                  firstMock,
                  firstMock,
                ])
              : recordLasts?.[recordLasts.length - 1],
        }))
        .reverse()?.[0] ?? {};

    // รวมยอดทั้งหมด (กัน NaN และไม่เทียบกับ string 'null' อีกต่อไป)
    const totalsSum = records
      .map((r) => r?.totalPriceByRound || 0)
      .reduce((a, b) => a + b, 0);

    return {
      rawRecord: newRecords,
      totals: Number.isFinite(totalsSum) ? totalsSum : 0,
      recordLasts: [{ ...latestNext }].filter((x) => x?.totals),
    };
  } catch (error) {
    // ถ้า fail ให้คืนค่าโครงสร้างเดิม
    return {
      rawRecord: [],
      totals: 0,
    };
  }
};

function updateArrayBasedOnPrevious(array) {
  let totals = Array(array[0].length).fill(0);

  array.forEach((row, index) => {
    if (index === 0) {
      totals = [...row];

      return;
    }

    row.forEach((value, colIndex) => {
      if (array[index - 1][colIndex] === value && value === 1) {
        totals[colIndex]++;
      } else if (value === 1) {
        totals[colIndex] = 1;
      } else {
        totals[colIndex] = 0;
      }
    });
  });

  return totals;
}

const createCondition = async (body) => {
  try {
    // Insert into database
    const insertQuery = `
          UPDATE 
            conditions 
          SET 
            json_response = $1
          WHERE id = '1'
        `;
    await queryDatabase(insertQuery, [JSON.stringify(body)]);
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};

const condition = async () => {
  try {
    // Insert into database
    const insertQuery = `
          select 
            *
          from
            conditions 
          where id = '1'
        `;

    const currentGame = await queryDatabase(insertQuery);
    return currentGame?.rows?.[0] ?? {};
  } catch (error) {
    console.error(
      `Error fetching and inserting ${type}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = {
  fetchNBAData,
  getHomePageData,
  fetchCurrentGameData,
  getTotalData,
  getHistoryPageData,
  createCondition,
  condition,
};
