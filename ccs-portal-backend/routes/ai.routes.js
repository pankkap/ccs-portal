const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @route POST /api/ai/generate-questions
 * @desc Generate questions using Google Gemini REST API (v1beta)
 * @access Private (Faculty/Admin)
 */
router.post('/generate-questions', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const { topic, subtopic, domain, difficulty, count, type } = req.body;

    if (!topic || !count || !type || !difficulty || !domain) {
      return res.status(400).json({ 
        success: false, 
        message: 'Topic, domain, difficulty, count, and type are required' 
      });
    }

    const prompt = `You are a professional educational assessment creator. 
    Domain: ${domain}
    Topic: ${topic}
    Subtopic: ${subtopic || 'General Overview'}
    Difficulty: ${difficulty}
    Question Type: ${type}
    Number of Questions: ${count}

    Instructions:
    1. For MCQ (Single Ans): Provide 4 options and one correctAnswer string.
    2. For MCQ (Multiple Ans): Provide 4 options and an array of correct strings in correctAnswer.
    3. For Fill in the Blank: options array should be empty. correctAnswer should be the missing word/phrase.
    4. For Output Based: Provide a code snippet in questionText and the expected output in correctAnswer.
    5. For Subjective: options array should be empty. correctAnswer should be a comprehensive model answer.

    Return strictly a JSON object with a "questions" key containing an array of objects.
    Each object must have: 
    - questionText (string)
    - options (array of strings)
    - correctAnswer (string or array of strings for Multiple Ans)
    - explanation (string: brief explanation)
    
    Ensure the JSON is valid and follows this exact structure.`;

    console.log('Generating questions with Gemini 2.5 Flash for domain:', domain);

    let questions = [];
    const apiKey = process.env.GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      
      const aiResponse = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      if (aiResponse.data.candidates && aiResponse.data.candidates[0].content) {
        const text = aiResponse.data.candidates[0].content.parts[0].text;
        const parsedResult = JSON.parse(text);
        questions = parsedResult.questions || (Array.isArray(parsedResult) ? parsedResult : []);
      } else {
        throw new Error('Invalid AI response structure');
      }
      
    } catch (aiError) {
      console.warn('AI Generation failed, using Mock Fallback. Reason:', aiError.response?.data?.error?.message || aiError.message);
      
      // MOCK FALLBACK DATA
      questions = Array.from({ length: count }).map((_, i) => ({
        questionText: `[Sample] ${difficulty} ${type} Question ${i + 1} about ${topic}?`,
        options: (type.includes('MCQ')) ? ["Option A", "Option B", "Option C", "Option D"] : [],
        correctAnswer: (type === 'MCQ (Multiple Ans)') ? ["Option A", "Option B"] : (type === 'MCQ (Single Ans)' ? "Option A" : "Sample Answer"),
        explanation: "This is a sample explanation as the AI service is currently unavailable or quota-limited."
      }));
    }

    res.json({
      success: true,
      data: { questions }
    });
  } catch (error) {
    console.error('Final Route Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Critical error in AI question generation.',
      error: error.message 
    });
  }
});

module.exports = router;
