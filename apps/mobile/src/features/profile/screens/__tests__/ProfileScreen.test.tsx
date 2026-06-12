import { render, screen } from '@testing-library/react-native';
import { ProfileScreen } from '../ProfileScreen';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));
jest.mock('@/features/auth/hooks/useAuth', () => ({
  useLogout: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('@/features/auth/store/sessionStore', () => ({
  useSessionStore: (selector: (s: unknown) => unknown) =>
    selector({
      profile: {
        full_name: 'Awa Diop',
        phone: '+221770000000',
        avatar_url: null,
        verification_status: 'approved',
        persona: 'local',
      },
    }),
}));
jest.mock('@/features/profile/components/LanguageSelector', () => ({
  LanguageSelector: () => null,
}));

describe('ProfileScreen', () => {
  it('renders profile info and verification badge without ever showing an admin entry point', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('Awa Diop')).toBeTruthy();
    expect(screen.queryByText(/espace admin/i)).toBeNull();
    expect(screen.queryByText(/admin/i)).toBeNull();
  });

  it('never renders any persona-switching control on the profile screen', () => {
    render(<ProfileScreen />);
    expect(screen.queryByText(/changer de profil/i)).toBeNull();
    expect(screen.queryByText(/nouveau|local|parent/i)).toBeNull();
  });
});
