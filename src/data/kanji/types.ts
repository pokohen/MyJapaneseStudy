// 한자 데이터 타입 정의

export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1" | "none";

export interface KanjiData {
  char: string;      // 한자
  meaning: string;   // 의미
  onyomi: string;    // 음독 (カタカナ)
  kunyomi: string;   // 훈독 (ひらがな)
  jlpt: JLPTLevel;   // JLPT 급수
}
