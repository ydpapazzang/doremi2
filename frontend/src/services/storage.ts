const USER_ID_KEY = "doremi-user-id";
const USER_NAME_KEY = "doremi-nickname";
const SELECTED_LEVEL_KEY = "doremi-selected-level";

export function saveUser(userId: number, nickname: string) {
  localStorage.setItem(USER_ID_KEY, String(userId));
  localStorage.setItem(USER_NAME_KEY, nickname);
}

export function getStoredUserId(): number | null {
  const value = localStorage.getItem(USER_ID_KEY);
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function hasStoredUser() {
  return getStoredUserId() !== null;
}

export function getStoredNickname(): string {
  return localStorage.getItem(USER_NAME_KEY) ?? "친구";
}

export function saveSelectedLevel(level: number) {
  localStorage.setItem(SELECTED_LEVEL_KEY, String(level));
}

export function getStoredSelectedLevel(): number | null {
  const value = localStorage.getItem(SELECTED_LEVEL_KEY);
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function clearStoredSession() {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem(SELECTED_LEVEL_KEY);
}
