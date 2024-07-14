import express from 'express';
import cors from 'cors';
import { runServerTest } from './test-runner.mjs';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        origin &&
        (origin.startsWith('http://localhost') ||
          origin.startsWith('https://localhost'))
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

const PORT = 3002; // Choose a different PORT number if needed

console.log('Starting server...');

app.post('/api/claude', async (req, res) => {
  try {
    const {
      messages,
      model = 'claude-3-sonnet-20240229',
      max_tokens = 2000,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: 'Invalid or missing messages array' });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    const response = await anthropic.messages.create({
      model,
      max_tokens,
      temperature: 0,
      messages,
    });

    res.json(response);
  } catch (error) {
    console.error('Error in Claude API call:', error);
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

app.post('/run-tests', async (req, res) => {
  try {
    const { testCode, component, componentName } = req.body;

    if (!testCode || !component || !componentName) {
      return res
        .status(400)
        .json({ error: 'Missing test code, component, or component name' });
    }

    const results = await runServerTest(testCode, component, componentName);

    if (results.passed) {
      return res.status(200).json({
        passed: true,
        role: 'assistant',
        content: 'We have a good test',
      });
    } else {
      return res.status(200).json({
        passed: false,
        role: 'assistant',
        content: results.error,
      });
    }
  } catch (error) {
    console.error('Error running tests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Not currently in use, just wanted to have the option.
app.post('/api/openai', async (req, res) => {
  try {
    const { messages, model = 'gpt-4o', max_tokens = 2000 } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: 'Invalid or missing messages array' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens,
      temperature: 0,
    });

    res.json(response);
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Test server is running on PORT ${PORT}`);
});
