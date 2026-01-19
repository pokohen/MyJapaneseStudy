// 상용한자 데이터 통합 export
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

console.log(`Total kanji loaded: ${allKanji.length}`);
