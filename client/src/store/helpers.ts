import axios from 'axios';
import vueJestContent from '../prompts/system/vue_tester';
import lazyPrompt from '../prompts/system/lazy_prompt';
import mochaChaiContent from '../prompts/system/mocha_tester';

interface Conversation {
  role: string;
  content: string;
}

interface OpenAIResponse {
  data: {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  };
}

export async function sendOpenAIMessage(
  conversation: Conversation[],
  apiKey: string
): Promise<string> {
  const temperature = import.meta.env.VITE_TEMPERATURE;
  console.log('parseFloat(temperature)', parseFloat(temperature));

  const response: OpenAIResponse = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages: conversation,
      max_tokens: 3000,
      temperature: parseFloat(temperature),
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  return response.data.choices[0].message.content.trim();
}

export function cosineSimilarity(
  vecA: number[],
  vecB: number[] | string
): number {
  if (typeof vecB === 'string') {
    vecB = JSON.parse(vecB) as number[];
  }
  const dotProduct = vecA.reduce(
    (acc, val, i) => acc + val * (vecB as number[])[i],
    0
  );
  const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(
    (vecB as number[]).reduce((acc, val) => acc + val * val, 0)
  );
  return dotProduct / (magA * magB);
}

export function determineComponentType(content: string): 'vue' | 'node' {
  return content.includes('export default') || content.includes('<template>')
    ? 'vue'
    : 'node';
}

export function getSystemMessageContent(testingType: string): string {
  switch (testingType) {
    case 'vue_jest':
      return vueJestContent;
    case 'lazy_vue':
      return lazyPrompt;
    case 'mocha_chai':
      return mochaChaiContent;
    default:
      return 'Default system message content';
  }
}

export function extractCodeBlock(responseContent: string): string | null {
  console.log('Extracting code block from response...');

  // Input validation
  if (typeof responseContent !== 'string' || responseContent.trim() === '') {
    console.error('Invalid input: responseContent must be a non-empty string');
    return null;
  }

  const codeBlockRegex = /```.*?\n(.*)```/s;
  const match = responseContent.match(codeBlockRegex);

  if (!match) {
    console.log('No code block found in the response');
    return null;
  }

  console.log('Code block found. Extracting and processing...');
  let codeBlock = match[1].trim();

  // Modify the component path in import statements
  try {
    codeBlock = codeBlock.replace(
      /import\s+(\w+)\s+from\s+['"](.+?)['"]/g,
      (match, component, path) => {
        console.log(`Modifying import for component: ${component}`);
        const modifiedPath = `'../components/${component}.vue'`;
        const modifiedImport = `import ${component} from ${modifiedPath}`;
        console.log(`Modified import: ${modifiedImport}`);
        return modifiedImport;
      }
    );
  } catch (error) {
    console.error('Error while modifying import statements:', error);
    // If there's an error in modification, return the original code block
    return codeBlock;
  }

  return codeBlock;
}
