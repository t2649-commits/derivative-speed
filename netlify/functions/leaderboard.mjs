// 랭킹 API: GET /api/leaderboard?limit=5  → 해당 제한시간의 상위 20개 기록
//          POST /api/leaderboard → { name, score, correct, limit } 기록 저장 후 순위 반환
// 기록은 Netlify Blobs 저장소 "derivative-speed"에 키 하나당 기록 하나로 저장해요.
// 키 형식: t제한시간/점수~시각~닉네임(base64url)~난수
// 제한시간별로 랭킹이 따로 쌓이고, 동시에 여러 명이 제출해도 서로 덮어쓰지 않아요.
import { getStore } from "@netlify/blobs";

const MAX_SCORE = 20 * 250; // 문제 20개 × (정답 100 + 시간 100 + 콤보 50)
const TOP_N = 20;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const readLimit = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 3 && n <= 30 ? n : null;
};
const prefixOf = (limit) => `t${limit}/`;

function parse(key) {
  const [s, t, n] = key.slice(key.indexOf("/") + 1).split("~");
  const score = Number(s), ts = Number(t);
  let name = "";
  try { name = Buffer.from(n || "", "base64url").toString("utf8"); } catch {}
  if (!Number.isFinite(score) || !Number.isFinite(ts) || !name) return null;
  return { id: key, name, score, ts };
}

async function allEntries(store, limit) {
  const { blobs } = await store.list({ prefix: prefixOf(limit) });
  return blobs
    .map((b) => parse(b.key))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.ts - b.ts);
}

const publicRow = ({ id, name, score }) => ({ id, name, score });

export default async (req) => {
  const store = getStore({ name: "derivative-speed", consistency: "strong" });

  if (req.method === "GET") {
    const limit = readLimit(new URL(req.url).searchParams.get("limit") ?? 5);
    if (!limit) return json({ error: "제한시간이 올바르지 않아요." }, 400);
    const all = await allEntries(store, limit);
    return json({ top: all.slice(0, TOP_N).map(publicRow), total: all.length });
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "잘못된 요청이에요." }, 400); }

    const name = String(body?.name ?? "")
      .replace(/[\u0000-\u001f\u007f<>]/g, "")
      .trim()
      .slice(0, 12);
    const score = Math.round(Number(body?.score));
    const correct = Math.round(Number(body?.correct));

    const limit = readLimit(body?.limit ?? 5);
    if (!limit) return json({ error: "제한시간이 올바르지 않아요." }, 400);
    if (!name) return json({ error: "닉네임이 비어 있어요." }, 400);
    if (!Number.isFinite(score) || score < 0 || score > MAX_SCORE)
      return json({ error: "점수가 올바르지 않아요." }, 400);

    const key = prefixOf(limit) + [score, Date.now(), Buffer.from(name, "utf8").toString("base64url"), Math.random().toString(36).slice(2, 8)].join("~");
    await store.set(key, JSON.stringify({ correct: Number.isFinite(correct) ? correct : null }));

    const all = await allEntries(store, limit);
    const rank = all.findIndex((e) => e.id === key) + 1;
    return json({ id: key, rank, total: all.length, top: all.slice(0, TOP_N).map(publicRow) });
  }

  return json({ error: "지원하지 않는 요청이에요." }, 405);
};

export const config = { path: "/api/leaderboard" };
