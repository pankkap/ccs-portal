const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from root
dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Using Gemini API Key:', apiKey ? 'Present' : 'Missing');

async function test() {
  try {
    console.log('Sending direct REST request to Gemini-2.5-Flash...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await axios.post(url, {
      contents: [{
        parts: [{ text: "Say hello in one word." }]
      }]
    });
    const fs = require('fs');
    fs.writeFileSync('gemini-models.json', JSON.stringify(response.data, null, 2));
    console.log('Models dumped to gemini-models.json');
    
    console.log('Gemini Response:', JSON.stringify(response.data, null, 2));
    console.log('Success!');
  } catch (error) {
    console.error('Gemini REST Failed:', error.message);
    if (error.response) {
      console.error('Error Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

test();
