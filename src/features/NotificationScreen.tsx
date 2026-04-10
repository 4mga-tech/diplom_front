import { Notification, useNotifications } from "@/src/store/notificationStore";
import { theme } from "@/src/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

type NotificationMeta = {
  category: "xp" | "lesson" | "system";
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

type SectionItem = {
  title: string;
  data: Notification[];
};

function getNotificationMeta(item: Notification): NotificationMeta {
  switch (item.type) {
    case "lesson":
      return {
        category: "lesson",
        title: "Lesson update",
        description: item.message,
        icon: "book-outline",
        color: "#60A5FA",
      };
    case "streak":
      return {
        category: "xp",
        title: "XP reward",
        description: item.message,
        icon: "flash-outline",
        color: "#F59E0B",
      };
    default:
      return {
        category: "system",
        title: "System message",
        description: item.message,
        icon: "notifications-outline",
        color: "#A78BFA",
      };
  }
}

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < day * 7) return `${Math.floor(diff / day)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function isToday(timestamp: number) {
  const now = new Date();
  const date = new Date(timestamp);

  return (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()
  );
}

export default function NotificationScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const { notifications, remove, subscribe } = useNotifications();
  const subscribeRef = useRef(subscribe);
  const [refreshing, setRefreshing] = useState(false);
  const [readOverrides, setReadOverrides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    subscribeRef.current = subscribe;
  }, [subscribe]);

  useEffect(() => {
    const unsubscribe = subscribeRef.current();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 48,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      unsubscribe();
    };
  }, [fadeAnim, translateY]);

  const groupedNotifications = useMemo(() => {
    const today = notifications.filter((item) => isToday(item.createdAt));
    const earlier = notifications.filter((item) => !isToday(item.createdAt));
    const sections: SectionItem[] = [];

    if (today.length) {
      sections.push({ title: "Today", data: today });
    }

    if (earlier.length) {
      sections.push({ title: "Earlier", data: earlier });
    }

    return sections;
  }, [notifications]);

  const unreadCount = notifications.filter(
    (item) => !(readOverrides[item.id] ?? item.read)
  ).length;

  const handleBack = () => {
    fadeAnim.stopAnimation();
    translateY.stopAnimation();
    router.back();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 650);
  };

  const handleMarkAsRead = (id: string) => {
    setReadOverrides((current) => ({ ...current, [id]: true }));
  };

  const handleDelete = (id: string) => {
    setReadOverrides((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    remove(id);
  };

  const renderRightActions = (id: string) => (
    <Pressable onPress={() => handleDelete(id)} style={styles.deleteBtn}>
      <Ionicons name="trash-outline" size={20} color="white" />
      <Text style={styles.deleteText}>Delete</Text>
    </Pressable>
  );

  const renderItem = ({ item }: { item: Notification }) => {
    const meta = getNotificationMeta(item);
    const isRead = readOverrides[item.id] ?? item.read;

    return (
      <Swipeable
        overshootRight={false}
        renderRightActions={() => renderRightActions(item.id)}
      >
        <Pressable
          onPress={() => handleMarkAsRead(item.id)}
          style={({ pressed }) => [
            styles.card,
            isRead ? styles.cardRead : styles.cardUnread,
            pressed && styles.cardPressed,
          ]}
        >
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: `${meta.color}22`, borderColor: `${meta.color}40` },
            ]}
          >
            <Ionicons name={meta.icon} size={20} color={meta.color} />
          </View>

          <View style={styles.content}>
            <View style={styles.rowTop}>
              <Text style={[styles.title, isRead && styles.titleRead]}>
                {meta.title}
              </Text>
              <Text style={[styles.time, isRead && styles.timeRead]}>
                {formatRelativeTime(item.createdAt)}
              </Text>
            </View>

            <Text style={[styles.description, isRead && styles.descriptionRead]}>
              {meta.description}
            </Text>

            <View style={styles.rowBottom}>
              <View
                style={[
                  styles.categoryChip,
                  { backgroundColor: `${meta.color}18`, borderColor: `${meta.color}30` },
                ]}
              >
                <Text style={[styles.categoryText, { color: meta.color }]}>
                  {meta.category.toUpperCase()}
                </Text>
              </View>

              {!isRead ? (
                <Pressable
                  onPress={() => handleMarkAsRead(item.id)}
                  hitSlop={10}
                  style={({ pressed }) => [
                    styles.markReadButton,
                    pressed && styles.markReadButtonPressed,
                  ]}
                >
                  <Text style={styles.markReadText}>Mark as read</Text>
                </Pressable>
              ) : (
                <Text style={styles.readLabel}>Read</Text>
              )}
            </View>
          </View>

          {!isRead && <View style={styles.unreadDot} />}
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#111827", "#0F172A", "#111827"]} style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.backBtnPressed,
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>

        <View style={styles.headerContent}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerEyebrow}>Inbox</Text>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0
                ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`
                : "You are all caught up"}
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="notifications" size={24} color="#E2E8F0" />
          </View>
        </View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.listWrap,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <SectionList
          sections={groupedNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#94A3B8"
            />
          }
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
          SectionSeparatorComponent={() => <View style={styles.sectionSpacer} />}
          ItemSeparatorComponent={() => <View style={styles.itemSpacer} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons
                  name="notifications-off-outline"
                  size={34}
                  color="#94A3B8"
                />
              </View>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyText}>
                New lessons, XP rewards, and system updates will show up here.
              </Text>
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
    backgroundColor: "#020617",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderBottomWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.72)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.14)",
    marginBottom: 18,
  },
  backBtnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  headerTextBlock: {
    flex: 1,
  },
  headerEyebrow: {
    color: "#60A5FA",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  headerTitle: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 6,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(37,99,235,0.18)",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.22)",
  },
  listWrap: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  sectionTitle: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sectionSpacer: {
    height: 20,
  },
  itemSpacer: {
    height: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  cardUnread: {
    backgroundColor: "#111C2E",
    borderColor: "rgba(96,165,250,0.22)",
  },
  cardRead: {
    backgroundColor: "rgba(15,23,42,0.72)",
    borderColor: "rgba(148,163,184,0.10)",
    opacity: 0.72,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
  },
  content: {
    flex: 1,
    paddingRight: 10,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
  },
  titleRead: {
    color: "#CBD5E1",
  },
  time: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "600",
  },
  timeRead: {
    color: "#94A3B8",
  },
  description: {
    color: "#D7E2F0",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  descriptionRead: {
    color: "#94A3B8",
  },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  markReadButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.12)",
  },
  markReadButtonPressed: {
    opacity: 0.8,
  },
  markReadText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "600",
  },
  readLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#38BDF8",
    marginTop: 4,
  },
  deleteBtn: {
    width: 92,
    marginLeft: 10,
    borderRadius: 22,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 28,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.92)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.14)",
    marginBottom: 18,
  },
  emptyTitle: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "800",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
  },
});
