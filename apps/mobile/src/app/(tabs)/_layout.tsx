import { Tabs } from "expo-router";
import { AuthGate } from "@/shared/components/AuthGate";
import { BottomTabIcon } from "@/shared/components/BottomTabIcon";
import { COLORS } from "@/constants/colors";
import { useTranslation } from "@/hooks/useTranslation";

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <AuthGate>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: { borderTopColor: COLORS.border, height: 60, paddingBottom: 8, paddingTop: 6 },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{ title: "Accueil", tabBarIcon: ({ color }) => <BottomTabIcon name="home" color={color} /> }}
        />
        <Tabs.Screen
          name="search"
          options={{ title: "Recherche", tabBarIcon: ({ color }) => <BottomTabIcon name="search" color={color} /> }}
        />
        <Tabs.Screen
          name="news"
          options={{ title: "News", tabBarIcon: ({ color }) => <BottomTabIcon name="news" color={color} /> }}
        />
        <Tabs.Screen
          name="favorites"
          options={{ title: "Favoris", tabBarIcon: ({ color }) => <BottomTabIcon name="favorites" color={color} /> }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: "Profil", tabBarIcon: ({ color }) => <BottomTabIcon name="profile" color={color} /> }}
        />
      </Tabs>
    </AuthGate>
  );
}
