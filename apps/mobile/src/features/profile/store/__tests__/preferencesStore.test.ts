import { usePreferencesStore } from "../preferencesStore";

describe("preferencesStore", () => {
  beforeEach(() => {
    usePreferencesStore.setState({ locale: "fr" });
  });

  it("defaults to the fr locale", () => {
    expect(usePreferencesStore.getState().locale).toBe("fr");
  });

  it("only allows fr to be set at launch (wo/en are present-but-disabled)", () => {
    usePreferencesStore.getState().setLocale("wo");
    expect(usePreferencesStore.getState().locale).toBe("fr");
  });
});
