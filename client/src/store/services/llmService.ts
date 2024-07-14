const SERVER_URL = 'http://localhost:3002'; // Update this if your server URL is different

interface Message {
  role: string;
  content: string;
}

interface State {
  conversation: Message[];
}

const createLLMService = (apiKey: string, provider: string) => {
  let timesCalled = 0;

  const sendMessage = async (state: State): Promise<string> => {
    timesCalled++;
    console.log('timesCalled', timesCalled);
    try {
      const conversation = [...state.conversation];
      console.log('conversation ----- &&&', conversation);

      let response: Response;

      switch (provider.toLowerCase()) {
        case 'openai':
          response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: conversation,
            }),
          });

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
          }

          const openaiData = await response.json();
          return openaiData.choices[0].message.content;

        case 'claude':
          response = await fetch(`${SERVER_URL}/api/claude`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(createClaudePayload(conversation)),
          });

          if (!response.ok) {
            throw new Error(`Claude API error: ${response.statusText}`);
          }

          const claudeData = await response.json();
          console.log('Claude API Response:', claudeData);
          return claudeData.content[0].text;

        default:
          throw new Error(`Unsupported LLM provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error in ${provider} API call:`, error);
      throw error;
    }
  };

  return { sendMessage };
};

function createClaudePayload(conversation: Message[]) {
  const [systemMessage, ...messages] = conversation;

  return {
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    system: systemMessage.content,
    messages: messages,
  };
}

export default createLLMService;
