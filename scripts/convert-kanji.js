const fs = require('fs');
const path = require('path');

// Read the raw kanji data
const rawData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/kanji-raw.json'), 'utf8')
);

// JLPT level mapping (jlpt_new field in data)
const jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

// Korean meanings for common kanji (partial - will be supplemented)
const koreanMeanings = {
  '一': '하나, 일',
  '二': '둘, 이',
  '三': '셋, 삼',
  '四': '넷, 사',
  '五': '다섯, 오',
  '六': '여섯, 육',
  '七': '일곱, 칠',
  '八': '여덟, 팔',
  '九': '아홉, 구',
  '十': '열, 십',
  '百': '백',
  '千': '천',
  '万': '만',
  '円': '엔, 원',
  '年': '해, 년',
  '月': '달, 월',
  '日': '날, 일',
  '週': '주',
  '時': '때, 시',
  '分': '분, 나누다',
  '半': '반',
  '今': '지금, 금',
  '前': '앞, 전',
  '後': '뒤, 후',
  '間': '사이, 간',
  '人': '사람, 인',
  '子': '아이, 자',
  '女': '여자, 녀',
  '男': '남자, 남',
  '父': '아버지, 부',
  '母': '어머니, 모',
  '友': '친구, 우',
  '私': '나, 사',
  '北': '북',
  '南': '남',
  '東': '동',
  '西': '서',
  '上': '위, 상',
  '下': '아래, 하',
  '中': '가운데, 중',
  '大': '큰, 대',
  '小': '작은, 소',
  '山': '산',
  '川': '강, 천',
  '水': '물, 수',
  '火': '불, 화',
  '木': '나무, 목',
  '金': '금, 쇠',
  '土': '흙, 토',
  '国': '나라, 국',
  '学': '배우다, 학',
  '校': '학교, 교',
  '生': '살다, 생',
  '先': '먼저, 선',
  '見': '보다, 견',
  '聞': '듣다, 문',
  '読': '읽다, 독',
  '書': '쓰다, 서',
  '話': '말하다, 화',
  '言': '말씀, 언',
  '食': '먹다, 식',
  '飲': '마시다, 음',
  '行': '가다, 행',
  '来': '오다, 래',
  '出': '나가다, 출',
  '入': '들어가다, 입',
  '立': '서다, 립',
  '休': '쉬다, 휴',
  '買': '사다, 매',
  '売': '팔다, 매',
  '車': '차, 거',
  '電': '전기, 전',
  '駅': '역',
  '道': '길, 도',
  '店': '가게, 점',
  '会': '모이다, 회',
  '社': '모임, 사',
  '新': '새롭다, 신',
  '古': '오래되다, 고',
  '高': '높다, 고',
  '安': '편안하다, 안',
  '長': '길다, 장',
  '白': '희다, 백',
  '黒': '검다, 흑',
  '赤': '붉다, 적',
  '青': '푸르다, 청',
  '天': '하늘, 천',
  '気': '기운, 기',
  '雨': '비, 우',
  '花': '꽃, 화',
  '名': '이름, 명',
  '語': '말, 어',
  '本': '책, 본',
  '目': '눈, 목',
  '耳': '귀, 이',
  '口': '입, 구',
  '手': '손, 수',
  '足': '발, 족',
};

// Organize kanji by JLPT level
const kanjiByLevel = {
  N5: [],
  N4: [],
  N3: [],
  N2: [],
  N1: [],
  none: [] // kanji without JLPT level
};

// Process each kanji
for (const [char, data] of Object.entries(rawData)) {
  const jlptLevel = data.jlpt_new ? `N${data.jlpt_new}` : null;

  const kanjiEntry = {
    char,
    meaning: koreanMeanings[char] || data.meanings?.join(', ') || '',
    onyomi: data.readings_on?.join(', ') || '',
    kunyomi: data.readings_kun?.join(', ') || '',
    jlpt: jlptLevel || 'none'
  };

  if (jlptLevel && kanjiByLevel[jlptLevel]) {
    kanjiByLevel[jlptLevel].push(kanjiEntry);
  } else {
    kanjiByLevel.none.push(kanjiEntry);
  }
}

// Create the kanji data directory
const dataDir = path.join(__dirname, '../src/data/kanji');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate types.ts
const typesContent = `// 한자 데이터 타입 정의

export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1" | "none";

export interface KanjiData {
  char: string;      // 한자
  meaning: string;   // 의미
  onyomi: string;    // 음독 (カタカナ)
  kunyomi: string;   // 훈독 (ひらがな)
  jlpt: JLPTLevel;   // JLPT 급수
}
`;

fs.writeFileSync(path.join(dataDir, 'types.ts'), typesContent);
console.log('Created types.ts');

// Generate level files
for (const level of jlptLevels) {
  const kanji = kanjiByLevel[level];
  const levelLower = level.toLowerCase();

  const fileContent = `// JLPT ${level} 한자 (${kanji.length}자)
import { KanjiData } from "./types";

export const ${levelLower}Kanji: KanjiData[] = ${JSON.stringify(kanji, null, 2)};
`;

  fs.writeFileSync(path.join(dataDir, `${levelLower}.ts`), fileContent);
  console.log(`Created ${levelLower}.ts with ${kanji.length} kanji`);
}

// Generate index.ts
const indexContent = `// 상용한자 데이터 통합 export
export * from "./types";
export { n5Kanji } from "./n5";
export { n4Kanji } from "./n4";
export { n3Kanji } from "./n3";
export { n2Kanji } from "./n2";
export { n1Kanji } from "./n1";

import { n5Kanji } from "./n5";
import { n4Kanji } from "./n4";
import { n3Kanji } from "./n3";
import { n2Kanji } from "./n2";
import { n1Kanji } from "./n1";
import { KanjiData, JLPTLevel } from "./types";

// 전체 한자 배열
export const allKanji: KanjiData[] = [
  ...n5Kanji,
  ...n4Kanji,
  ...n3Kanji,
  ...n2Kanji,
  ...n1Kanji,
];

// JLPT 급수별 한자 맵
export const kanjiByLevel: Record<JLPTLevel, KanjiData[]> = {
  N5: n5Kanji,
  N4: n4Kanji,
  N3: n3Kanji,
  N2: n2Kanji,
  N1: n1Kanji,
  none: [],
};

// 한자 검색 인덱스
export const kanjiIndex: Record<string, KanjiData> = Object.fromEntries(
  allKanji.map(k => [k.char, k])
);

console.log(\`Total kanji loaded: \${allKanji.length}\`);
`;

fs.writeFileSync(path.join(dataDir, 'index.ts'), indexContent);
console.log('Created index.ts');

// Print summary
console.log('\\n=== Summary ===');
for (const level of jlptLevels) {
  console.log(`${level}: ${kanjiByLevel[level].length} kanji`);
}
console.log(`Without JLPT level: ${kanjiByLevel.none.length} kanji`);
console.log(`Total with JLPT: ${jlptLevels.reduce((sum, l) => sum + kanjiByLevel[l].length, 0)} kanji`);
