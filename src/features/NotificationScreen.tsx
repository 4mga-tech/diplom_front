import { Notification, useNotifications } from "@/src/store/notificationStore";
import { theme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

function getIcon(type: string) {
  switch (type) {
    case "lesson":
      return { name: "book-outline", color: "#60A5FA" };
    case "streak":
      return { name: "flame-outline", color: "#F97316" };
    case "course":
      return { name: "school-outline", color: "#A78BFA" };
    default:
      return { name: "notifications-outline", color: "#94A3B8" };
  }
}

export default function NotificationScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const { notifications, remove } = useNotifications();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBack = () => {
    fadeAnim.stopAnimation();
    translateY.stopAnimation();
    router.back();
  };

  // Swipe delete action
  const renderRightActions = (id: string) => (
    <Pressable onPress={() => remove(id)} style={styles.deleteBtn}>
      <Ionicons name="trash-outline" size={24} color="white" />
      <Text style={styles.deleteText}>Delete</Text>
    </Pressable>
  );

  const renderItem = ({ item }: { item: Notification }) => {
    const icon = getIcon(item.type);

    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <View style={styles.card}>
          <View style={styles.left}>
            <View
              style={[styles.iconWrap, { backgroundColor: icon.color + "22" }]}
            >
              <Ionicons name={icon.name as any} size={18} color={icon.color} />
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>Just now</Text>
          </View>

          {!item.read && <View style={styles.dot} />}
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2563EB", "#7C3AED"]} style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.muted} />
        </Pressable>
        <View style={styles.headerRight}>
          <Ionicons name="notifications" size={26} color="white" />
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
      </LinearGradient>

      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY }],
        }}
      >
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="notifications-off-outline"
                size={40}
                color="#64748B"
              />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginRight: 6,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30,41,59,0.35)",
    borderWidth: 1,
    borderColor: "rgba(51,65,85,0.55)",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  left: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  message: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  time: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#3B82F6",
  },
  deleteBtn: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginVertical: 4,
    borderRadius: 12,
  },

  deleteText: {
    color: "white",
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: {
    color: "#64748B",
    marginTop: 10,
    fontWeight: "600",
  },
});
