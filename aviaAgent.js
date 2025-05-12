// === OpenAI API endpoints and key ===
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_AUDIO_URL = 'https://api.openai.com/v1/audio/transcriptions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Sends a chat completion request to OpenAI.
 * @param {{role: string, content: string}[]} messages - Chat history including system/user/assistant messages.
 * @returns {Promise<string>} - The assistant's reply text.
 */
export async function chatCompletion(messages) {
  const resp = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({ model: 'gpt-3.5-turbo', messages })
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI chat error: ${resp.status} ${err}`);
  }
  const { choices } = await resp.json();
  return choices[0].message.content.trim();
}

/**
 * Transcribes an audio blob using Whisper.
 * @param {Blob} audioBlob - The recorded audio.
 * @returns {Promise<string>} - The transcription text.
 */
export async function transcribeAudio(audioBlob) {
  const form = new FormData();
  form.append('file', audioBlob, 'voice.webm');
  form.append('model', 'whisper-1');

  const resp = await fetch(OPENAI_AUDIO_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: form
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI transcription error: ${resp.status} ${err}`);
  }
  const { text } = await resp.json();
  return text;
}
