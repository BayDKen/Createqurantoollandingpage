import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Helper: extract user access token from request.
// The Edge Function gateway validates the Authorization header JWT — if it's
// expired or invalid the request is rejected before it reaches our code.
// Therefore the frontend ALWAYS sends `Authorization: Bearer <anon_key>` for
// gateway auth and passes the real user JWT via:
//   • POST requests  → JSON body field `_userToken`
//   • GET  requests  → query parameter `token`
async function getUserToken(c: any): Promise<string | undefined> {
  // 0. Preferred: X-User-Token header (avoids body parsing entirely)
  const xToken = c.req.header("X-User-Token") || c.req.header("x-user-token");
  if (xToken) return xToken;

  // 1. Try query parameter (GET requests)
  const qToken = c.req.query("token");
  if (qToken) return qToken;

  // 2. Try body field (POST requests) — peek at body without consuming it
  try {
    const body = await c.req.json();
    // Store parsed body so downstream handlers can read it again
    c._parsedBody = body;
    if (body?._userToken) return body._userToken;
  } catch (e) {
    // Not a JSON body or already consumed — log for debugging
    console.log(`getUserToken: body parse failed: ${e}`);
  }

  // 3. Fallback: Authorization header (backward compat, but will only work if
  //    the JWT happens to be valid at the gateway level)
  const authHeader = c.req.header("Authorization")?.split(" ")[1];
  if (authHeader) {
    console.log("getUserToken: falling back to Authorization header (may be anon key, not user JWT)");
  }
  return authHeader;
}

// Helper: get already-parsed request body (avoids double-consume)
async function getRequestBody(c: any): Promise<any> {
  if (c._parsedBody) return c._parsedBody;
  return await c.req.json();
}

// Helper: safely parse a KV value that might be a JSON string or already an object
function parseKvValue(val: any): any {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val; // already an object from JSONB
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey", "x-user-token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1bb74365/health", (c) => {
  return c.json({ status: "ok" });
});

// ─── Idempotent bucket creation for voice recordings ───
const VOICE_BUCKET = "make-1bb74365-voice-recordings";
let bucketReady = false;

async function ensureVoiceBucket() {
  if (bucketReady) return;
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b: any) => b.name === VOICE_BUCKET);
    if (!exists) {
      await supabase.storage.createBucket(VOICE_BUCKET, { public: false });
      console.log(`Created storage bucket: ${VOICE_BUCKET}`);
    }
    bucketReady = true;
  } catch (err) {
    console.log(`Bucket init error (non-fatal): ${err}`);
  }
}
// Fire-and-forget bucket creation on startup
ensureVoiceBucket();

