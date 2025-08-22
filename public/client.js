    // client.js
    const socket = io();

    const messagesDiv = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const usernameInput = document.getElementById('username-input');
    const sendBtn = document.getElementById('send-btn');
    const refreshKeyBtn = document.getElementById('refresh-key-btn');
    const currentKeySpan = document.getElementById('current-key');

    let currentSharedKey = ''; 

    function appendMessage(sender, text, isSelf = false, isTampered = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        if (isSelf) {
            messageElement.classList.add('self');
        } else {
            messageElement.classList.add('other');
        }
        if (isTampered) {
            messageElement.classList.add('tampered');
            messageElement.innerHTML = `<strong>${sender} (TAMPERED!):</strong> ${text}`;
        } else {
            messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
        }
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; 
    }

    

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('keyUpdateClient', (key) => {
        currentSharedKey = key;
        currentKeySpan.textContent = key;
        console.log('Received new shared key from server:', key);
        appendMessage('System', 'Encryption key updated!', false);
    });

    socket.on('keyUpdated', (message) => {
        appendMessage('System', message, false);
    });

    socket.on('receiveMsg', async (data) => {
        const { encrypted, iv, authTag, sender } = data;
        const isSelf = sender === usernameInput.value;

       
        try {
            
            const { decryptedText, tampered } = data; 

            if (tampered) {
                appendMessage(sender, `[TAMPERED MESSAGE DETECTED]`, isSelf, true);
            } else {
                appendMessage(sender, decryptedText, isSelf);
            }

        } catch (error) {
            console.error('Error during client-side decryption simulation:', error);
            appendMessage(sender, `[ERROR DECRYPTING MESSAGE]`, isSelf, true);
        }
    });

    // --- UI Event Listeners ---

    sendBtn.addEventListener('click', () => {
        const messageText = messageInput.value.trim();
        const username = usernameInput.value.trim();

        if (messageText && username) {
            
            socket.emit('sendMsg', { text: messageText, sender: username });
            messageInput.value = ''; // Clear input
        }
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });

    refreshKeyBtn.addEventListener('click', () => {
        socket.emit('refreshKey');
    });

    
    currentKeySpan.textContent = 'Waiting for key...';
    