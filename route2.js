// Function to save messages to local storage
function saveMessagesToLocalStorage(messages) {
  localStorage.setItem('chatMessages', JSON.stringify(messages));
}

// Function to get messages from local storage
function getMessagesFromLocalStorage() {
  const storedMessages = localStorage.getItem('chatMessages');
  return storedMessages ? JSON.parse(storedMessages) : [];
}

// Function to display messages on the screen
function displayMessages(messages) {
  const messagesList = document.getElementById('messages');
  messagesList.innerHTML = ''; // Clear the existing messages

  messages.forEach((messageData) => {
    const li = document.createElement('li');
    li.textContent = `${messageData.userId}: ${messageData.message}`;
    messagesList.appendChild(li);
  });
}

// Initially fetch messages from local storage and display them
const storedMessages = getMessagesFromLocalStorage();
displayMessages(storedMessages);

// Function to fetch new messages from the server
function fetchNewMessages() {
  // Determine the timestamp of the last stored message
  const lastStoredMessage = storedMessages[storedMessages.length - 1];
  const lastTimestamp = lastStoredMessage ? lastStoredMessage.timestamp : null;

  // Send a request to the server to fetch new messages based on the last timestamp
  fetch(`/api/messages?lastTimestamp=${lastTimestamp}`)
    .then((response) => response.json())
    .then((data) => {
      // Update the chat interface with new messages
      storedMessages.push(...data);
      saveMessagesToLocalStorage(storedMessages);
      displayMessages(storedMessages);
    })
    .catch((error) => {
      console.error('Error fetching new messages:', error);
    });
}

// Periodically fetch new messages every 1 second
setInterval(fetchNewMessages, 1000);

// Handle user sending a message (similar to previous code)
sendButton.addEventListener('click', () => {
  const message = messageInput.value;
  if (message.trim() !== '') {
    const userId = 'user123'; // Replace with the actual user ID
    const messageData = {
      userId,
      message,
    };

    fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    })
      .then((response) => response.json())
      .then(() => {
        // Message sent successfully
        messageInput.value = '';
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
  }
});
