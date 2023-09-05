const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(bodyParser.json());

// Connect to your MongoDB database (if you haven't already)
mongoose.connect('mongodb://localhost/your-database-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Error connecting to the database:', err));

// Define a ChatMessage model (if not already defined)
const ChatMessage = mongoose.model('ChatMessage', {
  userId: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  // Send existing messages to the client
  ChatMessage.find()
    .then((messages) => {
      ws.send(JSON.stringify(messages));
    })
    .catch((error) => {
      console.error('Error fetching messages:', error);
    });

  // Handle incoming WebSocket messages
  ws.on('message', (message) => {
    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    // Save the message to the database
    const messageData = JSON.parse(message);
    const chatMessage = new ChatMessage(messageData);
    chatMessage.save()
      .then(() => console.log('Message saved to the database'))
      .catch((error) => console.error('Error saving message to the database:', error));
  });

  // Handle WebSocket disconnection
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
