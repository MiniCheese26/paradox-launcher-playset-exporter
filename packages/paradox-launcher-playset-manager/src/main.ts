import * as enquirer from 'enquirer';
import * as fs from 'fs/promises';
import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import {
  getAllPlaySets,
  getPlaySetConfigForPlaySet
} from '@paradox-launcher-playset-manager/paradox-launcher-playset-manager-lib';
import * as os from 'os';

const validateDbPath = async (filePath: string) => {
  try {
    await fs.access(filePath);
  } catch (ex) {
    return false;
  }

  return true;
};

const main = async () => {
  let dbPath: string;

  switch (process.platform) {
    case 'win32':
      dbPath = path.join(os.homedir(), '\\Documents\\Paradox Interactive\\Hearts of Iron IV\\launcher-v2.sqlite');
      break;
    case 'linux':
    case 'darwin':
      dbPath = path.join(os.homedir(), '/Paradox Interactive/Hearts of Iron IV/launcher-v2.sqlite');
      break;
  }

  if (!await validateDbPath(dbPath)) {
    const inputFile = await enquirer.prompt<{ filePath: string }>({
      type: 'input',
      name: 'filePath',
      message: 'Please enter the filepath to your launcher-v2.sqlite',
      required: true,
      validate: validateDbPath,
    });

    dbPath = inputFile.filePath;
  }

  const db = new sqlite3.Database(dbPath);

  const playSets = await getAllPlaySets(db);

  if (playSets instanceof Error) {
    console.debug(playSets);
    return;
  }

  if (playSets.length === 0) {
    console.debug('No playsets found');
    return;
  }

  const prompt = await enquirer.prompt<{ playSets: Record<string, string> }>({
    type: 'multiselect',
    name: 'playSets',
    message: 'Choose playSets to export (Select none to process all)',
    choices: playSets.map(row => ({name: row.name, value: row.id})),
    result (value: string) {
      return this.map(value);
    }
  });

  if (Object.entries(prompt.playSets).length === 0) {
    prompt.playSets = playSets.reduce((total, current) => {
      total[current.name] = current.id;
      return total;
    }, {});
  }

  for (const [name, id] of Object.entries(prompt.playSets)) {
    const config = await getPlaySetConfigForPlaySet(db, {name, id});

    if (config instanceof Error) {
      console.debug(config);
      continue;
    }

    const fileContent = JSON.stringify(config, undefined, 2);
    const fileName = `${name}.json`;

    const saveDir = path.join(__dirname, 'output');
    const savePath = path.join(saveDir, fileName);

    try {
      await fs.mkdir(path.join(__dirname, 'output'));
    } catch (ex) {
      if (ex.code.toLowerCase() !== 'eexist') {
        console.debug(ex);
        continue;
      }
    }

    try {
      await fs.writeFile(savePath, fileContent, {encoding: 'utf-8'});
    } catch (ex) {
      console.debug(ex);
    }

    console.debug(`Successfully exported ${fileName}`);
  }

  console.debug('Finished');
};

(async () => {
  await main();
})();
