const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const apiKey = process.env.OPENAI_API_KEY;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:8080', // Adjust this to match your frontend URL
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Main analyze endpoint
app.post('/analyze', upload.single('housePhoto'), async (req, res) => {
  try {
    const { file } = req;
    const { zipCode } = req.body;

    // Logging file and zip code details
    console.log('File received:', file ? file.originalname : 'No file');
    console.log('Zip code received:', zipCode);

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the file and convert it to base64
    const imageBuffer = fs.readFileSync(file.path);
    const base64Image = imageBuffer.toString('base64');

    // Logging before making the OpenAI API request
    console.log('Making request to OpenAI API...');

    // Make a request to the OpenAI API
    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this house image and provide information about its architectural style. The house is located in zip code ${zipCode}.` },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Log OpenAI API response details
    console.log('OpenAI API response:', openaiResponse.data);

    const analysis = openaiResponse.data.choices[0].message.content;

    // Delete the uploaded file after processing
    fs.unlinkSync(file.path);

    res.json({ analysis });
  } catch (error) {
    // Detailed error logging
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Unexpected Error:', error.message);
    }

    res.status(500).json({ error: 'An error occurred during analysis. Check server logs for details.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
