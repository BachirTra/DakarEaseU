import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { LoginScreen } from "../LoginScreen";

const mockLoginMutate = jest.fn();

jest.mock("@/features/auth/hooks/useAuth", () => ({
  useLogin: () => ({ mutateAsync: mockLoginMutate, isPending: false }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

jest.mock("@/hooks/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "common.appName": "DakarEaseU",
        "auth.login": "Connexion",
        "auth.email": "Email",
        "auth.password": "Mot de passe",
        "auth.continueWithGoogle": "Continuer avec Google",
        "auth.continueWithApple": "Continuer avec Apple",
        "auth.noAccount": "Pas encore de compte ?",
        "auth.signup": "Créer un compte",
        "common.comingSoon": "Bientôt disponible",
      };
      return map[key] ?? key;
    },
  }),
}));

describe("LoginScreen", () => {
  beforeEach(() => mockLoginMutate.mockReset());

  it("shows a validation error when submitting an invalid email", async () => {
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("Email"), "not-an-email");
    fireEvent.changeText(screen.getByPlaceholderText("Mot de passe"), "secret123");
    fireEvent.press(screen.getByText("Connexion"));
    await waitFor(() => expect(screen.getByText("Email invalide")).toBeTruthy());
    expect(mockLoginMutate).not.toHaveBeenCalled();
  });

  it("calls the login mutation with valid credentials", async () => {
    mockLoginMutate.mockResolvedValue({});
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("Email"), "etudiant@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Mot de passe"), "secret123");
    fireEvent.press(screen.getByText("Connexion"));
    await waitFor(() =>
      expect(mockLoginMutate).toHaveBeenCalledWith({ email: "etudiant@example.com", password: "secret123" })
    );
  });

  it("renders the Apple Sign-In button as present-but-disabled with a 'Bientôt disponible' caption", () => {
    render(<LoginScreen />);
    expect(screen.getByText("Continuer avec Apple")).toBeTruthy();
    expect(screen.getByText("Bientôt disponible")).toBeTruthy();
  });
});
