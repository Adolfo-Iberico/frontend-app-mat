// Sends chat messages to the AI endpoint and maintains streamed conversation history.
import { env } from '../config/env';

const API_URL = env.VITE_API_URL;

let conversationHistory = [];

export function resetChat() {
  conversationHistory = [];
}

export async function sendMessage(message, onChunk) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('Inicia sesión para usar el asistente.');
  }

  try {
    const response = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream, application/json',
        'Accept-Language': localStorage.getItem('sim_language') || 'es',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        messages: [...conversationHistory, { role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.message || errorData?.error || `Error HTTP ${response.status}`;
      const error = new Error(errorMsg);
      error.code = errorData?.code || null; // network | auth | rate_limit | provider | not_configured | empty
      throw error;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';
    let streamError = null;

    const processLine = (line) => {
      if (!line.startsWith('data: ')) return;
      const data = line.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        if (parsed?.error) {
          streamError = new Error(parsed.error);
          return;
        }
        const text = parsed?.choices?.[0]?.delta?.content || parsed?.content;
        if (text) {
          fullResponse += text;
          if (onChunk) onChunk(fullResponse, false);
        }
      } catch {
        // Ignore incomplete/malformed SSE records.
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        processLine(line);
      }
      if (streamError) throw streamError;
    }

    if (buffer.trim()) processLine(buffer);
    if (streamError) throw streamError;
    if (!fullResponse.trim()) {
      throw new Error('El asistente no devolvió una respuesta. Inténtalo de nuevo.');
    }

    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: fullResponse }
    );
    conversationHistory = conversationHistory.slice(-12);
    if (onChunk) onChunk(fullResponse, true);
    return fullResponse;
  } catch (error) {
    throw error;
  }
}
