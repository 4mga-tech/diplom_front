import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useSyncExternalStore } from "react";

export type AuthUser = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string | null;
};

type AuthState = {
  isHydrated: boolean;
  user: AuthUser | null;
};

const USER_STORAGE_KEY = "user";
const TOKEN_STORAGE_KEY = "token";
const LEGACY_AVATAR_STORAGE_KEY = "avatarUri";

let state: AuthState = {
  isHydrated: false,
  user: null,
};

const listeners = new Set<() => void>();
let hydratePromise: Promise<AuthUser | null> | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(nextState: AuthState) {
  state = nextState;
  emit();
}

function normalizeAvatarUrl(value: unknown) {
  if (typeof value !== "string") {
    return value === null ? null : undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Record<string, unknown>;

  return {
    id: typeof candidate.id === "string" ? candidate.id : undefined,
    _id: typeof candidate._id === "string" ? candidate._id : undefined,
    name: typeof candidate.name === "string" ? candidate.name : undefined,
    email: typeof candidate.email === "string" ? candidate.email : undefined,
    avatarUrl: normalizeAvatarUrl(candidate.avatarUrl),
  };
}

async function persistUser(user: AuthUser | null) {
  if (user) {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return;
  }

  await AsyncStorage.removeItem(USER_STORAGE_KEY);
}

export async function hydrateAuthState() {
  if (state.isHydrated) {
    return state.user;
  }

  if (!hydratePromise) {
    hydratePromise = (async () => {
      const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const parsed = stored ? normalizeAuthUser(JSON.parse(stored)) : null;

      setState({
        isHydrated: true,
        user: parsed,
      });

      return parsed;
    })().finally(() => {
      hydratePromise = null;
    });
  }

  return hydratePromise;
}

export function subscribeAuthState(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAuthState() {
  return state;
}

export function useAuthState() {
  const snapshot = useSyncExternalStore(
    subscribeAuthState,
    getAuthState,
    getAuthState,
  );

  useEffect(() => {
    if (!snapshot.isHydrated) {
      void hydrateAuthState();
    }
  }, [snapshot.isHydrated]);

  return snapshot;
}

export async function setCurrentUser(user: AuthUser | null) {
  const normalizedUser = normalizeAuthUser(user);
  await persistUser(normalizedUser);
  setState({
    isHydrated: true,
    user: normalizedUser,
  });
}

export async function mergeCurrentUser(patch: Partial<AuthUser>) {
  const nextUser = state.user ? { ...state.user, ...patch } : normalizeAuthUser(patch);
  await setCurrentUser(nextUser);
  return nextUser;
}

export async function setAuthSession({
  token,
  user,
}: {
  token?: string;
  user?: unknown;
}) {
  if (token) {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  await AsyncStorage.removeItem(LEGACY_AVATAR_STORAGE_KEY);
  await setCurrentUser(normalizeAuthUser(user));
}

export async function clearAuthSession() {
  await AsyncStorage.multiRemove([
    "registered",
    "onboardingDone",
    TOKEN_STORAGE_KEY,
    USER_STORAGE_KEY,
    LEGACY_AVATAR_STORAGE_KEY,
  ]);
  await AsyncStorage.setItem("fromLogout", "true");

  setState({
    isHydrated: true,
    user: null,
  });
}
