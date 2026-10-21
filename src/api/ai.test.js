import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetChat, sendMessage } from './ai';

describe('AI chat API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetChat();
    localStorage.setItem('access_token', 'test-access-token');
    localStorage.setItem('sim_language', 'es');
  });

  it('sends the auth token and reads the streamed Groq response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response([
      `data: ${JSON.stringify({ choices: [{ delta: { content: 'Hola, ' } }] })}`,
      `data: ${JSON.stringify({ choices: [{ delta: { content: 'estudiante.' } }] })}`,
      'data: [DONE]',
      '',
    ].join('\n\n'), {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    })));
    const onChunk = vi.fn();

    await expect(sendMessage('Hola', onChunk)).resolves.toBe('Hola, estudiante.');

    const [url, request] = fetch.mock.calls[0];
    expect(url).toContain('/ai/chat');
    expect(request.headers.Authorization).toBe('Bearer test-access-token');
    expect(request.headers['Accept-Language']).toBe('es');
    expect(JSON.parse(request.body).messages).toEqual([{ role: 'user', content: 'Hola' }]);
    expect(onChunk).toHaveBeenLastCalledWith('Hola, estudiante.', true);
  });

  it('does not call the API without an authenticated user', async () => {
    localStorage.removeItem('access_token');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(sendMessage('Hola')).rejects.toThrow('Inicia sesión');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
