# 도함수 개형 스피드

도함수 그래프를 보고 제한시간 안에 함수의 개형을 고르는 게임과, 계정 없이 누구나 볼 수 있는 랭킹입니다.

- 학생용: `사이트주소/`
- 선생님용: `사이트주소/teacher/` (비밀번호 필요)

## 폴더 구성

- `src/game.html` : 학생용 게임 화면 (문제 수정은 여기서)
- `src/teacher.html` : 선생님 페이지 (제한시간 변경, 랭킹 보기·초기화)
- `build.mjs` : 배포할 때 `public` 폴더에 실제 페이지를 만들어 줌
- `netlify/functions/leaderboard.mjs` : 랭킹 저장·조회 (`/api/leaderboard`)
- `netlify/functions/teacher.mjs` : 선생님 기능 (`/api/teacher`)
- `netlify/lib/common.mjs` : 두 기능이 함께 쓰는 코드
- `netlify.toml`, `package.json` : 넷리파이 설정

랭킹과 제한시간은 Netlify Blobs에 저장되므로 따로 데이터베이스를 만들 필요가 없습니다.

## 선생님 비밀번호 등록 (처음 한 번)

1. 넷리파이 프로젝트 → Project configuration → Environment variables
2. Add a variable → Add a single variable
3. Key: `TEACHER_PASSWORD` / Value: 원하는 비밀번호 → Create variable
4. 비밀번호를 등록하거나 바꾼 뒤에는 Deploys → Trigger deploy → Deploy project 로 한 번 다시 배포해야 적용됩니다.

비밀번호는 코드에 들어 있지 않으므로 GitHub 저장소가 공개되어 있어도 알 수 없습니다.

## 제한시간과 랭킹

- 선생님 페이지에서 제한시간(3~30초)을 바꾸면, 그 뒤에 시작하는 모든 학생 게임에 적용됩니다.
- 학생은 주소를 고쳐도 시간을 바꿀 수 없습니다.
- 랭킹은 제한시간별로 따로 쌓입니다. 게임 도중 시간을 바꾸면 그 판의 기록은 등록되지 않습니다.
- 선생님 페이지의 "랭킹 초기화"를 누르면 모든 기록이 지워집니다.

## 다시 배포하기 (코드를 바꿨을 때)

GitHub 저장소 화면 → Add file → Upload files 로 바뀐 파일을 같은 위치에 올리고 Commit changes 를 누르면, 넷리파이가 자동으로 다시 배포합니다.

## 문제 바꾸기

`src/game.html`의 `PROBLEMS` 목록에서 문제 하나는 도함수를 나타냅니다.

- `{k:4, r:[[0,1],[3,2]]}` → f′(x) = 4x(x−3)²
- `k` : 최고차항 계수, `r` : [근, 중복도] 목록
- `{k:2, r:[]}` → f′(x) = 2 (상수함수)

오답 보기 5개는 자동으로 만들어집니다. 문제 은행에는 21문제가 있고, 한 판에 그중 20문제가 무작위 순서로 나옵니다.
한 판의 문제 수는 `src/game.html`의 `NQ` 값으로 바꿀 수 있으며, 바꾸면 `netlify/lib/common.mjs`의 `NQ`도 같은 값으로 바꿔 주세요.
