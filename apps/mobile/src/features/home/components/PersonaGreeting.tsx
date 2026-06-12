import { Text, View } from "react-native";
import type { PersonaType } from "@dakareaseu/types";
import type { CategoryId } from "@/constants/categories";

interface PersonaCopy {
  greeting: string;
  hint: string;
  priority: CategoryId[];
}

export const PERSONA_COPY: Record<PersonaType, PersonaCopy> = {
  nouveau: {
    greeting: "Bienvenue à Dakar 👋",
    hint: "Découvre les écoles et logements près de toi",
    priority: ["ecoles", "logements", "transport"],
  },
  local: {
    greeting: "Bonjour 👋",
    hint: "Bons plans et événements de la semaine",
    priority: ["logements", "transport", "restaurants"],
  },
  parent: {
    greeting: "Bonsoir 👋",
    hint: "Logements vérifiés et écoles partenaires",
    priority: ["logements", "ecoles", "restaurants"],
  },
};

interface PersonaGreetingProps {
  persona: PersonaType;
  fullName: string | null;
}

export function PersonaGreeting({ persona, fullName }: PersonaGreetingProps) {
  const copy = PERSONA_COPY[persona];
  return (
    <View className="mb-4">
      <Text className="text-2xl font-bold text-text">
        {copy.greeting}
        {fullName ? `, ${fullName.split(" ")[0]}` : ""}
      </Text>
      <Text className="mt-1 text-sm text-textLight">{copy.hint}</Text>
    </View>
  );
}
