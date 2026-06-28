import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { DemandeScreen } from '../DemandeScreen';

const mockMatchedListings = jest.fn();
const mockCreateRequest = jest.fn();

jest.mock('@/features/housing/hooks/useGuidedSearch', () => ({
  useSubmitGuidedSearch: () => ({ mutateAsync: mockCreateRequest, isPending: false }),
  useGuidedSearchMatches: (...args: unknown[]) => {
    mockMatchedListings(...args);
    return {
      data: [
        {
          listing_id: 'b0000000-0000-0000-0000-000000000001',
          match_pct: 82,
          reasons: ['Type recherché', 'Budget compatible'],
        },
      ],
      isLoading: false,
    };
  },
}));

jest.mock('@/features/auth/store/sessionStore', () => ({
  useSessionStore: (selector: (s: { user: { id: string } }) => unknown) =>
    selector({ user: { id: 'u1' } }),
}));

// Results now render MatchCard, which fetches each listing's details.
jest.mock('@/features/housing/hooks/useListingDetail', () => ({
  useListingDetail: () => ({
    data: {
      id: 'b0000000-0000-0000-0000-000000000001',
      title: 'Studio meublé proche UCAD',
      district: 'Fann',
      distance_label: "10 min de l'UCAD",
      price: 85000,
      currency: 'XOF',
      listing_media: [],
    },
  }),
}));

describe('DemandeScreen', () => {
  beforeEach(() => {
    mockMatchedListings.mockReset();
    mockCreateRequest.mockReset();
    mockCreateRequest.mockResolvedValue({ id: 'req-1' });
  });

  it('walks through the 4 steps and shows match results with percentage badges', async () => {
    render(<DemandeScreen />);

    expect(screen.getByText('Quel type de logement ?')).toBeTruthy();
    fireEvent.press(screen.getByText('Studio'));
    fireEvent.press(screen.getByText('Suivant'));

    expect(screen.getByText('Où veux-tu vivre ?')).toBeTruthy();
    fireEvent.press(screen.getByText('Suivant'));

    expect(screen.getByText('Quel est ton budget et ta durée ?')).toBeTruthy();
    fireEvent.press(screen.getByText('Suivant'));

    expect(screen.getByText('Tes préférences')).toBeTruthy();
    fireEvent.press(screen.getByText('Voir mes correspondances'));

    await waitFor(() => expect(screen.getByText('82% de compatibilité')).toBeTruthy());
    expect(screen.getByText('✓ Type recherché')).toBeTruthy();
  });
});
