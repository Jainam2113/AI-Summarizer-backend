const express = require('express');
const Groq = require('groq-sdk');
const router = express.Router();

// Initialize Groq client with API key from environment
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

router.post('/', async (req, res) => {
    try {
        const { transcript, customPrompt } = req.body;

        if (!transcript) {
            return res.status(400).json({ error: 'Transcript is required' });
        }

        // Truncate transcript if it's too long for free tier
        const maxTranscriptLength = 8000; // Conservative limit for free tier
        const truncatedTranscript = transcript.length > maxTranscriptLength
            ? transcript.substring(0, maxTranscriptLength) + "... [truncated]"
            : transcript;

        const defaultPrompt = `Summarize the following meeting transcript in a clear and structured format. 
Please format your response as plain text without using any markdown formatting (no **, ##, ###, or other markdown symbols). 
Use simple text formatting with clear section breaks and bullet points using regular dashes (-).`;

        const prompt = customPrompt || defaultPrompt;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `${prompt}\n\nTranscript:\n${truncatedTranscript}`
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
            max_tokens: 1000
        });

        const summary = chatCompletion.choices[0]?.message?.content || "Unable to generate summary";

        res.json({ summary });
    } catch (error) {
        console.error('Error generating summary:', error);

        // Handle rate limit errors gracefully
        if (error.status === 413 || error.status === 429) {
            res.status(429).json({
                error: 'Rate limit exceeded. Please try again in a moment or use a shorter transcript.'
            });
        } else {
            res.status(500).json({ error: 'Failed to generate summary' });
        }
    }
});

module.exports = router;