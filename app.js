// 교양 과목 추천 시스템 - 메인 로직 (New CSV Format)

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
    const response = await fetch('courses_new.csv');
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

// 폴백 데이터 (로컬 테스트용 - 샘플 5개)
function getFallbackCourses() {
  return [
    {
      NO: "1",
      category: "문화와 표현",
      name: "리얼리스틱글쓰기",
      koreanLevel: "중급A",
      listening: "2",
      speaking: "2",
      reading: "2",
      writing: "2",
      materialProvided: "Y",
      culturalContent: "전혀 다루지않음",
      interaction: "N",
      professor: "윤희진"
    },
    {
      NO: "3",
      category: "인간과 윤리",
      name: "보건의료윤리론",
      koreanLevel: "중급B",
      listening: "2",
      speaking: "3",
      reading: "2",
      writing: "2",
      materialProvided: "Y",
      culturalContent: "전혀 다루지않음",
      interaction: "Y",
      professor: "윤희진"
    },
    {
      NO: "11",
      category: "인간과 윤리",
      name: "래퍼런스시리즈_한강",
      koreanLevel: "중급A",
      listening: "2",
      speaking: "2",
      reading: "2",
      writing: "1",
      materialProvided: "N",
      culturalContent: "전혀 다루지않음",
      interaction: "Y",
      professor: "윤희진"
    },
    {
      NO: "21",
      category: "사회와 경제",
      name: "우리시대의독서론",
      koreanLevel: "고급",
      listening: "4",
      speaking: "4",
      reading: "2",
      writing: "3",
      materialProvided: "N",
      culturalContent: "대부분 다룸",
      interaction: "N",
      professor: "윤희진"
    },
    {
      NO: "50",
      category: "문화와 표현",
      name: "처음만나는문화다양성",
      koreanLevel: "중급A",
      listening: "2",
      speaking: "2",
      reading: "2",
      writing: "2",
      materialProvided: "Y",
      culturalContent: "일부 다룸",
      interaction: "Y",
      professor: "윤희진"
    }
  ];
}

// CSV 파싱 함수 (새 형식)
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
      const key = header.trim();
      const value = values[index] ? values[index].replace(/^"|"$/g, '') : '';

      // 한국어 열 매핑
      const headerMap = {
        'NO': 'NO',
        '과목': 'category',
        '교수': 'name',
        '한국어 요구 수준(종합)': 'koreanLevel',
        '듣기': 'listening',
        '말하기': 'speaking',
        '읽기': 'reading',
        '쓰기': 'writing',
        '수업자료 사전제공': 'materialProvided',
        '한국문화/역사 정도': 'culturalContent',
        '학생간 상호작용': 'interaction',
        '분야': 'professor'
      };

      const mappedKey = headerMap[key] || key;
      course[mappedKey] = value;
    });

    return course;
  });
}

