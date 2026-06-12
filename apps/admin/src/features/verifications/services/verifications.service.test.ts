import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fetchSignedDocumentUrl } from './verifications.service';

const originalFetch = global.fetch;

describe('fetchSignedDocumentUrl', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the signed URL when the route handler responds successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          signedUrl: 'https://signed.example.com/card.jpg',
          expiresInSeconds: 120,
        }),
    }) as unknown as typeof fetch;

    const url = await fetchSignedDocumentUrl('user-123/carte.jpg');

    expect(url).toBe('https://signed.example.com/card.jpg');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/student-id-signed-url',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws with the server-provided message when the request fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Accès réservé aux administrateurs.' }),
    }) as unknown as typeof fetch;

    await expect(fetchSignedDocumentUrl('user-123/carte.jpg')).rejects.toThrow(
      'Accès réservé aux administrateurs.',
    );
  });
});
