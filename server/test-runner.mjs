import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  replaceComponentPath,
  clearDirectory,
  writeFileSync,
  extractCoverageResults,
  extractTestResults,
  filteredErrors,
} from './utils.mjs';

const currentDirPath = path.dirname(fileURLToPath(import.meta.url));
function startTest(testsPath) {
  return new Promise((resolve, reject) => {
    console.log(`Running Jest tests in ${testsPath}`);
    const command = 'node_modules/.bin/jest';

    try {
      const result = spawnSync(
        'node',
        [
          command,
          testsPath,
          '--json',
          '--silent',
          '--coverage',
          '--noStackTrace',
        ],
        {
          stdio: 'pipe', // Capture both stdout and stderr
          encoding: 'utf-8',
        }
      );

      if (result.error) {
        console.error('Error running Jest tests:', result.error);
        return reject(result.error);
      }

      try {
        const output = JSON.parse(result.output[1]);
        const parsedOutput = filteredErrors(output);
        console.log('Jest tests completed successfully.');
        resolve({ success: output.success, error: parsedOutput });
      } catch (parseError) {
        // console.error('Error parsing Jest JSON output:', parseError);
        reject(new Error(`Failed to parse Jest output: ${result.stdout}`));
      }
    } catch (error) {
      console.error('Unexpected error running Jest tests:', error);
      reject(error);
    }
  });
}

async function runServerTest(testCode, component, componentName) {
  if (typeof testCode !== 'string' || testCode.trim() === '') {
    throw new Error('Invalid or missing testCode');
  }
  if (typeof component !== 'string' || component.trim() === '') {
    throw new Error('Invalid or missing component');
  }
  if (typeof componentName !== 'string' || componentName.trim() === '') {
    throw new Error('Invalid or missing componentName');
  }
  const isVueFile = componentName.endsWith('.vue');
  const testFileName = isVueFile
    ? componentName.replace(/(\w+)\.vue$/, '$1.spec.js')
    : componentName.replace(/(\w+)\.js$/, '$1.test.js');

  const componentsPath = `${currentDirPath}/component/${componentName}`;
  const testsPath = `${currentDirPath}/test/${testFileName}`;
  const updatedTestCode = replaceComponentPath(componentName, testCode);

  try {
    await clearDirectory(`${currentDirPath}/component`);
    await clearDirectory(`${currentDirPath}/test`);
    await writeFileSync(componentsPath, component);
    await writeFileSync(testsPath, updatedTestCode);

    const { success, error } = await startTest(testsPath);
    // const testsPassed = output.success;
    // const { passed, errors } = extractTestResults(output);
    // const uncoveredLines = extractCoverageResults(output.coverageMap);
    const uncoveredLines = {};

    return { success, error, uncoveredLines };
  } catch (error) {
    console.error('Error running tests:', error);
    throw error;
  }
}
export { runServerTest };
