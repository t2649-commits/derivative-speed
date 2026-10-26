// 학생용 랭킹 API
//   GET  /api/leaderboard → { limit, top, total }  (선생님이 정한 현재 제한시간과 그 시간의 상위 20개)
//   POST /api/leaderboard → { name, score, correct, limit } 기록 저장 후 순위 반환
// 제한시간은 서버에 저장된 값만 쓰므로 학생이 주소를 고쳐도 바뀌지 않아요.
import { json, getLimit, allEntries, publicRow, scoreStore, prefixOf, MAX_SCORE, TOP_N } from "../lib/common.mjs";

export default async (req) => {
  const limit = await getLimit();

  if (req.method === "GET") {
    const all = await allEntries(limit);
    return json({ limit, top: all.slice(0, TOP_N).map(publicRow), total: all.length });
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "잘못된 요청이에요." }, 400); }

    if (Number(body?.limit) !== limit)
      return json({ error: "게임 도중 제한시간이 바뀌었어요.", limit }, 409);

    const name = String(body?.name ?? "")
      .replace(/[\u0000-\u001f\u007f<>]/g, "")
      .trim()
      .slice(0, 12);
    const score = Math.round(Number(body?.score));
    const correct = Math.round(Number(body?.correct));

    if (!name) return json({ error: "닉네임이 비어 있어요." }, 400);
    if (!Number.isFinite(score) || score < 0 || score > MAX_SCORE)
      return json({ error: "점수가 올바르지 않아요." }, 400);

    const key = prefixOf(limit) + [score, Date.now(), Buffer.from(name, "utf8").toString("base64url"), Math.random().toString(36).slice(2, 8)].join("~");
    await scoreStore().set(key, JSON.stringify({ correct: Number.isFinite(correct) ? correct : null }));

    const all = await allEntries(limit);
    const rank = all.findIndex((e) => e.id === key) + 1;
    return json({ id: key, limit, rank, total: all.length, top: all.slice(0, TOP_N).map(publicRow) });
  }

  return json({ error: "지원하지 않는 요청이에요." }, 405);
};

export const config = { path: "/api/leaderboard" };
