import { fireEvent, render, screen } from '@testing-library/react-native';
import { LanguageSelector } from '../LanguageSelector';

describe('LanguageSelector', () => {
  it("shows fr as active and wo/en as present-but-disabled with a 'Bientôt disponible' caption", () => {
    render(<LanguageSelector />);
    expect(screen.getByText('Français')).toBeTruthy();
    expect(screen.getByText('Wolof')).toBeTruthy();
    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getAllByText('Bientôt disponible').length).toBe(2);
  });

  it('does not change the active locale when a disabled option is pressed', () => {
    render(<LanguageSelector />);
    fireEvent.press(screen.getByText('Wolof'));
    expect(screen.getByText('Français')).toBeTruthy();
  });
});
