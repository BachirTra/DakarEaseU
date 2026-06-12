import { describe, expect, it, vi, beforeEach } from 'vitest';

const getUserMock = vi.fn();
const profileSingleMock = vi.fn();
const listUsersMock = vi.fn();
const profilesSelectMock = vi.fn();

vi.mock('@/lib/supabase/server-client', () => ({
  createSupabaseServerClient: () =>
    Promise.resolve({
      auth: { getUser: getUserMock },
      from: () => ({
        select: () => ({ eq: () => ({ single: profileSingleMock }) }),
      }),
    }),
}));

vi.mock('@/lib/supabase/admin-client', () => ({
  createSupabaseAdminClient: () => ({
    from: () => ({
      select: () => ({ order: profilesSelectMock }),
    }),
    auth: { admin: { listUsers: listUsersMock } },
  }),
}));

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 403 when the requester is not an admin', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'student-1' } } });
    profileSingleMock.mockResolvedValue({ data: { role: 'student' } });

    const { GET } = await import('./route');
    const response = await GET();

    expect(response.status).toBe(403);
  });

  it('merges profiles with auth.users email and last_sign_in_at for admins', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    profileSingleMock.mockResolvedValue({ data: { role: 'admin' } });
    profilesSelectMock.mockResolvedValue({
      data: [
        {
          id: 'student-1',
          full_name: 'Aminata D.',
          role: 'student',
          is_blocked: false,
          verification_status: 'approved',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      error: null,
    });
    listUsersMock.mockResolvedValue({
      data: {
        users: [
          {
            id: 'student-1',
            email: 'aminata@example.com',
            last_sign_in_at: '2026-02-01T00:00:00Z',
          },
        ],
      },
      error: null,
    });

    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.users).toEqual([
      {
        id: 'student-1',
        email: 'aminata@example.com',
        fullName: 'Aminata D.',
        role: 'student',
        isBlocked: false,
        verificationStatus: 'approved',
        lastSignInAt: '2026-02-01T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ]);
  });
});
