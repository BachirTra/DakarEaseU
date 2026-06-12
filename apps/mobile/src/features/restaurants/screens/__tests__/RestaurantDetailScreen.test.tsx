import { render, screen } from "@testing-library/react-native";
import { RestaurantDetailScreen } from "../RestaurantDetailScreen";

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "c0000000-0000-0000-0000-000000000001" }),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/features/restaurants/hooks/useRestaurants", () => ({
  useRestaurantDetail: () => ({
    data: {
      id: "c0000000-0000-0000-0000-000000000001",
      name: "Chez Awa",
      cuisine_type: "Sénégalaise",
      price_range: "€€",
      district: "Médina",
      phone: "+221770000000",
      whatsapp: "221770000000",
      description: "Cuisine traditionnelle.",
      specialties: ["Thiéboudiène", "Yassa poulet"],
      restaurant_media: [],
    },
    isLoading: false,
  }),
}));

describe("RestaurantDetailScreen", () => {
  it("never renders a 'Vérifié' badge for restaurants", () => {
    render(<RestaurantDetailScreen />);
    expect(screen.queryByText("Vérifié")).toBeNull();
  });

  it("never renders a table-reservation action — only menu/order via WhatsApp/call", () => {
    render(<RestaurantDetailScreen />);
    expect(screen.queryByText(/réserver une table/i)).toBeNull();
    expect(screen.getByText("Voir le menu")).toBeTruthy();
    expect(screen.getByText("WhatsApp")).toBeTruthy();
    expect(screen.getByText("Appeler")).toBeTruthy();
  });
});
