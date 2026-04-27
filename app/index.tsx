import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
const logoImage = require("../assets/logo.png");

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
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingLogoFrame}>
          <Image
            source={logoImage}
            style={styles.loadingLogo}
            resizeMode="contain"
          />
        </View>
        <ActivityIndicator size="small" color="#0F172A" />
        <Text style={styles.loadingText}>Loading</Text>
      </View>
    );
  }

  return <Redirect href={route} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingLogoFrame: {
    width: 102,
    height: 102,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  loadingLogo: {
    width: 130,
    height: 130,
    marginTop: -5,
  },
  loadingText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
});
