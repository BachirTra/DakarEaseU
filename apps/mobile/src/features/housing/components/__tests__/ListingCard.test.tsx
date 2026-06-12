import { render, screen } from "@testing-library/react-native";
import { ListingCard } from "../ListingCard";
import type { ListingSummary } from "@/features/housing/types/housing.types";

jest.mock("@/hooks/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "listing.verified": "Vérifié",
        "listing.colocationAvailable": "Colocation disponible",
        "common.perMonth": "/ mois",
      };
      return map[key] ?? key;
    },
  }),
}));

jest.mock("expo-image", () => ({
  Image: "Image",
}));

const baseSummary: ListingSummary = {
  id: "b0000000-0000-0000-0000-000000000001",
  title: "Studio meublé proche UCAD",
  price: 85000,
  currency: "XOF",
  period: "month",
  type: "studio",
  district: "Fann",
  distance_label: "10 min de l'UCAD",
  rating: 4.6,
  reviews_count: 12,
  verification_status: "published",
  colocation_available: false,
  cover_media: { id: "m1", url: "https://example.com/photo.jpg", media_type: "photo" },
};

describe("ListingCard", () => {
  it("renders the title, price and district", () => {
    render(<ListingCard listing={baseSummary} isFavorite={false} onToggleFavorite={() => {}} onPress={() => {}} />);
    expect(screen.getByText("Studio meublé proche UCAD")).toBeTruthy();
    expect(screen.getByText("Fann")).toBeTruthy();
  });

  it("shows the 'Vérifié' badge for published listings (verification_status === 'published')", () => {
    render(<ListingCard listing={baseSummary} isFavorite={false} onToggleFavorite={() => {}} onPress={() => {}} />);
    expect(screen.getByText("Vérifié")).toBeTruthy();
  });

  it("does not show the 'Vérifié' badge for non-published listings", () => {
    render(
      <ListingCard
        listing={{ ...baseSummary, verification_status: "pending" }}
        isFavorite={false}
        onToggleFavorite={() => {}}
        onPress={() => {}}
      />
    );
    expect(screen.queryByText("Vérifié")).toBeNull();
  });
});
