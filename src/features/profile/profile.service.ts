import { api } from "@/lib/api";
import {
  AuthUser,
  mergeCurrentUser,
  normalizeAuthUser,
  setCurrentUser,
} from "@/src/store/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

function extractPayload<T>(raw: T) {
  if (raw && typeof raw === "object" && "data" in (raw as Record<string, unknown>)) {
    return (raw as unknown as { data: unknown }).data;
  }

  return raw;
}

function extractUserLike(raw: unknown) {
  if (!raw || typeof raw !== "object") {
    return raw;
  }

  const candidate = raw as Record<string, unknown>;
  return candidate.user ?? candidate.profile ?? candidate.me ?? raw;
}

function resolveAssetUrl(value: string | null | undefined) {
  if (!value) {
    return value ?? null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const baseURL = String(api.defaults.baseURL ?? "").trim();
  if (!baseURL) {
    return value;
  }

  try {
    const base = new URL(baseURL);
    return new URL(value, `${base.protocol}//${base.host}`).toString();
  } catch {
    return value;
  }
}

function normalizeProfileUser(raw: unknown) {
  const normalized = normalizeAuthUser(raw);

  if (!normalized) {
    return null;
  }

  return {
    ...normalized,
    avatarUrl: resolveAssetUrl(normalized.avatarUrl),
  };
}

function normalizeUserPatch(raw: unknown): Partial<AuthUser> | null {
  const normalized = normalizeProfileUser(raw);

  if (normalized) {
    return normalized;
  }

  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  if (!("avatarUrl" in candidate)) {
    return null;
  }

  return {
    avatarUrl:
      typeof candidate.avatarUrl === "string"
        ? candidate.avatarUrl.trim() || null
        : candidate.avatarUrl === null
          ? null
          : undefined,
  };
}

export async function fetchCurrentUserProfile() {
  const response = await api.get("/user/profile");
  const payload = extractUserLike(extractPayload(response.data));
  const user = normalizeProfileUser(payload);

  if (!user) {
    throw new Error("Profile response did not include a valid user.");
  }

  await setCurrentUser(user);
  return user;
}

export async function updateProfileName(name: string) {
  const response = await api.patch("/user/profile", { name });
  const payload = extractUserLike(extractPayload(response.data));
  const user = normalizeProfileUser(payload);

  if (!user) {
    throw new Error("Profile update response did not include a valid user.");
  }

  await setCurrentUser(user);
  return user;
}

function buildUploadAsset(asset: ImagePicker.ImagePickerAsset) {
  const fileName = asset.fileName?.trim() || `avatar-${Date.now()}.jpg`;
  const mimeType = asset.mimeType?.trim() || "image/jpeg";

  return {
    uri: asset.uri,
    name: fileName,
    type: mimeType,
  };
}

function getAvatarUploadEndpoint() {
  const baseURL = String(api.defaults.baseURL ?? "").trim().toLowerCase();
  return baseURL.endsWith("/api") ? "/me/avatar" : "/api/me/avatar";
}

export async function uploadCurrentUserAvatar(
  asset: ImagePicker.ImagePickerAsset,
) {
  const endpoint = getAvatarUploadEndpoint();
  const requestUrl = api.getUri({ url: endpoint });
  const token = await AsyncStorage.getItem("token");
  const formData = new FormData();
  const file = buildUploadAsset(asset);
  formData.append("avatar", file as never);

  try {
    const response = await api.post(endpoint, formData, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });

    const payload = extractPayload(response.data);
    const userPatch =
      normalizeUserPatch(extractUserLike(payload)) ??
      normalizeUserPatch(payload);

    if (!userPatch) {
      throw new Error(
        "Avatar upload response did not include updated profile data.",
      );
    }

    await mergeCurrentUser(userPatch);
    return userPatch;
  } catch (error: any) {
    console.log("[avatar-upload] request failed", {
      url: requestUrl,
      endpoint,
      hasToken: Boolean(token),
      status: error?.response?.status ?? null,
      data: error?.response?.data ?? null,
      file,
    });
    throw error;
  }
}
