import type { PersonaType } from "@dakareaseu/types";

export interface OnboardingAnswers {
  alreadyInDakar: boolean;
  searchingFor: "self" | "child";
}

export function derivePersona(answers: OnboardingAnswers): PersonaType {
  if (answers.searchingFor === "child") return "parent";
  if (!answers.alreadyInDakar) return "nouveau";
  return "local";
}
