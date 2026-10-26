// 선생님용 API: POST /api/teacher
//   { password, action: "check" }             → 비밀번호 확인, 현재 제한시간 반환
//   { password, action: "setLimit", limit }   → 제한시간 변경 (3~30초)
//   { password, action: "reset" }             → 모든 랭킹 기록 삭제
// 비밀번호는 넷리파이 환경 변수 TEACHER_PASSWORD 에 저장해요. 코드에는 들어 있지 않아요.
import { createHash, timingSafeEqual } from "node:crypto";
import { json, getLimit, setLimit, validLimit, allEntries, scoreStore, TMIN, TMAX } from "../lib/common.mjs";

const readSecret = () => globalThis.Netlify?.env?.get?.("TEACHER_PASSWORD") ?? process.env.TEACHER_PASSWORD ?? "";
const digest = (s) => createHash("sha256").update(String(s)).digest();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async (req) => {
  if (req.method !== "POST") return json({ error: "지원하지 않는 요청이에요." }, 405);

  const secret = readSecret();
  if (!secret) return json({ error: "넷리파이에 TEACHER_PASSWORD 환경 변수가 아직 없어요." }, 500);

  let body;
  try { body = await req.json(); } catch { return json({ error: "잘못된 요청이에요." }, 400); }

  if (!timingSafeEqual(digest(body?.password ?? ""), digest(secret))) {
    await sleep(800); // 비밀번호를 빠르게 여러 번 넣어 보는 것을 늦춰요
    return json({ error: "비밀번호가 맞지 않아요." }, 401);
  }

  const action = body?.action;

  if (action === "check") {
    const limit = await getLimit();
    return json({ ok: true, limit, total: (await allEntries(limit)).length });
  }

  if (action === "setLimit") {
    const limit = validLimit(body?.limit);
    if (!limit) return json({ error: `제한시간은 ${TMIN}초에서 ${TMAX}초 사이의 정수여야 해요.` }, 400);
    await setLimit(limit);
    return json({ ok: true, limit, total: (await allEntries(limit)).length });
  }

  if (action === "reset") {
    const store = scoreStore();
    const { blobs } = await store.list();
    for (const b of blobs) await store.delete(b.key);
    return json({ ok: true, deleted: blobs.length, limit: await getLimit() });
  }

  return json({ error: "알 수 없는 요청이에요." }, 400);
};

export const config = { path: "/api/teacher" };
