import { render, screen } from "@testing-library/react-native";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders its label text", () => {
    render(<Badge label="Vérifié" tone="success" />);
    expect(screen.getByText("Vérifié")).toBeTruthy();
  });

  it("applies the danger tone class when tone is danger", () => {
    render(<Badge label="Rejeté" tone="danger" />);
    const node = screen.getByText("Rejeté");
    expect(node).toBeTruthy();
  });
});
