import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  fullName: z.string().min(2, "Nom trop court"),
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const onboardingAnswersSchema = z.object({
  alreadyInDakar: z.boolean(),
  searchingFor: z.enum(["self", "child"]),
});
export type OnboardingAnswersInput = z.infer<typeof onboardingAnswersSchema>;
