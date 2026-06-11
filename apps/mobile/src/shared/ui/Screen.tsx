import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  className?: string;
}

export function Screen({ children, className = "" }: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className={`flex-1 px-4 ${className}`}>{children}</View>
    </SafeAreaView>
  );
}
