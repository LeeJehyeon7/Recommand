// 교양 과목 추천 시스템 - 메인 로직

// 전역 변수
let COURSES = [];

// 로컬 환경 감지
function isLocalEnvironment() {
  return window.location.protocol === 'file:';
}

// CSV 파일 로드 및 파싱
async function loadCourses() {
  try {
    // 로컬 환경에서는 폴백 데이터 사용
    if (isLocalEnvironment()) {
      console.log('⚠️ 로컬 환경 감지 - 폴백 데이터 사용');
      COURSES = getFallbackCourses();
      console.log(`✅ ${COURSES.length}개 과목 데이터 로드 완료 (폴백)`);
      return;
    }

    // 웹 서버 환경에서는 CSV 파일 로드
    const response = await fetch('courses.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    COURSES = parseCSV(csvText);
    console.log(`✅ ${COURSES.length}개 과목 데이터 로드 완료`);
  } catch (error) {
    console.error('❌ 과목 데이터 로드 실패:', error);
    console.log('🔄 폴백 데이터로 전환');
    COURSES = getFallbackCourses();
    if (COURSES.length > 0) {
      console.log(`✅ ${COURSES.length}개 폴백 과목 데이터 로드 완료`);
    } else {
      showError('과목 데이터를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
    }
  }
}

// 폴백 데이터 (로컬 테스트용)
function getFallbackCourses() {
  return [
    {
      id: "LIT101",
      name: "자기발견과소통(윤희진)",
      desc: "- 주제별로 다양한 글 읽기와 성찰 활동을 통해 '나다움'을 발견하고 내 삶의 방향과 가치에 대해 '함께' 생각하고 나누는 수업<br>- 한국어 듣기: 중급 / 말하기: 중급 / 읽기: 중급 / 쓰기: 중급<br>- 한국 사회문화 : 거의 다루지 않음<br>- 한국학생과 친해질 수 있음",
      koreanLevel: 4,
      difficulty: 3,
      tags: ["자기성찰", "문화"],
      targetGrade: [1, 2, 3, 4, 5],
      majorTypes: ["ani", "game", "beauty", "food", "etc"]
    },
    {
      id: "LIT102",
      name: "레퍼런스시리즈_한강(윤희진)",
      desc: "- 캠퍼스와 일상에서 문화다양성을 탐구하며, 이론과 체험 프로젝트를 통해 문화적 감수성을 기르는 교과목<br>- 한국어 듣기: 중급 / 말하기: 중급/ 읽기: 중급 / 쓰기: 중급<br>- 한국 사회문화: 일부 다룸<br>- 한국학생과 친해질 수 있음",
      koreanLevel: 4,
      difficulty: 5,
      tags: ["한강", "레퍼런스"],
      targetGrade: [1, 2, 3, 4, 5],
      majorTypes: ["ani", "game", "beauty", "food", "etc"]
    },
    {
      id: "LIT103",
      name: "처음만나는문화다양성(윤희진)",
      desc: "- 캠퍼스와 일상에서 문화다양성을 탐구하며, 이론과 체험 프로젝트를 통해 문화적 감수성을 기르는 교과목<br>- 한국어 듣기: 중급 / 말하기: 중급/ 읽기: 중급 / 쓰기: 중급<br>- 한국 사회문화: 일부 다룸<br>- 한국학생과 친해질 수 있음",
      koreanLevel: 4,
      difficulty: 3,
      tags: ["문화", "다양성"],
      targetGrade: [1, 2, 3, 4, 5],
      majorTypes: ["ani", "game", "beauty", "food", "etc"]
    }
  ];
}

// CSV 파싱 함수
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    // CSV 라인 파싱 (따옴표 안의 쉼표 처리)
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    // 객체 생성
    const course = {};
    headers.forEach((header, index) => {
      const value = values[index] ? values[index].replace(/^"|"$/g, '') : '';

      switch(header.trim()) {
        case 'koreanLevel':
        case 'difficulty':
          course[header.trim()] = parseInt(value, 10);
          break;
        case 'tags':
          course[header.trim()] = value.split('|').map(t => t.trim());
          break;
        case 'targetGrade':
          course[header.trim()] = value.split('|').map(g => parseInt(g, 10));
          break;
        case 'majorTypes':
          course[header.trim()] = value.split('|').map(m => m.trim());
          break;
        default:
          course[header.trim()] = value;
      }
    });

    return course;
  });
}

