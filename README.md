# 도함수 개형 스피드

도함수 그래프를 보고 5초 안에 함수의 개형을 고르는 게임과, 계정 없이 누구나 볼 수 있는 랭킹입니다.

## 폴더 구성

- `src/game.html` : 게임 화면 (문제 수정은 여기서)
- `build.mjs` : 배포할 때 `public/index.html`을 만들어 줌
- `netlify/functions/leaderboard.mjs` : 랭킹 저장·조회 API (`/api/leaderboard`)
- `netlify.toml`, `package.json` : 넷리파이 설정

랭킹은 Netlify Blobs에 저장되므로 따로 데이터베이스를 만들 필요가 없습니다.

## 배포 방법 (둘 중 하나)

**방법 1. GitHub로 연결 (추천)**
1. 이 폴더를 GitHub 저장소에 올립니다.
2. 넷리파이에서 Add new site → Import an existing project → 그 저장소를 고릅니다.
3. 설정은 `netlify.toml`에 들어 있으니 그대로 Deploy를 누릅니다.

**방법 2. 넷리파이 CLI**
```
npm install
npx netlify-cli login
npx netlify-cli deploy --build --prod
```

주의: 폴더를 넷리파이 화면에 끌어다 놓는 방식(드래그 앤 드롭)은 빌드와 함수 설치를 하지 않아서, 게임은 보여도 랭킹이 작동하지 않을 수 있습니다.

## 제한시간 정하기

시작 화면 아래쪽 "선생님 설정"을 열고 시간(3~30초)을 넣은 뒤 "적용하고 링크 복사"를 누르세요.
복사된 링크(예: `https://사이트주소/?t=8`)를 학생들에게 보내면 그 시간으로 게임이 진행됩니다.
주소 끝의 `?t=숫자`만 바꿔서 보내도 됩니다. 링크에 시간이 없으면 5초입니다.
랭킹은 제한시간별로 따로 쌓입니다.

## 문제 바꾸기

`src/game.html`의 `PROBLEMS` 목록에서 문제 하나는 도함수를 나타냅니다.

- `{k:4, r:[[0,1],[3,2]]}` → f′(x) = 4x(x−3)²
- `k` : 최고차항 계수, `r` : [근, 중복도] 목록
- `{k:2, r:[]}` → f′(x) = 2 (상수함수)

오답 보기 5개는 자동으로 만들어집니다. 문제 은행에는 21문제가 있고, 한 판에 그중 20문제가 무작위 순서로 나옵니다.
한 판의 문제 수는 `src/game.html`의 `NQ` 값으로 바꿀 수 있으며, 바꾸면 `netlify/functions/leaderboard.mjs`의 `MAX_SCORE`(문제 수 × 250)도 함께 바꿔 주세요.

## 랭킹 초기화

넷리파이 사이트 화면의 Blobs 메뉴에서 `derivative-speed` 저장소의 항목을 지우면 됩니다.
항목 이름이 `t5/`, `t10/`처럼 제한시간으로 시작하므로 특정 시간의 랭킹만 지울 수도 있습니다.
