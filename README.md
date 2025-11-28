# 리케이온 교양 과목 추천 시스템

리케이온 유학생을 위한 맞춤형 교양 과목 추천 웹 애플리케이션입니다.

## 📁 프로젝트 구조

```
jinny/
├── index.html      # 메인 HTML 페이지
├── styles.css      # 스타일시트
├── app.js          # JavaScript 로직
├── courses.csv     # 과목 데이터 (업데이트 대상)
└── README.md       # 프로젝트 문서
```

## 🚀 GitHub Pages 배포

이 프로젝트는 `https://leejehyeon7.github.io/Recommand/`에 배포되어 있습니다.

변경사항을 GitHub Pages에 반영하려면:

1. 파일 수정 후 커밋
2. GitHub에 푸시
3. 자동으로 GitHub Pages에 반영됩니다

## 📝 과목 데이터 업데이트 방법

### CSV 파일 형식

`courses.csv` 파일은 다음 열(column)로 구성됩니다:

| 열 이름 | 설명 | 예시 |
|---------|------|------|
| `id` | 과목 고유 ID | `LIT101` |
| `name` | 과목명 (교수명 포함) | `자기발견과소통(윤희진)` |
| `desc` | 과목 설명 (HTML 태그 사용 가능) | `- 주제별로 다양한...<br>- 한국어 듣기: 중급...` |
| `koreanLevel` | 요구되는 한국어 수준 (3, 4, 5) | `4` |
| `difficulty` | 난이도 (1-5) | `3` |
| `tags` | 태그 (파이프로 구분) | `자기성찰\|문화` |
| `targetGrade` | 대상 학년 (파이프로 구분) | `1\|2\|3\|4\|5` |
| `majorTypes` | 대상 전공 (파이프로 구분) | `ani\|game\|beauty\|food\|etc` |

### 과목 추가 예시

```csv
id,name,desc,koreanLevel,difficulty,tags,targetGrade,majorTypes
NEW001,한국현대사(김철수),"- 한국 현대사의 주요 사건과 흐름을 배웁니다<br>- 한국어 듣기: 고급 / 읽기: 고급",5,4,"역사|문화","2|3|4","ani|game|beauty|food|etc"
```

### 주의사항

1. **쉼표와 따옴표**: 설명에 쉼표가 포함된 경우 전체를 큰따옴표(`"`)로 감싸세요
2. **줄바꿈**: 설명 내에서 줄바꿈은 `<br>` 태그를 사용하세요
3. **파이프 구분**: 여러 값은 파이프(`|`)로 구분합니다
4. **헤더 유지**: 첫 번째 줄(헤더)은 절대 삭제하지 마세요
5. **인코딩**: 파일은 **UTF-8 인코딩**으로 저장해야 합니다

### Excel에서 편집하기

1. `courses.csv`를 Excel에서 열기
2. 과목 정보 수정/추가
3. "다른 이름으로 저장" → 파일 형식: **CSV UTF-8 (쉼표로 분리)(*.csv)** 선택
4. 저장 후 GitHub에 업로드

## 🎨 디자인 수정

### 색상 변경

`styles.css` 파일에서 주요 색상을 변경할 수 있습니다:

```css
/* 메인 그라디언트 색상 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 배지 색상 */
.badge-level { background: #dbeafe; color: #1e40af; }
.badge-diff { background: #fee2e2; color: #b91c1c; }
```

### 레이아웃 조정

- 최대 너비: `styles.css`의 `body { max-width: 900px; }` 수정
- 여백/간격: `padding`, `margin` 값 조정
- 반응형: `@media (max-width: 768px)` 섹션에서 모바일 스타일 변경

## 🔧 추천 알고리즘 수정

`app.js`의 `WEIGHTS` 객체에서 가중치를 조정할 수 있습니다:

```javascript
const WEIGHTS = {
  KOREAN_LEVEL_MATCH: 2,    // 한국어 수준 일치 점수
  MAJOR_MATCH: 3,           // 전공 일치 점수
  TAG_OVERLAP: 2,           // 관심 분야 태그당 점수
  DIFFICULTY_MATCH: 3,      // 난이도 선호 일치 점수
  BASE_SCORE: 1             // 기본 점수
};
```

표시되는 최대 추천 과목 수를 변경하려면:

```javascript
const MAX_RESULTS = 5;  // 원하는 숫자로 변경
```

## 🐛 문제 해결

### 로컬에서 추천 과목이 표시되지 않아요

**원인**: 로컬 파일 시스템(`file://`)에서는 브라우저 보안 정책(CORS) 때문에 CSV 파일을 로드할 수 없습니다.

**해결됨**: 시스템이 자동으로 로컬 환경을 감지하고 폴백 데이터를 사용합니다.

**로컬 테스트 방법**:
1. `index.html`을 브라우저로 직접 열기
2. 3개 샘플 과목으로 기능 테스트
3. 브라우저 콘솔(F12)에서 "로컬 환경 감지" 메시지 확인

**전체 데이터 테스트 방법** (선택):
- 간단한 로컬 서버 실행:
  ```bash
  # Python 3 설치되어 있는 경우
  python -m http.server 8000

  # 브라우저에서 http://localhost:8000 접속
  ```

### 과목이 표시되지 않아요

1. 브라우저 개발자 도구(F12) → Console 탭 확인
2. `courses.csv` 파일 형식이 올바른지 확인
3. 파일 인코딩이 UTF-8인지 확인

### CSV 파일이 깨져 보여요

- Excel에서 저장 시 **"CSV UTF-8"** 형식으로 저장했는지 확인
- 메모장에서 열어 인코딩을 UTF-8로 다시 저장

### 스타일이 적용되지 않아요

- `index.html`, `styles.css`, `app.js`가 같은 폴더에 있는지 확인
- 브라우저 캐시 삭제 후 새로고침 (Ctrl + Shift + R)

## 📊 현재 상태

- ✅ CSV 기반 데이터 관리
- ✅ 외부 CSS/JS 파일 분리
- ✅ 반응형 디자인
- ✅ GitHub Pages 호환
- ✅ 모던한 UI/UX

## 📈 향후 개선 사항

- [ ] 과목 검색 기능
- [ ] 학년별 필터링
- [ ] 결과 공유 기능
- [ ] 다국어 지원 (영어, 중국어)
- [ ] 과목 상세 정보 모달

## 📞 문의

문제가 발생하거나 개선 제안이 있으시면 GitHub Issues를 통해 알려주세요.
