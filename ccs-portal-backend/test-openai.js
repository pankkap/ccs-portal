const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from root
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Using API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  try {
    console.log('Sending test request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: "Say hello" }
      ],
    });
    console.log('Success!', completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI Test Failed:', error.message);
    if (error.response) {
      console.error('Error Details:', error.response.data);
    }
  }
}

test();
