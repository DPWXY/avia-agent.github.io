let selectedAircraft = '';
let isRecording = false;

// Aircraft selection
function selectAircraft(aircraft) {
    if (!aircraft) return;
    
    selectedAircraft = aircraft;
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.style.opacity = '0';
        setTimeout(() => welcomeMessage.remove(), 300);
    }
    addMessage('system', `Selected aircraft: ${aircraft}. How can I assist you with your ${aircraft} today?`);
}

// Chat functionality
function addMessage(type, text) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    messageDiv.style.transition = 'all 0.3s ease';
    
    const messageContent = document.createElement('div');
    messageContent.style.display = 'flex';
    messageContent.style.alignItems = 'flex-start';
    messageContent.style.gap = '10px';
    messageContent.style.padding = '12px';
    messageContent.style.margin = '8px 0';
    messageContent.style.borderRadius = '12px';
    messageContent.style.backgroundColor = type === 'user' ? 'rgba(0,82,204,0.1)' : 'white';
    messageContent.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
    
    // Add icon
    const icon = document.createElement('i');
    icon.className = type === 'user' ? 'fas fa-user' : 'fas fa-robot';
    icon.style.color = type === 'user' ? '#0052cc' : '#0052cc';
    
    const textDiv = document.createElement('div');
    textDiv.style.flex = '1';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    textDiv.appendChild(textSpan);
    
    if (type === 'system') {
        const audioButton = document.createElement('button');
        audioButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        audioButton.style.border = 'none';
        audioButton.style.background = 'none';
        audioButton.style.cursor = 'pointer';
        audioButton.style.color = '#0052cc';
        audioButton.style.padding = '4px';
        audioButton.style.marginLeft = '8px';
        audioButton.onclick = () => speak(text);
        textDiv.appendChild(audioButton);
    }
    
    messageContent.appendChild(icon);
    messageContent.appendChild(textDiv);
    messageDiv.appendChild(messageContent);
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Animate in
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 50);
}

// Send message function
function sendMessage() {
    if (!selectedAircraft) {
        const dropdown = document.getElementById('aircraftSelect');
        dropdown.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => dropdown.style.animation = '', 500);
        return;
    }
    
    const input = document.getElementById('textInput');
    const message = input.value.trim();
    
    if (message) {
        addMessage('user', message);
        input.value = '';
        
        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message system typing';
        typingDiv.innerHTML = '<div style="padding: 12px; display: flex; gap: 4px;"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
        document.getElementById('chat-messages').appendChild(typingDiv);
        
        // Simulate AI response
        setTimeout(() => {
            typingDiv.remove();
            const response = `Here's what I know about the ${selectedAircraft} regarding your question: ${message}`;
            addMessage('system', response);
        }, 1500);
    }
}

// Voice recording functionality
const recordButton = document.getElementById('recordButton');
recordButton.addEventListener('click', toggleRecording);

function toggleRecording() {
    if (!selectedAircraft) {
        const dropdown = document.getElementById('aircraftSelect');
        dropdown.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => dropdown.style.animation = '', 500);
        return;
    }
    
    isRecording = !isRecording;
    const recordIcon = recordButton.querySelector('i');
    
    if (isRecording) {
        recordButton.style.backgroundColor = '#dc3545';
        recordIcon.className = 'fas fa-stop';
        addMessage('system', 'Recording started... Speak clearly into your microphone.');
    } else {
        recordButton.style.backgroundColor = 'var(--primary-color)';
        recordIcon.className = 'fas fa-microphone';
        addMessage('system', 'Recording stopped. Processing your message...');
        
        // Simulate processing
        setTimeout(() => {
            addMessage('system', 'I understood your voice message. Here would be the AI response.');
        }, 1500);
    }
}

// Text-to-speech functionality
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
}

// Handle enter key in text input
document.getElementById('textInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Add some CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .typing .dot {
        width: 8px;
        height: 8px;
        background: var(--primary-color);
        border-radius: 50%;
        display: inline-block;
        animation: bounce 1.3s linear infinite;
    }
    
    .typing .dot:nth-child(2) { animation-delay: 0.2s; }
    .typing .dot:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-4px); }
    }
`;
document.head.appendChild(style);
