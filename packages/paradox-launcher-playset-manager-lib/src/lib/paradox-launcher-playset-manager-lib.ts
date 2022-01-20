import { Database } from "sqlite3";
import { ModRow, PlaySet, PlaysetConfig } from "./types";
import { promisify } from "util";

export const getAllPlaySets = async (db: Database) => {
  let playSets: PlaySet[];

  const all = promisify<string, PlaySet[]>(db.all.bind(db));

  try {
    playSets = await all("SELECT id, name FROM playsets;");
  } catch (ex) {
    return ex as Error;
  }

  return playSets;
};

export const getPlaySetConfigForPlaySet = async (db: Database, playSet: PlaySet) => {

  const all = promisify<string, unknown[], ModRow[]>(db.all.bind(db));

  let rows: ModRow[];

  try {
    rows = await all(`
         SELECT m.displayName, pm.enabled, pm.position, m.steamId FROM playsets p
         JOIN playsets_mods pm on p.id = pm.playsetId
         JOIN mods m on m.id = pm.modId
         WHERE p.id = $1
         ORDER BY pm.position;
         `, [playSet.id]);
  } catch (ex) {
    return ex as Error;
  }

  // SQLite stores booleans as 0 or 1, so we need to fix that

  const result = rows.map(row => ({...row, enabled: row.enabled === 1}));

  return {
    name: playSet.name,
    mods: result
  } as PlaysetConfig;
};
