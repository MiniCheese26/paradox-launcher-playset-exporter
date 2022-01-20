import * as enquirer from 'enquirer';
import * as fs from 'fs/promises';
import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import {
  getAllPlaySets,
  getPlaySetConfigForPlaySet
} from '@paradox-launcher-playset-manager/paradox-launcher-playset-manager-lib';

const main = async () => {
  const inputFile = await enquirer.prompt<{ filePath: string }>({
    type: 'input',
    name: 'filePath',
    message: 'Please enter the filepath to your launcher-v2.sqlite',
    required: true,
    async validate (value: string) {
      try {
        await fs.access(value);
      } catch (ex) {
        return false;
      }

      return true;
    },
  });

  const db = new sqlite3.Database(inputFile.filePath);

  const playSets = await getAllPlaySets(db);

  if (playSets instanceof Error) {
    console.debug(playSets);
    return;
  }

  const prompt = await enquirer.prompt<{ playsets: Record<string, string> }>({
    type: 'multiselect',
    name: 'playsets',
    message: 'Choose playsets to export',
    choices: playSets.map(row => ({name: row.name, value: row.id})),
    result (value: string) {
      return this.map(value);
    }
  });

  for (const [name, id] of Object.entries(prompt.playsets)) {
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
      if (ex.errno !== -17) {
        console.debug(ex);
      }

      continue;
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
