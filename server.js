// server.js
const express = require('express');
const multer = require('multer');
const fetch = require('cross-fetch');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Set up Multer for handling file uploads
const upload = multer({ 
    preservePath: true,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define a route to handle file uploads and make predictions using Custom Vision model API
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No files were uploaded.');
        }
      
        // Read the uploaded image file
        const image = req.file.buffer;
        // Make a request to the Custom Vision model API
        const predictionResults = await makePrediction(image);

        // Return the prediction results to the client
        res.json(predictionResults);
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).send('Error processing image.');
    }
});
  
// Function to make predictions using Custom Vision model API
async function makePrediction(image) {
    // Make HTTP request to the Custom Vision model API endpoint
    const endpoint = 'https://customvision5daychallengeinstance-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/29e1042a-764a-4c93-b039-8875fad7677d/detect/iterations/Iteration5/image';
    const predictionKey = '9667662d85434019bbc8b7306a6180fa';
  
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Prediction-Key': predictionKey,
        'Content-Type': 'application/octet-stream'
      },
      body: image
    });
  
    const predictionResults = await response.json();

    // Find the prediction with the highest probability
    const highestPrediction = predictionResults.predictions.reduce((maxPrediction, prediction) => {
        return prediction.probability > maxPrediction.probability ? prediction : maxPrediction;
    });

    // Convert the probability to a percentage
    const probabilityPercentage = (highestPrediction.probability * 100).toFixed(2);
    const sentence = `The image contains ${highestPrediction.tagName}'s logo with a probability of ${probabilityPercentage}%.`;

    return sentence;
}  

// Define a route to serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
