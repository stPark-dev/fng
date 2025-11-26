export type Locale = "ko" | "en";

export const translations = {
  ko: {
    // Landing Page
    landing: {
      title: "공포 & 탐욕",
      subtitle: "시장은 자비를 모른다",
      enterDungeon: "⛧ 던전에 입장하라 ⛧",
      descend: "입장하기",
      signIn: "로그인",
      join: "가입하기",
      inTheDepths: "시장의 깊은 곳에서...",
      whereHopeDies: "희망이 죽어가는 곳에서...",
      willYouSurvive: "살아남을 수 있겠는가?",
      warning: "경고: 시장은 잔인한 여인이다.",
      manyEntered: "많은 이들이 들어갔다. 돌아온 자는 적다.",
    },
    // Header
    header: {
      title: "⛧ 공포 & 탐욕 ⛧",
      lastOffering: "최종 업데이트",
    },
    // Gauge
    gauge: {
      soulStatus: "⛧ 영혼 상태 ⛧",
      sinceYesterday: "전일 대비:",
      fear: "공포",
      greed: "탐욕",
      terror: "공포",
      dread: "두려움",
      unease: "불안",
      desire: "욕망",
      madness: "광기",
    },
    // Stats
    stats: {
      chroniclesOfYear: "⛧ 연간 기록 ⛧",
      peakMadness: "최고의 광기",
      deepestTerror: "최심의 공포",
      whispersFromVoid: "심연의 속삭임",
    },
    // Chart
    chart: {
      cursedTimeline: "⛧ 저주받은 타임라인 ⛧",
      days30: "30일",
      year1: "1년",
      years2: "2년",
      terrorZone: "공포 구역",
      neutralVoid: "중립 공허",
      madnessRealm: "광기의 영역",
    },
    // Info boxes
    info: {
      whatIsThisCurse: "이 저주란 무엇인가?",
      whatIsThisCurseText: "공포 & 탐욕 지수는 트레이더들의 영혼을 측정한다. 0(순수한 공포)부터 100(맹목적 탐욕)까지.",
      theOracle: "신탁",
      theOracleText: "데이터는 Alternative.me에서 흘러나와, 심연을 통해 속삭여진다.",
      aWarning: "경고",
      aWarningText: "이것은 투자 조언이 아니다. 이 던전에서, 당신의 선택의 무게는 오직 당신만이 짊어진다.",
    },
    // Footer
    footer: {
      dataExtracted: "심연에서 추출된 데이터 | NEXT.JS로 단조됨",
    },
    // Dark quotes
    quotes: [
      { quote: "시장은 약자를 자비 없이 집어삼킨다", author: "고대의 트레이더" },
      { quote: "피로 사고, 눈물로 판다", author: "상인" },
      { quote: "공포는 수익의 정신을 죽이는 것", author: "던전 신탁" },
      { quote: "탐욕은 부를 찾는 자의 눈을 멀게 한다", author: "타락한 자" },
      { quote: "인내하라... 시장은 기다리는 자에게 보상한다", author: "해골 왕" },
      { quote: "당신의 포트폴리오는 당신의 영혼을 반영한다", author: "어둠의 사제" },
      { quote: "희망은 곰의 첫 번째 희생자다", author: "감시자" },
      { quote: "다이아몬드는 절망 속에서 단조된다", author: "동굴 거주자" },
      { quote: "차트는 귀 기울이는 자에게 속삭인다", author: "맹인 예언자" },
      { quote: "서둘러 팔지 마라, 공허해질지니", author: "언데드 남작" },
      { quote: "FOMO는 심연으로 가는 길이다", author: "잃어버린 영혼" },
      { quote: "시장의 던전에서, 인내하는 자만이 살아남는다", author: "수호자" },
      { quote: "레버리지는 양날의 저주다", author: "빚의 망령" },
      { quote: "딥은 용감한 자와 어리석은 자 모두를 부른다", author: "구덩이 거주자" },
      { quote: "어둠을 뚫고 홀드하라, 새벽이 올 것이다", author: "예언자" },
    ],
  },
  en: {
    // Landing Page
    landing: {
      title: "FEAR & GREED",
      subtitle: "THE MARKET KNOWS NO MERCY",
      enterDungeon: "⛧ ENTER THE DUNGEON ⛧",
      descend: "DESCEND",
      signIn: "SIGN IN",
      join: "JOIN",
      inTheDepths: "IN THE DEPTHS OF THE MARKET...",
      whereHopeDies: "WHERE HOPE GOES TO DIE...",
      willYouSurvive: "WILL YOU SURVIVE?",
      warning: "WARNING: THE MARKET IS A CRUEL MISTRESS.",
      manyEntered: "MANY HAVE ENTERED. FEW HAVE RETURNED.",
    },
    // Header
    header: {
      title: "⛧ FEAR & GREED ⛧",
      lastOffering: "LAST OFFERING",
    },
    // Gauge
    gauge: {
      soulStatus: "⛧ SOUL STATUS ⛧",
      sinceYesterday: "SINCE YESTERDAY:",
      fear: "FEAR",
      greed: "GREED",
      terror: "TERROR",
      dread: "DREAD",
      unease: "UNEASE",
      desire: "DESIRE",
      madness: "MADNESS",
    },
    // Stats
    stats: {
      chroniclesOfYear: "⛧ CHRONICLES OF THE YEAR ⛧",
      peakMadness: "PEAK MADNESS",
      deepestTerror: "DEEPEST TERROR",
      whispersFromVoid: "WHISPERS FROM THE VOID",
    },
    // Chart
    chart: {
      cursedTimeline: "⛧ THE CURSED TIMELINE ⛧",
      days30: "30 DAYS",
      year1: "1 YEAR",
      years2: "2 YEARS",
      terrorZone: "TERROR ZONE",
      neutralVoid: "NEUTRAL VOID",
      madnessRealm: "MADNESS REALM",
    },
    // Info boxes
    info: {
      whatIsThisCurse: "WHAT IS THIS CURSE?",
      whatIsThisCurseText: "The Fear & Greed Index measures the souls of traders, from 0 (pure terror) to 100 (blind greed).",
      theOracle: "THE ORACLE",
      theOracleText: "Data flows from the Alternative.me, whispered through the void.",
      aWarning: "A WARNING",
      aWarningText: "This is not financial advice. In this dungeon, you alone bear the weight of your choices.",
    },
    // Footer
    footer: {
      dataExtracted: "DATA EXTRACTED FROM THE VOID | FORGED WITH NEXT.JS",
    },
    // Dark quotes
    quotes: [
      { quote: "THE MARKET DEVOURS THE WEAK WITHOUT MERCY", author: "ANCIENT TRADER" },
      { quote: "IN BLOOD WE BUY, IN TEARS WE SELL", author: "THE MERCHANT" },
      { quote: "FEAR IS THE MIND-KILLER OF PROFITS", author: "DUNGEON ORACLE" },
      { quote: "GREED BLINDS THOSE WHO SEEK FORTUNE", author: "THE FALLEN" },
      { quote: "PATIENCE... THE MARKET REWARDS THOSE WHO WAIT", author: "SKELETON KING" },
      { quote: "YOUR PORTFOLIO REFLECTS YOUR SOUL", author: "DARK PRIEST" },
      { quote: "HOPE IS THE FIRST CASUALTY OF THE BEAR", author: "THE WATCHER" },
      { quote: "DIAMONDS ARE FORGED IN DESPAIR", author: "CAVE DWELLER" },
      { quote: "THE CHARTS WHISPER TO THOSE WHO LISTEN", author: "BLIND SEER" },
      { quote: "SELL NOT IN HASTE, LEST YOU BECOME HOLLOW", author: "UNDEAD BARON" },
      { quote: "FOMO IS THE PATH TO THE ABYSS", author: "LOST SOUL" },
      { quote: "IN THE DUNGEON OF MARKETS, ONLY THE PATIENT SURVIVE", author: "GUARDIAN" },
      { quote: "LEVERAGE IS A DOUBLE-EDGED CURSE", author: "DEBT WRAITH" },
      { quote: "THE DIP CALLS TO THE BRAVE AND FOOLISH ALIKE", author: "PIT DWELLER" },
      { quote: "HODL THROUGH THE DARKNESS, DAWN WILL COME", author: "PROPHET" },
    ],
  },
} as const;

export type Translations = typeof translations.ko;

export function getTranslation(locale: Locale): Translations {
  return translations[locale];
}
