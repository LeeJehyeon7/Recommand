/**
 * Google Apps Script - 교과목 추천 데이터 저장
 *
 * 설정 방법:
 * 1. Google Drive에서 새 스프레드시트 생성
 * 2. 확장 프로그램 > Apps Script 선택
 * 3. 이 코드를 붙여넣기
 * 4. 배포 > 새 배포 > 유형: 웹 앱
 * 5. 액세스 권한: "모든 사용자" 선택
 * 6. 배포 후 URL 복사하여 index.html의 GOOGLE_SCRIPT_URL에 입력
 */

function doPost(e) {
  try {
    // 스프레드시트 설정
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 헤더가 없으면 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        '제출시간',
        '전공',
        '학번',
        '한국어 수준',
        '원하는 분야',
        '상호작용',
        '추천 과목 수',
        '추천 과목 목록',
        'IP 주소',
        'User Agent',
        '플랫폼',
        '언어',
        '화면 해상도',
        '뷰포트 크기',
        '타임존',
        '기기 유형'
      ]);
    }

    // POST 데이터 파싱
    const data = JSON.parse(e.postData.contents);

    // 데이터 행 추가
    sheet.appendRow([
      new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      data.major || '',
      data.studentId || '',
      data.koreanLevel || '',
      data.fields.join(', ') || '선택 안 함',
      data.interaction === 'Y' ? '예' : data.interaction === 'N' ? '아니오' : '상관없음',
      data.recommendedCount || 0,
      data.recommendedCourses || '',
      data.ipAddress || 'Unknown',  // 클라이언트에서 전송한 IP 주소 사용
      data.userAgent || '',
      data.platform || '',
      data.language || '',
      data.screenResolution || '',
      data.viewportSize || '',
      data.timezone || '',
      data.deviceType || ''
    ]);

    // 성공 응답
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '데이터가 성공적으로 저장되었습니다.'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 오류 응답
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: '오류: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청 처리 (테스트용)
function doGet(e) {
  return ContentService
    .createTextOutput('교과목 추천 시스템 - Google Sheets 연동 활성화됨')
    .setMimeType(ContentService.MimeType.TEXT);
}
