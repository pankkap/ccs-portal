const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const Question = require('../models/Question.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route GET /api/questions/bank
 * @desc Get all questions for the faculty's bank
 * @access Private (Faculty/Admin)
 */
router.get('/bank', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const { topic, difficulty, type, search } = req.query;
    const filter = { createdBy: req.user._id };

    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { subtopic: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { questions }
    });
  } catch (error) {
    console.error('Fetch Question Bank Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route POST /api/questions
 * @desc Create a single question manually
 * @access Private (Faculty/Admin)
 */
router.post('/', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const question = new Question({
      ...req.body,
      createdBy: req.user._id,
      source: 'Manual'
    });

    await question.save();

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: { question }
    });
  } catch (error) {
    console.error('Manual Question ADD Error:', error);
    res.status(500).json({ success: false, message: 'Failed to add question' });
  }
});

/**
 * @route POST /api/questions/bulk-upload
 * @desc Bulk upload questions via Excel
 * @access Private (Faculty/Admin)
 */
router.post('/bulk-upload', authenticate, authorize('faculty', 'admin', 'placement'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const questionsToInsert = data.map(row => ({
      questionText: row.questionText || row.Question || '',
      type: row.type || row.Type || 'MCQ',
      options: [
        row.option1 || row.Option1 || '',
        row.option2 || row.Option2 || '',
        row.option3 || row.Option3 || '',
        row.option4 || row.Option4 || ''
      ].filter(o => o !== ''),
      correctAnswer: row.correctAnswer || row.CorrectAnswer || '',
      explanation: row.explanation || row.Explanation || '',
      domain: row.domain || row.Domain || row.Category || 'Technical Domain',
      topic: row.topic || row.Topic || 'General',
      subtopic: row.subtopic || row.Subtopic || '',
      difficulty: row.difficulty || row.Difficulty || 'Medium',
      createdBy: req.user._id,
      source: 'Bulk'
    }));

    const result = await Question.insertMany(questionsToInsert);

    res.status(201).json({
      success: true,
      message: `${result.length} questions imported successfully`,
      data: { count: result.length }
    });
  } catch (error) {
    console.error('Bulk Upload Error:', error);
    res.status(500).json({ success: false, message: 'Bulk upload failed. Ensure template format is correct.' });
  }
});

/**
 * @route PUT /api/questions/:id
 * @desc Update a question
 */
router.put('/:id', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const question = await Question.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { $set: req.body },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: { question }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update question' });
  }
});

/**
 * @route DELETE /api/questions/:id
 * @desc Delete a question
 */
router.delete('/:id', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete question' });
  }
});

/**
 * @route GET /api/questions/topics
 * @desc Get unique topics based on domain
 */
router.get('/topics', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const { domain } = req.query;
    const filter = { createdBy: req.user._id };
    if (domain) filter.domain = domain;

    const topics = await Question.distinct('topic', filter);
    res.json({ success: true, data: { topics } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch topics' });
  }
});

/**
 * @route GET /api/questions/subtopics
 * @desc Get unique subtopics based on domain and topic
 */
router.get('/subtopics', authenticate, authorize('faculty', 'admin', 'placement'), async (req, res) => {
  try {
    const { domain, topic } = req.query;
    const filter = { createdBy: req.user._id };
    if (domain) filter.domain = domain;
    if (topic) filter.topic = topic;

    const subtopics = await Question.distinct('subtopic', filter);
    res.json({ success: true, data: { subtopics } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subtopics' });
  }
});

module.exports = router;
