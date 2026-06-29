/**
 * Cookie read/write helpers for session and progress persistence.
 *
 * Why cookies instead of a database?
 * - This app is single-user, ephemeral, and low-volume: one person takes one
 *   15-question test at a time with no cross-device sync requirement.
 * - Progress only needs to survive a page refresh during a ~10-minute session.
 * - A database would add hosting cost, migrations, and connection management
 *   for data we intentionally throw away after submission.
 *
 * Tradeoff: cookies are size-limited (~4 KB), device-bound, and not suitable
 * for multi-user analytics or long-term result storage. For a portfolio demo
 * of App Router + Server Actions, that tradeoff is intentional.
 */

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";
import { cookies } from "next/headers";
import type { Result, SessionProgress } from "@/types/assessment";

const ALGORITHM = "aes-256-gcm";

export const SESSION_COOKIE = "checkpoint-session";
export const PROGRESS_COOKIE = "checkpoint-progress";
export const RESULT_COOKIE = "checkpoint-result";

const PROGRESS_MAX_AGE = 60 * 60; // 1 hour — enough for one assessment
const RESULT_MAX_AGE = 60 * 60; // 1 hour — short-lived result display

function getEncryptionKey(): Buffer {
  const secret =
    process.env.COOKIE_SECRET ?? "checkpoint-dev-secret-change-in-prod";
  return createHash("sha256").update(secret).digest();
}

function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function decrypt(payload: string): string | null {
  try {
    const buf = Buffer.from(payload, "base64url");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}

export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionId(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PROGRESS_MAX_AGE,
    path: "/",
  });
}

export async function getProgress(): Promise<SessionProgress | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PROGRESS_COOKIE)?.value;
  if (!raw) return null;

  const decrypted = decrypt(raw);
  if (!decrypted) return null;

  try {
    return JSON.parse(decrypted) as SessionProgress;
  } catch {
    return null;
  }
}

export async function setProgress(progress: SessionProgress): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PROGRESS_COOKIE, encrypt(JSON.stringify(progress)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PROGRESS_MAX_AGE,
    path: "/",
  });
}

export async function clearProgress(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PROGRESS_COOKIE);
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(PROGRESS_COOKIE);
  cookieStore.delete(RESULT_COOKIE);
}

/**
 * Stores the scored result in a short-lived encrypted cookie.
 * We use a cookie (not a query param) so result data stays out of the URL,
 * browser history, and server logs. The result page reads it once by resultId.
 */
export async function setResult(result: Result): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(RESULT_COOKIE, encrypt(JSON.stringify(result)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: RESULT_MAX_AGE,
    path: "/",
  });
}

export async function getResult(resultId: string): Promise<Result | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(RESULT_COOKIE)?.value;
  if (!raw) return null;

  const decrypted = decrypt(raw);
  if (!decrypted) return null;

  try {
    const result = JSON.parse(decrypted) as Result;
    return result.resultId === resultId ? result : null;
  } catch {
    return null;
  }
}

export async function clearResult(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(RESULT_COOKIE);
}

export function createInitialProgress(sessionId: string): SessionProgress {
  return {
    sessionId,
    currentIndex: 0,
    answers: {},
    startedAt: Date.now(),
    totalElapsedSeconds: 0,
  };
}
