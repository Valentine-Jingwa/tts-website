import axios from 'axios';

const generateSentences = async (theme: string, count: number): Promise<string[]> => {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const response = await axios.post(
    'https://api.openai.com/v1/engines/davinci-codex/completions',
    {
      prompt: `Generate ${count} short sentences about ${theme}.`,
      max_tokens: 100,
      n: 1,
      stop: null,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );
  return response.data.choices[0].text.trim().split('\n').map((sentence: string) => sentence.trim());
};

export default generateSentences;
