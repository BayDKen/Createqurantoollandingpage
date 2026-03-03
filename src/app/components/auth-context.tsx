import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";

// ─── Singleton Supabase client ───
// Use a hard-coded window key so it survives HMR module re-evaluations.
// The GoTrueClient warning fires when two *different* JS objects share the
// same storageKey.  Storing the instance on `window` guarantees we always
// hand back the exact same object, even across HMR cycles.
const WIN_KEY = "__MY_MURAJAAH_SUPABASE__";

function getSupabase(): SupabaseClient {
  if (typeof window !== "undefined") {
    const cached = (window as any)[WIN_KEY];
    if (cached) return cached as SupabaseClient;
  }
  const instance = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: `my-murajaah-auth-${projectId}`,
      },
    },
  );
  if (typeof window !== "undefined") {
    (window as any)[WIN_KEY] = instance;
  }
  return instance;
}

// Create / retrieve the singleton once at module level so every consumer
// (AuthProvider, useAuth fallback) shares the same reference.
const supabaseSingleton: SupabaseClient = getSupabase();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const serverBase = `https://${projectId}.supabase.co/functions/v1/make-server-1bb74365`;

/**
 * Get a fresh access token, refreshing the session if needed.
 * This is the recommended way to get a token before making API calls,
 * instead of relying on the potentially-stale `accessToken` from state.
 */
async function getFreshAccessToken(): Promise<string | null> {
  const sb = getSupabase();
  // First try current session
  const { data: { session } } = await sb.auth.getSession();
  if (session?.access_token) {
    // Check if token is likely still valid (has > 30s remaining)
    try {
      const payload = JSON.parse(atob(session.access_token.split(".")[1]));
      const expiresAt = payload.exp * 1000;
      if (expiresAt - Date.now() > 30_000) {
        return session.access_token;
      }
    } catch {
      // Can't parse token, try refreshing
    }
    // Token is expired or close to expiry — force refresh
    const { data: refreshed } = await sb.auth.refreshSession();
    return refreshed.session?.access_token ?? session.access_token;
  }
  return null;
}

/**
 * Make an authenticated fetch request. Automatically:
 * 1. Gets a fresh token (refreshing if expired)
 * 2. Passes the token via `_userToken` (POST) or `?token=` (GET)
 * 3. On 401, forces a session refresh and retries once
 */
export async function authFetch(
  path: string,
  options: RequestInit & { body?: any } = {},
): Promise<Response> {
  const method = (options.method || "GET").toUpperCase();

  async function doFetch(token: string): Promise<Response> {
    // Always send the user JWT via X-User-Token header (preferred by server,
    // avoids body parsing just for auth — critical for large audio payloads)
    const commonHeaders: Record<string, string> = {
      Authorization: `Bearer ${publicAnonKey}`,
      "X-User-Token": token,
    };

    if (method === "GET" || method === "HEAD") {
      const separator = path.includes("?") ? "&" : "?";
      const url = `${serverBase}${path}${separator}token=${encodeURIComponent(token)}`;
      return fetch(url, {
        ...options,
        headers: {
          ...commonHeaders,
          ...options.headers,
        },
      });
    } else {
      // POST/PUT/DELETE — inject _userToken into JSON body (backward compat)
      let bodyObj: any = {};
      if (typeof options.body === "string") {
        try { bodyObj = JSON.parse(options.body); } catch { bodyObj = {}; }
      } else if (options.body && typeof options.body === "object") {
        bodyObj = options.body;
      }
      bodyObj._userToken = token;
      return fetch(`${serverBase}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...commonHeaders,
          ...options.headers,
        },
        body: JSON.stringify(bodyObj),
      });
    }
  }

  // Attempt 1: use fresh token
  const token = await getFreshAccessToken();
  if (!token) {
    throw new Error("No authenticated session — user must sign in");
  }

  let res = await doFetch(token);

  // Attempt 2: if 401, force-refresh and retry once
  if (res.status === 401) {
    console.log("[authFetch] Got 401, forcing session refresh and retrying...");
    const sb = getSupabase();
    const { data: refreshed } = await sb.auth.refreshSession();
    const freshToken = refreshed.session?.access_token;
    if (freshToken && freshToken !== token) {
      res = await doFetch(freshToken);
    }
  }

  return res;
}

// Save user profile to server (fire-and-forget)
async function saveUserProfile(data: Record<string, any>): Promise<boolean> {
  try {
    const res = await authFetch("/user-profile", {
      method: "POST",
      body: data,
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("Failed to save user profile:", res.status, errBody);
      return false;
    } else {
      console.log("User profile saved/updated successfully");
      return true;
    }
  } catch (err) {
    console.error("Error saving user profile:", err);
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always use the module-level singleton – no extra getSupabase() call.
  const supabase = supabaseSingleton;
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const profileSavedRef = useRef(false);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      setLoading(false);
      // NOTE: Do NOT save profile here — the token from getSession() may be
      // stale/expired before autoRefreshToken has had a chance to refresh it.
      // Profile saving is handled in onAuthStateChange below, which fires
      // with a fresh token after the refresh completes.
    }).catch((err) => {
      console.error("Error getting session:", err);
      setLoading(false);
    });

    // Listen for auth changes (including token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);

      // Save/update profile on sign-in or token refresh with a valid session.
      // On page reload the SDK can fire SIGNED_IN with a stale/expired token
      // followed by TOKEN_REFRESHED with a fresh one.  If the first call fails
      // with 401, reset the guard so the TOKEN_REFRESHED event can retry.
      if (
        session?.access_token &&
        session?.user &&
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
        !profileSavedRef.current
      ) {
        profileSavedRef.current = true;
        const ok = await saveUserProfile({
          name: session.user.user_metadata?.name || "",
          isLogin: event === "SIGNED_IN",
        });
        if (!ok) {
          // Allow next auth event (TOKEN_REFRESHED) to retry with a fresh token
          profileSavedRef.current = false;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      profileSavedRef.current = false;
    };
  }, [supabase]);

  const signUp = async (email: string, password: string, name: string): Promise<{ error: string | null }> => {
    try {
      const res = await fetch(`${serverBase}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        console.error("Signup error response:", data);
        return { error: data.error || "Registration failed" };
      }
      // Auto sign in after successful registration
      const signInResult = await signIn(email, password);
      return signInResult;
    } catch (err) {
      console.error("Signup network error:", err);
      return { error: "Network error during registration" };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    profileSavedRef.current = false; // Reset guard so onAuthStateChange can fire
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Sign in error:", error.message);
      return { error: error.message };
    }
    setUser(data.session?.user ?? null);
    setAccessToken(data.session?.access_token ?? null);
    // Profile save is handled by onAuthStateChange SIGNED_IN event above
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, signIn, signUp, signOut, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  // Return safe defaults during HMR when context may not be available
  if (!context) {
    return {
      user: null,
      loading: true,
      accessToken: null,
      signIn: async () => ({ error: "AuthProvider not ready" }),
      signUp: async () => ({ error: "AuthProvider not ready" }),
      signOut: async () => {},
      supabase: supabaseSingleton,
    } as AuthContextType;
  }
  return context;
}