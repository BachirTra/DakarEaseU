import { Text, View } from "react-native";

export type BadgeTone = "success" | "warning" | "danger" | "neutral" | "primary";

const TONE_CLASSES: Record<BadgeTone, { bg: string; text: string; border: string }> = {
  success: { bg: "bg-secondary/10", text: "text-secondary", border: "border-secondary/30" },
  warning: { bg: "bg-accent/10", text: "text-accent", border: "border-accent/30" },
  danger: { bg: "bg-danger/10", text: "text-danger", border: "border-danger/30" },
  neutral: { bg: "bg-border/40", text: "text-textLight", border: "border-border" },
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const { bg, text, border } = TONE_CLASSES[tone];
  return (
    <View className={`self-start rounded-full border px-2.5 py-1 ${bg} ${border}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
