const apiKey = 'VkJ0YXVYQzRoMXltWG51RXdCOFFVd0tpOGhXZzh5MXJhSk9hcmFUOQ==';
const apiUrl = 'https://api.cohere.ai/v1/generate';
const chatMessages = document.getElementById('chatMessages');
let userSignedIn = false;

function initiateGitHubLogin() {
    const clientId = 'Ov23liorvtEWCHLmcDXP';
    const redirectUri = encodeURIComponent(https://importurl.github.io/indigo/);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    window.location.href = githubAuthUrl;
}

function handleGitHubCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        fetch('/api/github/callback?code=' + code)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    userSignedIn = true;
                    document.getElementById('loginContainer').style.display = 'none';
                    document.getElementById('chatContainer').style.display = 'flex';
                } else {
                    alert('GitHub authentication failed.');
                }
            })
            .catch(error => {
                console.error('Error during GitHub callback:', error);
                alert('An error occurred during GitHub authentication.');
            });
    }
}

function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
    if (isUser) {
        messageDiv.textContent = text;
    }
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

async function animateText(element, text) {
    for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        await new Promise(resolve => setTimeout(resolve, 40));
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

async function sendMessage() {
    if (!userSignedIn) {
        alert("Please sign in with GitHub to use the chat.");
        return;
    }

    const prompt = document.getElementById('prompt');
    const userMessage = prompt.value.trim();
    const sendButton = document.querySelector('button');

    if (userMessage) {
        prompt.disabled = true;
        sendButton.disabled = true;

        addMessage(userMessage, true);
        prompt.value = '';

        const loadingMessage = addMessage('', false);
        const loadingIcon = document.createElement('i');
        loadingIcon.className = 'fa fa-spinner ai-loading';
        loadingMessage.appendChild(loadingIcon);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: userMessage,
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const aiMessage = data.generations[0].text.trim();

            loadingMessage.removeChild(loadingIcon);
            await animateText(loadingMessage, aiMessage);
        } catch (error) {
            console.error('Error:', error);
            loadingMessage.removeChild(loadingIcon);
            loadingMessage.textContent = `Error: ${error.message}`;
        } finally {
            prompt.disabled = false;
            sendButton.disabled = false;
        }
    }
}

document.getElementById('prompt').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

window.onload = handleGitHubCallback;
