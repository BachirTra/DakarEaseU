import { derivePersona, type OnboardingAnswers } from "../derivePersona";

describe("derivePersona", () => {
  it("returns 'parent' when searching on behalf of a child, regardless of location", () => {
    const answers: OnboardingAnswers = { alreadyInDakar: true, searchingFor: "child" };
    expect(derivePersona(answers)).toBe("parent");
  });

  it("returns 'nouveau' when not yet in Dakar and searching for self", () => {
    const answers: OnboardingAnswers = { alreadyInDakar: false, searchingFor: "self" };
    expect(derivePersona(answers)).toBe("nouveau");
  });

  it("returns 'local' when already in Dakar and searching for self", () => {
    const answers: OnboardingAnswers = { alreadyInDakar: true, searchingFor: "self" };
    expect(derivePersona(answers)).toBe("local");
  });

  it("prioritizes 'parent' over 'nouveau' when both could apply", () => {
    const answers: OnboardingAnswers = { alreadyInDakar: false, searchingFor: "child" };
    expect(derivePersona(answers)).toBe("parent");
  });
});
