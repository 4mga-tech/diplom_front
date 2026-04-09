import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function Index() {
  const [route, setRoute] = useState<"/welcome" | "/(tabs)" | null>(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!isMounted) return;
        setRoute(token ? "/(tabs)" : "/welcome");
      } catch {
        if (!isMounted) return;
        setRoute("/welcome");
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!route) {
    return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
  }

  return <Redirect href={route} />;
}
