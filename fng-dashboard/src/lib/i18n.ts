export type Locale = "ko" | "en";

export const translations = {
  ko: {
    // Landing Page
    landing: {
      title: "공포 & 탐욕",
      descend: "입장하기",
      signIn: "로그인",
      join: "가입하기",
      inTheDepths: "시장의 깊은 곳에서...",
      whereHopeDies: "희망이 죽어가는 곳에서...",
      willYouSurvive: "살아남을 수 있겠는가?",
    },
    // Header
    header: {
      title: "⛧ 공포 & 탐욕 ⛧",
      lastOffering: "최종 업데이트",
    },
    // Gauge
    gauge: {
      soulStatus: "공포 & 탐욕 지수",
      sinceYesterday: "전일 대비:",
      fear: "공포",
      greed: "탐욕",
      terror: "극단적 공포",
      dread: "공포",
      unease: "중립",
      desire: "탐욕",
      madness: "극단적 탐욕",
    },
    // Stats
    stats: {
      chroniclesOfYear: "⛧ 연간 기록 ⛧",
      peakMadness: "최고의 광기",
      deepestTerror: "최심의 공포",
      whispersFromVoid: "💡 투자 명언",
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
      whatIsThisCurseText:
        "공포 & 탐욕 지수는 트레이더들의 영혼을 측정한다. 0(순수한 공포)부터 100(맹목적 탐욕)까지.",
      theOracle: "신탁",
      theOracleText: "데이터는 Alternative.me에서 흘러나와, 심연을 통해 속삭여진다.",
      aWarning: "경고",
      aWarningText:
        "이것은 투자 조언이 아니다. 이 던전에서, 당신의 선택의 무게는 오직 당신만이 짊어진다.",
    },
    // Footer
    footer: {
      dataExtracted: "심연에서 추출된 데이터 | NEXT.JS로 단조됨",
    },
    // Investment quotes (from famous investors)
    quotes: [
      { quote: "공포에 사고, 환호에 팔아라", author: "워렌 버핏" },
      {
        quote: "다른 사람들이 탐욕스러울 때 두려워하고, 다른 사람들이 두려워할 때 탐욕스러워라",
        author: "워렌 버핏",
      },
      {
        quote: "시장은 단기적으로 투표 기계지만, 장기적으로는 저울이다",
        author: "벤저민 그레이엄",
      },
      { quote: "최고의 투자 시간은 피가 거리에 흥건할 때다", author: "로스차일드" },
      { quote: "복리는 세계 8번째 불가사의다", author: "알버트 아인슈타인" },
      { quote: "투자에서 가장 위험한 말은 '이번엔 다르다'이다", author: "존 템플턴" },
      {
        quote: "주식시장은 인내심 없는 사람의 돈을 인내심 있는 사람에게 옮기는 도구다",
        author: "워렌 버핏",
      },
      { quote: "10년 동안 보유할 주식이 아니라면 10분도 보유하지 마라", author: "워렌 버핏" },
      { quote: "분산투자는 무지에 대한 방어책이다", author: "워렌 버핏" },
      { quote: "시장을 이기려 하지 말고, 시장과 함께 가라", author: "존 보글" },
      { quote: "가격은 당신이 지불하는 것이고, 가치는 당신이 얻는 것이다", author: "워렌 버핏" },
      {
        quote: "투자의 첫 번째 규칙: 절대 돈을 잃지 마라. 두 번째 규칙: 첫 번째 규칙을 잊지 마라",
        author: "워렌 버핏",
      },
      { quote: "군중을 따르면 군중 이상이 될 수 없다", author: "앙드레 코스톨라니" },
      { quote: "주식을 사는 것은 사업의 일부를 사는 것이다", author: "벤저민 그레이엄" },
      { quote: "하락장은 기회다. 공포가 극대화될 때 최고의 매수 기회가 온다", author: "피터 린치" },
      { quote: "시장 타이밍을 맞추려 하지 말고, 시장에 머무는 시간을 늘려라", author: "켄 피셔" },
      { quote: "단기 변동에 흔들리지 마라. 장기적 관점을 유지하라", author: "존 보글" },
      { quote: "투자는 마라톤이지, 단거리 경주가 아니다", author: "피터 린치" },
      { quote: "최악의 시기에 팔고, 최고의 시기에 사지 마라", author: "하워드 막스" },
      { quote: "감정은 투자의 적이다. 냉철함을 유지하라", author: "벤저민 그레이엄" },
    ],
  },
  en: {
    // Landing Page
    landing: {
      title: "FEAR & GREED",
      descend: "DESCEND",
      signIn: "SIGN IN",
      join: "JOIN",
      inTheDepths: "IN THE DEPTHS OF THE MARKET...",
      whereHopeDies: "WHERE HOPE GOES TO DIE...",
      willYouSurvive: "WILL YOU SURVIVE?",
    },
    // Header
    header: {
      title: "⛧ FEAR & GREED ⛧",
      lastOffering: "LAST OFFERING",
    },
    // Gauge
    gauge: {
      soulStatus: "FEAR & GREED INDEX",
      sinceYesterday: "SINCE YESTERDAY:",
      fear: "FEAR",
      greed: "GREED",
      terror: "EXTREME FEAR",
      dread: "FEAR",
      unease: "NEUTRAL",
      desire: "GREED",
      madness: "EXTREME GREED",
    },
    // Stats
    stats: {
      chroniclesOfYear: "⛧ CHRONICLES OF THE YEAR ⛧",
      peakMadness: "PEAK MADNESS",
      deepestTerror: "DEEPEST TERROR",
      whispersFromVoid: "💡 INVESTMENT WISDOM",
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
      whatIsThisCurseText:
        "The Fear & Greed Index measures the souls of traders, from 0 (pure terror) to 100 (blind greed).",
      theOracle: "THE ORACLE",
      theOracleText: "Data flows from the Alternative.me, whispered through the void.",
      aWarning: "A WARNING",
      aWarningText:
        "This is not financial advice. In this dungeon, you alone bear the weight of your choices.",
    },
    // Footer
    footer: {
      dataExtracted: "DATA EXTRACTED FROM THE VOID | FORGED WITH NEXT.JS",
    },
    // Investment quotes (from famous investors)
    quotes: [
      {
        quote: "Be fearful when others are greedy and greedy when others are fearful",
        author: "Warren Buffett",
      },
      {
        quote:
          "The stock market is a device for transferring money from the impatient to the patient",
        author: "Warren Buffett",
      },
      {
        quote:
          "In the short run, the market is a voting machine but in the long run, it is a weighing machine",
        author: "Benjamin Graham",
      },
      { quote: "The time to buy is when there's blood in the streets", author: "Baron Rothschild" },
      { quote: "Compound interest is the eighth wonder of the world", author: "Albert Einstein" },
      {
        quote: "The four most dangerous words in investing are: 'This time it's different'",
        author: "John Templeton",
      },
      {
        quote:
          "If you aren't willing to own a stock for 10 years, don't even think about owning it for 10 minutes",
        author: "Warren Buffett",
      },
      { quote: "Diversification is protection against ignorance", author: "Warren Buffett" },
      { quote: "Don't try to beat the market, join it", author: "John Bogle" },
      { quote: "Price is what you pay. Value is what you get", author: "Warren Buffett" },
      {
        quote: "Rule No. 1: Never lose money. Rule No. 2: Never forget Rule No. 1",
        author: "Warren Buffett",
      },
      {
        quote: "If you follow the crowd, you'll never be more than the crowd",
        author: "André Kostolany",
      },
      { quote: "Buying a stock is buying a piece of a business", author: "Benjamin Graham" },
      { quote: "The best time to invest is when fear is at its maximum", author: "Peter Lynch" },
      { quote: "Time in the market beats timing the market", author: "Ken Fisher" },
      { quote: "Stay the course. Don't let short-term volatility shake you", author: "John Bogle" },
      { quote: "Investing is a marathon, not a sprint", author: "Peter Lynch" },
      { quote: "Don't sell at the worst time and buy at the best time", author: "Howard Marks" },
      { quote: "Emotions are the enemy of investing. Stay rational", author: "Benjamin Graham" },
      {
        quote: "The market can stay irrational longer than you can stay solvent",
        author: "John Maynard Keynes",
      },
    ],
  },
} as const;

export type Translations = typeof translations.ko;

export function getTranslation(locale: Locale): Translations {
  return translations[locale];
}
