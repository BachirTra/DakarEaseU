import { Text, View } from "react-native";

export type BadgeTone = "success" | "warning" | "danger" | "neutral" | "primary";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-secondary/10 text-secondary border-secondary/30",
  warning: "bg-accent/10 text-accent border-accent/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  neutral: "bg-border/40 text-textLight border-border",
  primary: "bg-primary/10 text-primary border-primary/30",
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const toneClass = TONE_CLASSES[tone];
  const [bg, text, border] = toneClass.split(" ");
  return (
    <View className={`self-start rounded-full border px-2.5 py-1 ${bg} ${border}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
