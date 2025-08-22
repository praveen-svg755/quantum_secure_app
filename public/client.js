    // client.js
    const socket = io();

    const messagesDiv = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const usernameInput = document.getElementById('username-input');
    const sendBtn = document.getElementById('send-btn');
    const refreshKeyBtn = document.getElementById('refresh-key-btn');
    const currentKeySpan = document.getElementById('current-key');

    let currentSharedKey = ''; // Store the shared key received from the server

    // Function to append messages to the chat window
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
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to bottom
    }

    // --- Socket.IO Event Handlers ---

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

        // Simulate decryption on the client side
        // In a real app, decryption would happen securely on the recipient's device
        // For this prototype, we're decrypting on all clients to show the message content
        try {
            // We need to import cryptoUtils.js into the client-side for decryption simulation
            // For a browser environment, you'd typically use a browser-compatible crypto library
            // For this hackathon, we'll assume a simplified decryption for demonstration.
            // In a real app, the client would have its own cryptoUtils or equivalent.
            // For now, we'll just display the encrypted message if we don't have a client-side decryptor.

            // To make this work, you'd need to expose the decryptMessage function to the browser,
            // or implement a browser-compatible version. For a quick hackathon demo,
            // we can simplify this by just showing the encrypted message on the client
            // and only decrypting on the server for demonstration purposes.

            // For a more complete client-side decryption, you'd need to bundle cryptoUtils.js
            // for the browser or use a library like 'web-crypto-js'.
            // For this demo, let's assume a simplified client-side decryption for now.

            // --- Simplified Client-Side Decryption (for demo purposes) ---
            // In a real app, you'd use a browser-compatible crypto library here.
            // For this demo, we'll just show the encrypted message if we can't decrypt.
            // To actually decrypt on the client, you'd need to include a browser-compatible
            // crypto library and adapt the decryptMessage function for the browser.

            // For the purpose of this demo, let's assume a client-side decrypt function exists
            // and we'll simulate its behavior.
            // In a real app, you'd have a client-side crypto utility.
            // For the hackathon, you might just display the encrypted message on the client
            // and only decrypt on the server for simplicity, or use a browser crypto library.

            // Since cryptoUtils.js uses Node's 'crypto' module, it won't run directly in the browser.
            // For a full client-side decryption, you'd need to rewrite/adapt the crypto functions
            // using Web Crypto API or a browser-compatible library.

            // For the purpose of this demo, let's simulate the decryption and tampering detection
            // by having the server send the decrypted message if successful, or a tampering alert.
            // This means the server would need to decrypt and then re-encrypt for each client,
            // or send a flag.

            // Let's adjust the server to send a 'decryptedMsg' event with the decrypted content
            // and a 'tampered' flag. This simplifies the client-side logic for the demo.
            // This means the 'receiveMsg' event from the server will now include 'decryptedText' and 'tampered' flag.

            // This client.js assumes the server sends `decryptedText` and `tampered` flag.
            // We need to modify `index.js` to include this.
            // For now, let's just display the encrypted message and a placeholder for decryption.

            // --- TEMPORARY: Display encrypted message and indicate decryption needed ---
            // This part needs the server to send the decrypted text and tampering status.
            // We will update the server (index.js) to do this.
            // For now, let's assume `data` contains `decryptedText` and `tampered`
            const { decryptedText, tampered } = data; // Assuming server sends these now

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
            // Send the plain message to the server. Server will encrypt and broadcast.
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

    // Initial key display (will be updated by server 'keyUpdateClient' event)
    currentKeySpan.textContent = 'Waiting for key...';
    