// 설문 제출 이벤트 처리
function initializeSurveyForm() {
  const form = document.getElementById("survey-form");

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const koreanLevel = parseInt(form.koreanLevel.value, 10);
    const majorType = form.majorType.value;

    const interestNodes = form.querySelectorAll('input[name="interest"]:checked');
    const interests = Array.from(interestNodes).map(i => i.value);

    const difficultyPref = form.querySelector('input[name="difficultyPref"]:checked').value;

    const answers = { koreanLevel, majorType, interests, difficultyPref };
    const recommended = getRecommendedCourses(answers);

    renderResult(answers, recommended);

    // 결과로 스크롤
    document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// 추천 로직
function getRecommendedCourses(answer) {
  const { koreanLevel, majorType, interests, difficultyPref } = answer;

  // 가중치 상수
  const WEIGHTS = {
    KOREAN_LEVEL_MATCH: 2,
    MAJOR_MATCH: 3,
    TAG_OVERLAP: 2,
    DIFFICULTY_MATCH: 3,
    BASE_SCORE: 1
  };

  const MAX_RESULTS = 5;

  return COURSES
    .map(course => {
      let score = WEIGHTS.BASE_SCORE;

      // (1) 한국어 수준: 너무 어렵다면 제외
      if (course.koreanLevel - koreanLevel > 1) {
        return null; // 레벨 차이가 2 이상 나면 추천에서 제외
      } else if (course.koreanLevel <= koreanLevel) {
        score += WEIGHTS.KOREAN_LEVEL_MATCH; // 수준이 같거나 조금 낮으면 가산점
      }

      // (2) 전공 계열 매칭
      if (course.majorTypes.includes("etc") || course.majorTypes.includes(majorType)) {
        score += WEIGHTS.MAJOR_MATCH;
      }

      // (3) 관심 분야 태그 겹치기
      const overlap = course.tags.filter(t => interests.includes(t));
      score += overlap.length * WEIGHTS.TAG_OVERLAP;

      // (4) 난이도 선호 매칭
      if (difficultyPref === "easy" && course.difficulty <= 2) {
        score += WEIGHTS.DIFFICULTY_MATCH;
      }
      if (difficultyPref === "normal" && course.difficulty === 3) {
        score += WEIGHTS.DIFFICULTY_MATCH;
      }
      if (difficultyPref === "hard" && course.difficulty >= 4) {
        score += WEIGHTS.DIFFICULTY_MATCH;
      }

      return { course, score };
    })
    .filter(item => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);
}

// 결과 렌더링
function renderResult(answers, recommended) {
  const resultDiv = document.getElementById("result");

  if (recommended.length === 0) {
    resultDiv.innerHTML = `
      <h2>🔍 추천 결과</h2>
      <p>조건에 딱 맞는 과목을 찾지 못했어요. 한국어 수준이나 난이도 선호를 조금 바꿔서 다시 시도해 보세요.</p>
    `;
    return;
  }

  const itemsHtml = recommended.map((item, index) => {
    const c = item.course;
    const tagsHtml = c.tags.map(t => `<span class="badge badge-tag">${t}</span>`).join("");
    const rank = index + 1;

    return `
      <div class="course-card">
        <h3>${rank}. ${c.name}</h3>
        <div class="meta-row">
          <span class="badge badge-level">TOPIK ${c.koreanLevel}급 전후</span>
          <span class="badge badge-diff">난이도 ${c.difficulty}/5</span>
          ${tagsHtml}
        </div>
        <div class="desc-box">
          ${c.desc}
        </div>
        <p class="score-text">
          <strong>추천 점수:</strong> ${item.score}점
        </p>
      </div>
    `;
  }).join("");

  resultDiv.innerHTML = `
    <h2>✨ 추천 결과</h2>
    <p>입력한 응답을 바탕으로 아래 과목들을 추천합니다.</p>
    ${itemsHtml}
  `;
}

// 에러 표시
function showError(message) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <h2>⚠️ 오류</h2>
    <p style="color: #b91c1c;">${message}</p>
  `;
  resultDiv.style.display = 'block';
}

// 로딩 표시
function showLoading() {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = '<div class="loading">과목 데이터 로딩 중</div>';
  resultDiv.style.display = 'block';
}

// 초기화
document.addEventListener('DOMContentLoaded', async function() {
  showLoading();
  await loadCourses();
  initializeSurveyForm();
  document.getElementById("result").style.display = 'none';
});