// 설문 제출 이벤트 처리
function initializeSurveyForm() {
  const form = document.getElementById("survey-form");

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const koreanLevel = form.koreanLevel.value;
    const listening = parseInt(form.listening.value, 10);
    const speaking = parseInt(form.speaking.value, 10);
    const reading = parseInt(form.reading.value, 10);
    const writing = parseInt(form.writing.value, 10);
    const materialProvided = form.materialProvided.value;
    const culturalContent = form.culturalContent.value;
    const interaction = form.interaction.value;

    const interestNodes = form.querySelectorAll('input[name="interest"]:checked');
    const interests = Array.from(interestNodes).map(i => i.value);

    const answers = {
      koreanLevel, listening, speaking, reading, writing,
      materialProvided, culturalContent, interaction, interests
    };

    const recommended = getRecommendedCourses(answers);
    renderResult(answers, recommended);

    // 결과로 스크롤
    document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// 추천 로직 (새 형식)
function getRecommendedCourses(answer) {
  const {
    koreanLevel, listening, speaking, reading, writing,
    materialProvided, culturalContent, interaction, interests
  } = answer;

  // 가중치 상수
  const WEIGHTS = {
    KOREAN_LEVEL_MATCH: 10,
    SKILL_MATCH: 3,  // 듣기/말하기/읽기/쓰기 각각
    MATERIAL_MATCH: 2,
    CULTURAL_MATCH: 2,
    INTERACTION_MATCH: 2,
    INTEREST_MATCH: 5
  };

  const MAX_RESULTS = 10;

  // 한국어 수준 순서
  const levelOrder = ['초급', '중급A', '중급B', '중고급', '고급'];

  return COURSES
    .map(course => {
      let score = 0;

      // (1) 한국어 종합 수준 매칭
      const userLevelIndex = levelOrder.indexOf(koreanLevel);
      const courseLevelIndex = levelOrder.indexOf(course.koreanLevel);

      if (courseLevelIndex <= userLevelIndex) {
        // 과목 수준이 사용자 수준 이하면 가산점
        score += WEIGHTS.KOREAN_LEVEL_MATCH * (1 + (userLevelIndex - courseLevelIndex) * 0.2);
      } else if (courseLevelIndex - userLevelIndex === 1) {
        // 한 단계 높으면 약간 감점
        score += WEIGHTS.KOREAN_LEVEL_MATCH * 0.5;
      } else {
        // 두 단계 이상 높으면 제외
        return null;
      }

      // (2) 듣기/말하기/읽기/쓰기 개별 스킬 매칭
      const courseListening = parseInt(course.listening, 10);
      const courseSpeaking = parseInt(course.speaking, 10);
      const courseReading = parseInt(course.reading, 10);
      const courseWriting = parseInt(course.writing, 10);

      // 각 스킬별 차이 계산 (사용자 수준 >= 과목 요구 수준이면 가산점)
      if (listening >= courseListening) score += WEIGHTS.SKILL_MATCH * (1 + (listening - courseListening) * 0.3);
      if (speaking >= courseSpeaking) score += WEIGHTS.SKILL_MATCH * (1 + (speaking - courseSpeaking) * 0.3);
      if (reading >= courseReading) score += WEIGHTS.SKILL_MATCH * (1 + (reading - courseReading) * 0.3);
      if (writing >= courseWriting) score += WEIGHTS.SKILL_MATCH * (1 + (writing - courseWriting) * 0.3);

      // (3) 수업 자료 사전 제공 매칭
      if (materialProvided === 'any' || materialProvided === course.materialProvided) {
        score += WEIGHTS.MATERIAL_MATCH;
      }

      // (4) 한국 문화/역사 다루는 정도 매칭
      if (culturalContent === 'any' || culturalContent === course.culturalContent) {
        score += WEIGHTS.CULTURAL_MATCH;
      }

      // (5) 학생 간 상호작용 매칭
      if (interaction === 'any' || interaction === course.interaction) {
        score += WEIGHTS.INTERACTION_MATCH;
      }

      // (6) 관심 분야 (과목) 매칭
      if (interests.length > 0 && interests.includes(course.category)) {
        score += WEIGHTS.INTEREST_MATCH;
      } else if (interests.length === 0) {
        // 관심 분야 미선택 시 약간의 기본 점수
        score += 1;
      }

      return { course, score };
    })
    .filter(item => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);
}

// 결과 렌더링 (새 UI)
function renderResult(answers, recommended) {
  const resultDiv = document.getElementById("result");

  if (recommended.length === 0) {
    resultDiv.innerHTML = `
      <h2>🔍 추천 결과</h2>
      <p>조건에 딱 맞는 과목을 찾지 못했어요. 한국어 수준이나 다른 조건을 조금 조정해서 다시 시도해 보세요.</p>
    `;
    return;
  }

  const itemsHtml = recommended.map((item, index) => {
    const c = item.course;
    const rank = index + 1;

    return `
      <div class="course-card">
        <div class="course-header">
          <span class="rank-badge">${rank}</span>
          <div class="course-title-section">
            <h3 class="course-name">${c.name}</h3>
            <div class="course-meta">
              <span class="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                ${c.professor}
              </span>
              <span class="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                ${c.category}
              </span>
            </div>
          </div>
        </div>

        <div class="course-details">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">한국어 수준</span>
              <span class="detail-value">${c.koreanLevel}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">듣기</span>
              <span class="detail-value">${c.listening}/4</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">말하기</span>
              <span class="detail-value">${c.speaking}/4</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">읽기</span>
              <span class="detail-value">${c.reading}/4</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">쓰기</span>
              <span class="detail-value">${c.writing}/4</span>
            </div>
          </div>

          <div class="feature-tags">
            ${c.materialProvided === 'Y' ? '<span class="feature-tag">📄 자료 사전제공</span>' : ''}
            ${c.culturalContent !== '전혀 다루지않음' ? `<span class="feature-tag">🇰🇷 ${c.culturalContent}</span>` : ''}
            ${c.interaction === 'Y' ? '<span class="feature-tag">👥 학생간 협업</span>' : ''}
          </div>

          <div class="score-section">
            <span class="score-label">매칭 점수</span>
            <span class="score-value">${Math.round(item.score)}점</span>
          </div>
        </div>
      </div>
    `;
  }).join("");

  resultDiv.innerHTML = `
    <h2>✨ 추천 과목</h2>
    <p class="result-summary">총 <strong>${recommended.length}개</strong>의 과목을 추천합니다.</p>
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
