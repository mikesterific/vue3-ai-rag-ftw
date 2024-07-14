import { execSync } from 'child_process';
import fs from 'fs';

const filteredErrors = (data) => {
  if (!data || typeof data !== 'object') {
    console.error('Invalid data object');
    return [];
  }

  if (!Array.isArray(data.testResults)) {
    console.error('Invalid or missing "testResults" attribute');
    return [];
  }

  return data.testResults
    .map((testResult) => {
      if (typeof testResult.message !== 'string') {
        console.error('Invalid or missing "message" attribute in testResult');
        return '';
      }

      const cleanedMessages = testResult.message
        .split('\n')
        .filter((line) => !line.startsWith('    at'))
        .join('\n <<newline>> \n');

      return cleanedMessages;
    })
    .filter((message) => message !== '')
    .join('\n\n');
};

function replaceComponentPath(componentName, testCode) {
  if (typeof testCode !== 'string' || typeof componentName !== 'string') {
    console.error(
      'Error in replaceComponentPath: testCode and componentName must be strings'
    );
    throw new Error(
      'Invalid input: testCode and componentName must be strings'
    );
  }

  if (componentName.trim() === '') {
    console.error(
      'Error in replaceComponentPath: componentName cannot be empty'
    );
    throw new Error('Invalid componentName: cannot be an empty string');
  }

  try {
    console.log('Replacing component paths in test code...');
    const modifiedTestCode = testCode.replace(
      /import\s+(\w+)\s+from\s+['"](.+?)['"]/g,
      (match, component, path) => {
        const modifiedPath = `'../component/${componentName}'`;
        return `import ${component} from ${modifiedPath}`;
      }
    );
    console.log('Component paths replaced successfully.');
    return modifiedTestCode;
  } catch (error) {
    console.error('Error replacing component path:', error);
    throw new Error('Failed to replace component path in test code');
  }
}

function clearDirectory(directory) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Clearing directory: ${directory}`);
      execSync(`rm -rf ${directory}/*`);
      console.log(`Directory ${directory} cleared successfully.`);
      resolve();
    } catch (error) {
      console.error(`Error clearing directory ${directory}:`, error);
      reject(error);
    }
  });
}

function writeFileSync(filePath, content) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Writing file: ${filePath}`);
      fs.writeFileSync(filePath, content);
      console.log(`File ${filePath} written successfully.`);
      resolve();
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      reject(error);
    }
  });
}
function extractTestResults(output) {
  console.log('Extracting test results...');
  const passed = output.success;
  let assertions = [];
  if (!passed) {
    assertions = output.testResults.flatMap((testResult) =>
      testResult.assertionResults.map((assertion) => ({
        status: assertion.status,
        title: assertion.title,
        failureMessages: assertion.failureMessages,
      }))
    );
  }

  console.log('Test results extracted successfully.');
  return { passed, assertions };
}

function extractCoverageResults(coverageResults) {
  console.log('Extracting code coverage results...');
  const uncoveredLines = {};

  Object.entries(coverageResults).forEach(([filePath, coverageData]) => {
    const { s, statementMap } = coverageData;
    const fileUncoveredLines = Object.entries(s)
      .filter(([statementId, count]) => count === 0)
      .map(([statementId]) => statementMap[statementId].start.line);

    if (fileUncoveredLines.length > 0) {
      uncoveredLines[filePath] = fileUncoveredLines;
    }
  });

  console.log('Code coverage results extracted successfully.');
  return uncoveredLines;
}
function removeCallStack(errorString) {
  const errorMessageRegex = /(.*?)\n\s\s\s\sat/;
  const match = errorMessageRegex.exec(errorString.toString());
  if (match && match.length >= 1) {
    // const [, message] = match;
    return match[1];
  } else {
    return JSON.stringify(errorString);
  }
}

function formatErrorMessages(errorMessages) {
  return errorMessages
    .map((message) => {
      return message
        .split('\n')
        .map((line) => {
          return line.trim() === '' ? '<br>' : line;
        })
        .join('<br>');
    })
    .join('<br><br>'); // Join messages with double line breaks
}
function parseErrors(errors) {
  console.log('Parsing errors:', errors);

  const errorStrings = errors.flatMap((error) => {
    console.log('error', error);
    const failureMessage = error.failureMessages.join('\n');

    return [`${error.title}: ${failureMessage}`];
  });
  const formattedErrors = errorStrings.join('. ');

  return formattedErrors;
}

export {
  replaceComponentPath,
  clearDirectory,
  writeFileSync,
  extractTestResults,
  extractCoverageResults,
  parseErrors,
  removeCallStack,
  formatErrorMessages,
  filteredErrors,
};