// Signup endpoint
app.post("/make-server-1bb74365/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Missing required fields: email, password, name" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Signup error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Save user profile to KV store
    const userProfile = {
      id: data.user.id,
      email: data.user.email,
      name,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      totalPractices: 0,
      preferences: { language: "id", darkMode: false },
    };
    await kv.set(`user:${data.user.id}`, userProfile);
    console.log(`User profile saved for: ${email}`);

    return c.json({ user: { id: data.user.id, email: data.user.email } });
  } catch (err) {
    console.log(`Unexpected signup error: ${err}`);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// ─── User Profile Routes ───

// Save/update user profile (called on login, or to update preferences)
app.post("/make-server-1bb74365/user-profile", async (c) => {
  try {
    const accessToken = await getUserToken(c);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      console.log(`User profile save auth error: ${authError?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await getRequestBody(c);
    const profileKey = `user:${user.id}`;
    const existingRaw = await kv.get(profileKey);
    const existing = existingRaw ? parseKvValue(existingRaw) : {};

    const updatedProfile = {
      ...existing,
      id: user.id,
      email: user.email,
      name: body.name || existing.name || user.user_metadata?.name || "",
      lastLoginAt: new Date().toISOString(),
      loginCount: (existing.loginCount || 0) + (body.isLogin ? 1 : 0),
      preferences: body.preferences || existing.preferences || { language: "id", darkMode: false },
      createdAt: existing.createdAt || new Date().toISOString(),
    };

    await kv.set(profileKey, updatedProfile);
    console.log(`User profile updated for: ${user.email}`);
    return c.json({ success: true, profile: updatedProfile });
  } catch (err) {
    console.log(`User profile save error: ${err}`);
    return c.json({ error: "Internal server error saving user profile" }, 500);
  }
});

// Get user profile
app.get("/make-server-1bb74365/user-profile", async (c) => {
  try {
    const accessToken = await getUserToken(c);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      console.log(`User profile fetch auth error: ${authError?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profileKey = `user:${user.id}`;
    const profileRaw = await kv.get(profileKey);
    const profile = profileRaw ? parseKvValue(profileRaw) : null;

    console.log(`User profile fetched for: ${user.email}`);
    return c.json({ profile });
  } catch (err) {
    console.log(`User profile fetch error: ${err}`);
    return c.json({ error: "Internal server error fetching user profile" }, 500);
  }
});

// ─── Progress Tracker Routes ───

// Save a practice result
app.post("/make-server-1bb74365/progress", async (c) => {
  try {
    const accessToken = await getUserToken(c);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      console.log(`Progress save auth error: ${authError?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await getRequestBody(c);
    const { score, total, timestamp, surahs, voiceAnswers, questionDetails } = body;

    if (score === undefined || total === undefined || !timestamp) {
      return c.json({ error: "Missing required fields: score, total, timestamp" }, 400);
    }

    const record = {
      userId: user.id,
      score,
      total,
      percentage: Math.round((score / total) * 100),
      timestamp,
      surahs: surahs || [],
      voiceAnswers: voiceAnswers || [],
      questionDetails: questionDetails || [],
      createdAt: new Date().toISOString(),
    };

    // Save to KV with key: progress:{userId}:{timestamp}
    await kv.set(`progress:${user.id}:${timestamp}`, record);

    // Save voice answers separately for detailed analysis
    if (voiceAnswers && voiceAnswers.length > 0) {
      const voiceRecord = {
        userId: user.id,
        timestamp,
        answers: voiceAnswers,
        totalVoiceAnswers: voiceAnswers.length,
        correctVoiceAnswers: voiceAnswers.filter((v: any) => v.isCorrect).length,
        createdAt: new Date().toISOString(),
      };
      await kv.set(`voice:${user.id}:${timestamp}`, voiceRecord);
      console.log(`Voice answers saved for user ${user.id}: ${voiceAnswers.length} voice answers`);
    }

    // Update stats summary
    const statsKey = `stats:${user.id}`;
    const existingStats = await kv.get(statsKey);
    let stats = existingStats
      ? parseKvValue(existingStats)
      : { totalPractices: 0, totalCorrect: 0, totalQuestions: 0, bestScore: 0, streak: 0, lastPractice: "", totalVoiceAnswers: 0, correctVoiceAnswers: 0 };

    stats.totalPractices += 1;
    stats.totalCorrect += score;
    stats.totalQuestions += total;
    
    // Track voice answer stats
    if (voiceAnswers && voiceAnswers.length > 0) {
      stats.totalVoiceAnswers = (stats.totalVoiceAnswers || 0) + voiceAnswers.length;
      stats.correctVoiceAnswers = (stats.correctVoiceAnswers || 0) + voiceAnswers.filter((v: any) => v.isCorrect).length;
    }

    // Simple streak: if practiced today or yesterday, increment; else reset
    const now = new Date();
    const prevLastPractice = stats.lastPractice;
    stats.lastPractice = now.toISOString();
    
    if (record.percentage > stats.bestScore) {
      stats.bestScore = record.percentage;
    }
    
    if (prevLastPractice) {
      const lastPracticeDate = new Date(prevLastPractice);
      const diffDays = Math.floor((now.getTime() - lastPracticeDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        stats.streak = (stats.streak || 0) + 1;
      } else {
        stats.streak = 1;
      }
    } else {
      stats.streak = 1;
    }

    await kv.set(statsKey, stats);

    // Update user profile total practices
    const profileKey = `user:${user.id}`;
    const profileRaw = await kv.get(profileKey);
    if (profileRaw) {
      const profile = parseKvValue(profileRaw);
      profile.totalPractices = stats.totalPractices;
      profile.lastPracticeAt = now.toISOString();
      await kv.set(profileKey, profile);
    }

    console.log(`Progress saved for user ${user.id}: ${score}/${total}, voice: ${voiceAnswers?.length || 0}`);
    return c.json({ success: true, record });
  } catch (err) {
    console.log(`Progress save error: ${err}`);
    return c.json({ error: "Internal server error saving progress" }, 500);
  }
});

// Get user's practice history
app.get("/make-server-1bb74365/progress", async (c) => {
  try {
    const accessToken = await getUserToken(c);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      console.log(`Progress fetch auth error: ${authError?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get stats
    const statsKey = `stats:${user.id}`;
    const statsRaw = await kv.get(statsKey);
    const stats = statsRaw
      ? parseKvValue(statsRaw)
      : { totalPractices: 0, totalCorrect: 0, totalQuestions: 0, bestScore: 0, streak: 0, lastPractice: "", totalVoiceAnswers: 0, correctVoiceAnswers: 0 };

    // Get recent practice history (last 20)
    const historyEntries = await kv.getByPrefix(`progress:${user.id}:`);
    const history = historyEntries
      .map((entry: any) => {
        try { return parseKvValue(entry); } catch { return null; }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    // For each history entry that has voiceAnswers with questionDetails,
    // fetch individual voice answer records that may have audioPath
    const voiceAnswerRecords = await kv.getByPrefix(`voiceanswer:${user.id}:`);
    const parsedVoiceRecords = voiceAnswerRecords
      .map((entry: any) => { try { return parseKvValue(entry); } catch { return null; } })
      .filter(Boolean);

    // Generate signed URLs for audio files
    await ensureVoiceBucket();
    for (const vr of parsedVoiceRecords) {
      if (vr.audioPath) {
        try {
          for (const ext of ["webm", "mp4", "ogg"]) {
            const filePath = `${vr.audioPath}.${ext}`;
            const { data: signedData } = await supabase.storage
              .from(VOICE_BUCKET)
              .createSignedUrl(filePath, 60 * 60 * 24 * 7);
            if (signedData?.signedUrl) {
              vr.audioUrl = signedData.signedUrl;
              break;
            }
          }
        } catch { /* audio might not exist */ }
      }
    }

    // Attach voice audio URLs to history entries' questionDetails
    for (const h of history) {
      if (h.questionDetails && Array.isArray(h.questionDetails)) {
        for (const qd of h.questionDetails) {
          if (qd.answeredByVoice) {
            // Find matching voice record by surah + ayat + approximate timestamp
            const matchingVoice = parsedVoiceRecords.find((vr: any) =>
              vr.surahName === qd.surahName &&
              vr.ayatNumber === qd.ayatNumber &&
              Math.abs(new Date(vr.timestamp).getTime() - new Date(h.timestamp).getTime()) < 600000
            );
            if (matchingVoice) {
              qd.audioUrl = matchingVoice.audioUrl || null;
              qd.voiceTranscript = matchingVoice.transcript || "";
              qd.voiceConfidence = matchingVoice.confidence || 0;
            }
          }
        }
      }
    }

    // Get voice answer history
    const voiceEntries = await kv.getByPrefix(`voice:${user.id}:`);
    const voiceHistory = voiceEntries
      .map((entry: any) => {
        try { return parseKvValue(entry); } catch { return null; }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    console.log(`Progress fetched for user ${user.id}: ${history.length} records, ${voiceHistory.length} voice records`);
    return c.json({ stats, history, voiceHistory });
  } catch (err) {
    console.log(`Progress fetch error: ${err}`);
    return c.json({ error: "Internal server error fetching progress" }, 500);
  }
});

// ─── Voice Answer Routes ───

// Save a single voice answer in real-time (called immediately when a voice answer occurs)
app.post("/make-server-1bb74365/voice-answers", async (c) => {
  try {
    const accessToken = await getUserToken(c);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      console.log(`Voice answer save auth error: ${authError?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await getRequestBody(c);
    const {
      transcript,
      matchedAnswer,
      correctAnswer,
      isCorrect,
      confidence,
      timestamp,
      surahName,
      ayatNumber,
      questionId,
    } = body;

    if (!timestamp || correctAnswer === undefined) {
      return c.json({ error: "Missing required fields: timestamp, correctAnswer" }, 400);
    }

    const voiceRecord: any = {
      userId: user.id,
      transcript: transcript || "",
      matchedAnswer: matchedAnswer || null,
      correctAnswer,
      isCorrect: !!isCorrect,
      confidence: confidence || 0,
      timestamp,
      surahName: surahName || "",
      ayatNumber: ayatNumber || 0,
      questionId: questionId || "",
      createdAt: new Date().toISOString(),
      audioPath: null as string | null,
    };

    // Save individual voice answer with unique key
    const voiceKey = `voiceanswer:${user.id}:${timestamp}`;

    // If audioBase64 is provided, upload to Supabase Storage
    let audioUrl: string | null = null;
    let uploadedFilePath: string | null = null;
    const { audioBase64 } = body;
    if (audioBase64 && typeof audioBase64 === "string" && audioBase64.startsWith("data:")) {
      try {
        await ensureVoiceBucket();
        // Parse base64 data URL — use lazy match for MIME type to handle
        // parameters like codecs=opus (e.g. "data:audio/webm;codecs=opus;base64,...")
        const matches = audioBase64.match(/^data:(.*?);base64,(.+)$/s);
        if (matches) {
          const fullContentType = matches[1]; // e.g. "audio/webm;codecs=opus"
          const base64Data = matches[2];
          // Use only the base MIME type for the Content-Type header
          const baseContentType = fullContentType.split(";")[0].trim(); // e.g. "audio/webm"
          // Decode base64 to Uint8Array
          const binaryStr = atob(base64Data);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const ext = fullContentType.includes("webm") ? "webm" : fullContentType.includes("mp4") ? "mp4" : "ogg";
          const filePath = `${user.id}/${timestamp.replace(/[:.]/g, "-")}.${ext}`;
          console.log(`[Voice] Attempting upload: bucket=${VOICE_BUCKET}, path=${filePath}, size=${bytes.length} bytes, type=${baseContentType}`);
          const { error: uploadError } = await supabase.storage
            .from(VOICE_BUCKET)
            .upload(filePath, bytes, { contentType: baseContentType, upsert: true });
          if (uploadError) {
            console.log(`Voice audio upload error: ${uploadError.message}`);
          } else {
            // Upload succeeded — store the path (without extension) for later retrieval
            uploadedFilePath = `${user.id}/${timestamp.replace(/[:.]/g, "-")}`;
            // Create signed URL (valid for 7 days)
            const { data: signedData } = await supabase.storage
              .from(VOICE_BUCKET)
              .createSignedUrl(filePath, 60 * 60 * 24 * 7);
            audioUrl = signedData?.signedUrl || null;
            console.log(`Voice audio uploaded: ${filePath}, size: ${bytes.length} bytes, signedUrl: ${audioUrl ? "yes" : "no"}`);
          }
        } else {
          console.log(`[Voice] audioBase64 regex did NOT match. Data URL prefix: "${audioBase64.substring(0, 80)}..."`);
        }
      } catch (audioErr) {
        console.log(`Voice audio save error (non-fatal): ${audioErr}`);
      }
    } else if (audioBase64) {
      console.log(`[Voice] audioBase64 present but invalid: type=${typeof audioBase64}, startsWith data:=${typeof audioBase64 === "string" && audioBase64.startsWith("data:")}, length=${typeof audioBase64 === "string" ? audioBase64.length : "N/A"}`);
    } else {
      console.log(`[Voice] No audioBase64 in request body`);
    }

    // Store audioPath based on upload success, not signed URL success
    voiceRecord.audioPath = uploadedFilePath;

    await kv.set(voiceKey, voiceRecord);

    // Update aggregate voice stats
    const statsKey = `stats:${user.id}`;
    const existingStats = await kv.get(statsKey);
    let stats = existingStats
      ? parseKvValue(existingStats)
      : { totalPractices: 0, totalCorrect: 0, totalQuestions: 0, bestScore: 0, streak: 0, lastPractice: "", totalVoiceAnswers: 0, correctVoiceAnswers: 0 };

    stats.totalVoiceAnswers = (stats.totalVoiceAnswers || 0) + 1;
    if (isCorrect) {
      stats.correctVoiceAnswers = (stats.correctVoiceAnswers || 0) + 1;
    }
    await kv.set(statsKey, stats);

    console.log(`Voice answer saved for user ${user.id}: transcript="${transcript}", correct=${isCorrect}, confidence=${confidence}%`);
    return c.json({ success: true, voiceRecord });
  } catch (err) {
    console.log(`Voice answer save error: ${err}`);
    return c.json({ error: "Internal server error saving voice answer" }, 500);
  }
});

// Get user's voice answer history
app.get("/make-server-1bb74365/voice-answers", async (c) => {
  try {
    const accessToken = await getUserToken(c);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      console.log(`Voice answers fetch auth error: ${authError?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get individual voice answers (newest first, last 50)
    const voiceEntries = await kv.getByPrefix(`voiceanswer:${user.id}:`);
    const voiceAnswers = voiceEntries
      .map((entry: any) => {
        try { return parseKvValue(entry); } catch { return null; }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    // Generate fresh signed URLs for voice answers with audio
    for (const va of voiceAnswers) {
      if (va.audioPath) {
        try {
          // Try common extensions
          for (const ext of ["webm", "mp4", "ogg"]) {
            const filePath = `${va.audioPath}.${ext}`;
            const { data: signedData } = await supabase.storage
              .from(VOICE_BUCKET)
              .createSignedUrl(filePath, 60 * 60 * 24 * 7);
            if (signedData?.signedUrl) {
              va.audioUrl = signedData.signedUrl;
              break;
            }
          }
        } catch {
          // Audio file might not exist
        }
      }
    }

    // Calculate stats summary
    const totalAttempts = voiceAnswers.length;
    const correctAttempts = voiceAnswers.filter((v: any) => v.isCorrect).length;
    const avgConfidence = totalAttempts > 0
      ? Math.round(voiceAnswers.reduce((sum: number, v: any) => sum + (v.confidence || 0), 0) / totalAttempts)
      : 0;

    // Group by surah for per-surah accuracy
    const surahStats: Record<string, { total: number; correct: number }> = {};
    for (const v of voiceAnswers) {
      const name = v.surahName || "Unknown";
      if (!surahStats[name]) surahStats[name] = { total: 0, correct: 0 };
      surahStats[name].total++;
      if (v.isCorrect) surahStats[name].correct++;
    }

    console.log(`Voice answers fetched for user ${user.id}: ${voiceAnswers.length} records`);
    return c.json({
      voiceAnswers,
      summary: {
        totalAttempts,
        correctAttempts,
        accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
        avgConfidence,
        surahStats,
      },
    });
  } catch (err) {
    console.log(`Voice answers fetch error: ${err}`);
    return c.json({ error: "Internal server error fetching voice answers" }, 500);
  }
});

Deno.serve(app.fetch);