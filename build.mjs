// src/game.html 을 완전한 HTML 문서로 감싸 public/index.html 을 만들어요.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const src = readFileSync("src/game.html", "utf8");
const cut = src.indexOf('<div class="app">');
const head = src.slice(0, cut);
const body = src.slice(cut);

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}</head>
<body>
${body}</body>
</html>
`;
mkdirSync("public", { recursive: true });
writeFileSync("public/index.html", html);
console.log("public/index.html 생성 완료");
