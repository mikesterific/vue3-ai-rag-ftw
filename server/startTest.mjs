import { spawnSync } from 'child_process';
import path from 'path';
import { currentDirPath } from './test-runner.mjs';

export function startTest(testsPath, isVueFile) {
  const jestConfig = isVueFile
    ? `${currentDirPath}/jest.config.vue.js`
    : `${currentDirPath}/jest.config.js`;
  const jestPath = path.resolve(currentDirPath, './node_modules/.bin/jest');

  const { stdout, stderr } = spawnSync(
    jestPath,
    ['--config', jestConfig, testsPath],
    {
      encoding: 'utf-8',
    }
  );

  if (stderr) {
    console.error('Error running Jest:', stderr);
    throw new Error('Failed to run Jest');
  }

  return JSON.parse(stdout);
}
