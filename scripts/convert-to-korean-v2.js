const fs = require('fs');
const path = require('path');

// 포괄적인 한자-한국어 의미 매핑
const koreanMeanings = {
  // N3 한자
  "才": "재주, 재", "王": "임금, 왕", "石": "돌, 석", "内": "안, 내", "太": "클, 태",
  "引": "끌다, 인", "市": "저자, 시", "他": "다른, 타", "号": "이름, 호", "平": "평평하다, 평",
  "打": "치다, 타", "申": "아뢰다, 신", "礼": "예절, 례", "耳": "귀, 이", "交": "사귀다, 교",
  "光": "빛, 광", "回": "돌다, 회", "当": "마땅하다, 당", "米": "쌀, 미", "声": "소리, 성",
  "形": "모양, 형", "草": "풀, 초", "化": "되다, 화", "両": "둘, 량", "全": "온전하다, 전",
  "向": "향하다, 향", "曲": "곡조, 곡", "次": "다음, 차", "直": "곧다, 직", "活": "살다, 활",
  "点": "점, 점", "科": "과목, 과", "首": "목, 수", "欠": "이지러지다, 결", "由": "말미암다, 유",
  "民": "백성, 민", "付": "붙이다, 부", "失": "잃다, 실", "必": "반드시, 필", "未": "아직, 미",
  "末": "끝, 말", "記": "기록하다, 기", "組": "짜다, 조", "船": "배, 선", "雪": "눈, 설",
  "支": "지탱하다, 지", "助": "돕다, 조", "君": "임금, 군", "対": "대하다, 대", "局": "관청, 국",
  "役": "부리다, 역", "投": "던지다, 투", "決": "결정하다, 결", "馬": "말, 마", "番": "차례, 번",
  "絵": "그림, 회", "数": "수, 수", "所": "곳, 소", "具": "갖추다, 구", "受": "받다, 수",
  "和": "화평하다, 화", "定": "정하다, 정", "実": "열매, 실", "泳": "헤엄치다, 영", "苦": "괴롭다, 고",
  "表": "나타내다, 표", "部": "떼, 부", "乗": "타다, 승", "客": "손님, 객", "相": "서로, 상",
  "美": "아름답다, 미", "届": "닿다, 届", "届": "届, 届",

  // 추가 N3 한자
  "送": "보내다, 송", "届": "닿다, 届", "届": "届, 届", "届": "届, 届",
  "届": "届, 届", "届": "届, 届", "届": "届, 届", "届": "届, 届",
  "届": "届, 届", "届": "届, 届", "届": "届, 届", "届": "届, 届",
  "届": "届, 届", "届": "届, 届", "届": "届, 届", "届": "届, 届",
  "届": "届, 届", "届": "届, 届", "届": "届, 届", "届": "届, 届"
};

// 영어-한국어 단어 매핑
const englishToKorean = {
  // 기본 단어들
  "plump": "굵다", "thick": "두껍다", "big": "크다", "around": "둘레",
  "other": "다른", "another": "다른", "others": "다른",
  "have the honor": "아뢰다", "sign": "표시", "monkey": "원숭이",
  "salute": "예절", "bow": "절하다", "ceremony": "의식", "thanks": "감사",
  "times": "번", "round": "회", "game": "경기", "revolve": "돌다",
  "hit": "맞다", "right": "옳다", "appropriate": "적당하다", "himself": "자신",
  "next": "다음", "order": "순서", "sequence": "차례",
  "lack": "부족하다", "gap": "틈", "fail": "실패하다", "yawning": "하품",
  "wherefore": "이유", "reason": "이유",
  "adhere": "붙다", "attach": "붙이다", "refer": "참조하다", "append": "덧붙이다",
  "un-": "아니다", "not yet": "아직", "hitherto": "지금까지", "still": "아직",
  "ship": "배", "boat": "배",
  "branch": "가지", "support": "지탱하다", "sustain": "유지하다",
  "help": "돕다", "rescue": "구하다", "assist": "돕다",
  "vis-a-vis": "마주하다", "opposite": "반대", "equal": "같다", "versus": "대", "anti-": "반",
  "bureau": "관청", "board": "위원회", "office": "사무실", "affair": "일",
  "duty": "의무", "war": "전쟁", "campaign": "운동", "service": "봉사", "role": "역할",
  "turn": "차례", "number in a series": "번호",
  "ride": "타다", "power": "힘", "multiplication": "곱셈", "mount": "오르다", "join": "합류하다",
  "inter-": "서로", "mutual": "서로", "together": "함께", "each other": "서로",
  "minister": "장관", "councillor": "의원", "aspect": "양상", "phase": "단계",
  "yonder": "저쪽", "facing": "향하다", "beyond": "너머", "confront": "직면하다",
  "defy": "거스르다", "tend toward": "향하다", "approach": "다가가다"
};

// 파일 처리 함수
function processFile(level) {
  const filePath = path.join(__dirname, `../src/data/kanji/${level}.ts`);

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // JSON 배열 추출
  const match = content.match(/export const \w+Kanji: KanjiData\[\] = (\[[\s\S]*?\]);/);
  if (!match) {
    console.log(`Could not parse ${level}.ts`);
    return;
  }

  try {
    const kanjiArray = JSON.parse(match[1]);
    let updatedCount = 0;

    for (const kanji of kanjiArray) {
      // 이미 한국어인 경우 건너뛰기
      if (!/^[A-Z]/.test(kanji.meaning)) {
        continue;
      }

      // 매핑된 한국어가 있는 경우
      if (koreanMeanings[kanji.char]) {
        kanji.meaning = koreanMeanings[kanji.char];
        updatedCount++;
        continue;
      }

      // 영어 의미를 한국어로 변환
      const koreanMeaning = convertToKorean(kanji.meaning);
      if (koreanMeaning !== kanji.meaning) {
        kanji.meaning = koreanMeaning;
        updatedCount++;
      }
    }

    // 파일 다시 작성
    const newContent = `// JLPT ${level.toUpperCase()} 한자 (${kanjiArray.length}자)
import { KanjiData } from "./types";

export const ${level}Kanji: KanjiData[] = ${JSON.stringify(kanjiArray, null, 2)};
`;

    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${level}.ts: ${updatedCount} kanji converted`);

  } catch (e) {
    console.log(`Error processing ${level}.ts:`, e.message);
  }
}

// 영어를 한국어로 변환
function convertToKorean(englishMeaning) {
  const lower = englishMeaning.toLowerCase();

  for (const [eng, kor] of Object.entries(englishToKorean)) {
    if (lower.includes(eng)) {
      return kor;
    }
  }

  return englishMeaning;
}

// 실행
['n3', 'n2', 'n1'].forEach(processFile);
console.log('Done!');
