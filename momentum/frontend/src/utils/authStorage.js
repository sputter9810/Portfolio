const TOKEN_KEY = "momentum_token";
const USER_KEY = "momentum_user";

export function saveAuth(authResponse) {
  if (authResponse.token) {
    localStorage.setItem(TOKEN_KEY, authResponse.token);
  }

  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      userId: authResponse.userId,
      name: authResponse.name,
      email: authResponse.email,
    })
  );
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const user = localStorage.getItem(USER_KEY);

  try {
    return user ? JSON.parse(user) : null;
  } catch {
    clearAuth();
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}