// 두 함수(leaderboard, teacher)가 함께 쓰는 저장소·설정 도우미
import { getStore } from "@netlify/blobs";

export const DEFAULT_LIMIT = 5;
export const TMIN = 3;
export const TMAX = 30;
export const NQ = 10;
export const MAX_SCORE = NQ * 250; // 문제 10개 × (정답 100 + 시간 100 + 콤보 50)
export const TOP_N = 20;

export const scoreStore = () => getStore({ name: "derivative-speed", consistency: "strong" });
const settingsStore = () => getStore({ name: "derivative-speed-settings", consistency: "strong" });

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export const validLimit = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= TMIN && n <= TMAX ? n : null;
};

export async function getLimit() {
  const s = await settingsStore().get("settings", { type: "json" });
  return validLimit(s?.limit) ?? DEFAULT_LIMIT;
}

export async function setLimit(limit) {
  await settingsStore().setJSON("settings", { limit, updatedAt: Date.now() });
}

// 기록 키 형식: t제한시간/점수~시각~닉네임(base64url)~난수
export const prefixOf = (limit) => `t${limit}/`;

function parse(key) {
  const [s, t, n] = key.slice(key.indexOf("/") + 1).split("~");
  const score = Number(s), ts = Number(t);
  let name = "";
  try { name = Buffer.from(n || "", "base64url").toString("utf8"); } catch {}
  if (!Number.isFinite(score) || !Number.isFinite(ts) || !name) return null;
  return { id: key, name, score, ts };
}

export async function allEntries(limit) {
  const { blobs } = await scoreStore().list({ prefix: prefixOf(limit) });
  return blobs
    .map((b) => parse(b.key))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.ts - b.ts);
}

export const publicRow = ({ id, name, score }) => ({ id, name, score });
