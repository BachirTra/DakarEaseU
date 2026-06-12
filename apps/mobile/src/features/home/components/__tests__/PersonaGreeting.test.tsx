import { render, screen } from "@testing-library/react-native";
import { PersonaGreeting } from "../PersonaGreeting";

describe("PersonaGreeting", () => {
  it("shows the 'nouveau' greeting and hint", () => {
    render(<PersonaGreeting persona="nouveau" fullName="Awa" />);
    expect(screen.getByText(/Bienvenue à Dakar/)).toBeTruthy();
    expect(screen.getByText(/Découvre les écoles et logements/)).toBeTruthy();
  });

  it("shows the 'parent' greeting and hint", () => {
    render(<PersonaGreeting persona="parent" fullName="Moussa" />);
    expect(screen.getByText(/Bonsoir/)).toBeTruthy();
    expect(screen.getByText(/Logements vérifiés et écoles partenaires/)).toBeTruthy();
  });

  it("never renders any persona-switching control", () => {
    render(<PersonaGreeting persona="local" fullName="Fatou" />);
    expect(screen.queryByText(/changer de profil/i)).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
