// script.js
// Load as ES module: <script type="module" src="script.js"></script>

import { chatCompletion, transcribeAudio } from './aviaAgent.js';

let selectedAircraft = '';
let systemPrompt;
let mediaRecorder;
let audioChunks = [];
let chatHistory = [];

// Restart conversation
function restartConversation() {
  if (!confirm('Are you sure you want to restart the conversation? This will clear all messages.')) return;
  const messagesDiv = document.getElementById('chat-messages');
  messagesDiv.innerHTML = '';
  chatHistory = [];
  const select = document.getElementById('aircraftSelect');
  select.value = '';
  selectedAircraft = '';
  const welcome = document.createElement('div');
  welcome.className = 'welcome-message';
  welcome.innerHTML = `<i class="fas fa-robot robot-icon"></i>
    <p>Welcome to Avia! Please select your aircraft to begin chatting.</p>`;
  messagesDiv.appendChild(welcome);
}

// Aircraft selection
function selectAircraft(aircraft) {
  if (!aircraft) return;
  selectedAircraft = aircraft;
  systemPrompt = `You are a knowledgeable and helpful assistant specialized in the ${aircraft}. You are here to answer questions to help pilots with the ${aircraft}.`;
  chatHistory = [{ role: 'system', content: systemPrompt }];
  const welcome = document.querySelector('.welcome-message');
  if (welcome) {
    welcome.style.opacity = '0';
    setTimeout(() => welcome.remove(), 300);
  }
  addMessage('system', `Selected aircraft: ${aircraft}. How can I assist you with your ${aircraft} today?`);
}

function addMessage(type, text) {
  const messagesDiv = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.style.opacity = '0';
  messageDiv.style.transform = 'translateY(20px)';
  messageDiv.style.transition = 'all 0.3s ease';

  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.alignItems = 'flex-start';
  content.style.gap = '10px';
  content.style.padding = '12px';
  content.style.margin = '8px 0';
  content.style.borderRadius = '12px';
  content.style.backgroundColor = type === 'user' ? 'rgba(0,82,204,0.1)' : 'white';
  content.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';

  const icon = document.createElement('i');
  icon.className = type === 'user' ? 'fas fa-user' : 'fas fa-robot';
  icon.style.color = '#0052cc';

  const textDiv = document.createElement('div');
  textDiv.style.flex = '1';
  const span = document.createElement('span');
  span.textContent = text;
  textDiv.appendChild(span);

  if (type === 'system') {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-volume-up"></i>';
    btn.style.border = 'none';
    btn.style.background = 'none';
    btn.style.cursor = 'pointer';
    btn.style.color = '#0052cc';
    btn.style.padding = '4px';
    btn.style.marginLeft = '8px';
    btn.onclick = () => speak(text);
    textDiv.appendChild(btn);
  }

  content.appendChild(icon);
  content.appendChild(textDiv);
  messageDiv.appendChild(content);
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  setTimeout(() => {
    messageDiv.style.opacity = '1';
    messageDiv.style.transform = 'translateY(0)';
  }, 50);
}

// Send chat message
async function sendMessage(userText) {
  const trimmed = userText.trim();
  if (!selectedAircraft || !trimmed) {
    if (!selectedAircraft) shakeSelect();
    return;
  }
  chatHistory.push({ role: 'user', content: trimmed });
  addMessage('user', trimmed);
  document.getElementById('textInput').value = '';
  const typing = document.createElement('div');
  typing.className = 'message system typing';
  typing.innerHTML = '<div style="padding:12px;display:flex;gap:4px;"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
  document.getElementById('chat-messages').appendChild(typing);

  try {
    const aiText = await chatCompletion(chatHistory);
    chatHistory.push({ role: 'assistant', content: aiText });
    typing.remove();
    addMessage('system', aiText);
  } catch (e) {
    console.error('API error:', e);
    typing.remove();
    addMessage('system', '⚠️ Error communicating with OpenAI.');
  }
}

// Shake selector
function shakeSelect() {
  const dd = document.getElementById('aircraftSelect');
  dd.style.animation = 'shake 0.5s ease-in-out';
  setTimeout(() => dd.style.animation = '', 500);
}

// Voice recording & transcription
const recordButton = document.getElementById('recordButton');
recordButton.addEventListener('click', async () => {
  if (!selectedAircraft) return shakeSelect();
  const icon = recordButton.querySelector('i');
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    recordButton.style.backgroundColor = 'var(--primary-color)';
    icon.className = 'fas fa-microphone';
    addMessage('system', 'Recording stopped.');
  } else {
    audioChunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      addMessage('system', 'Transcribing audio...');
      try {
        const text = await transcribeAudio(blob);
        sendMessage(text);
      } catch (err) {
        console.error('Transcription error:', err);
        addMessage('system', '⚠️ Transcription failed.');
      }
    };
    mediaRecorder.start();
    recordButton.style.backgroundColor = '#dc3545';
    icon.className = 'fas fa-stop';
    addMessage('system', 'Recording started...');
  }
});

// Text-to-speech
function speak(text) {
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.9;
  utt.pitch = 1;
  window.speechSynthesis.speak(utt);
}

// CSS Animations
const style = document.createElement('style');
style.textContent = `
@keyframes shake {0%,100%{transform:translateX(0);}25%{transform:translateX(-5px);}75%{transform:translateX(5px);}}
.typing .dot {width:8px;height:8px;background:var(--primary-color);border-radius:50%;display:inline-block;animation:bounce 1.3s linear infinite;}
.typing .dot:nth-child(2){animation-delay:0.2s;} .typing .dot:nth-child(3){animation-delay:0.4s;}
@keyframes bounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-4px);}}
`;
document.head.appendChild(style);
