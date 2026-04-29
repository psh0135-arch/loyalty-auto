// AI Message Generation Service
// Mock implementation. Swap `generateAIMessage` body with real API call later
// (e.g., Lovable AI Gateway / OpenAI) without changing callers.

export type BrandTone = "friendly" | "professional" | "luxury" | "urgent";
export type MessageChannel = "push" | "email" | "sms";

export interface GenerateMessageInput {
  interests: string;
  recentBehavior: string;
  goal: string;
  tone: BrandTone;
  channel: MessageChannel;
  maxLength: number;
  forbiddenWords: string;
}

export interface GeneratedMessage {
  title: string;
  body: string;
  cta: string;
  sendTiming: string;
}

const toneLabel: Record<BrandTone, string> = {
  friendly: "친근한",
  professional: "전문적인",
  luxury: "고급스러운",
  urgent: "긴급한",
};

const toneIntros: Record<BrandTone, string> = {
  friendly: "안녕하세요! 😊",
  professional: "고객님께 알려드립니다.",
  luxury: "특별한 분께 먼저 전해드립니다.",
  urgent: "⏰ 지금 확인하세요!",
};

const toneCTAs: Record<BrandTone, string> = {
  friendly: "지금 보러 가기",
  professional: "상세 정보 확인",
  luxury: "프리미엄 컬렉션 보기",
  urgent: "지금 바로 받기",
};

const channelTimings: Record<MessageChannel, string> = {
  push: "오늘 오후 7:30 (앱 활성도가 가장 높은 시간)",
  email: "내일 오전 10:00 (이메일 오픈율 피크 시간)",
  sms: "오늘 오후 12:00 (점심 시간대 도달률 최적)",
};

function truncate(text: string, max: number) {
  if (!max || text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 1)) + "…";
}

function applyForbidden(text: string, forbidden: string) {
  if (!forbidden.trim()) return text;
  const words = forbidden
    .split(/[,\n]/)
    .map((w) => w.trim())
    .filter(Boolean);
  let out = text;
  for (const w of words) {
    const re = new RegExp(w, "gi");
    out = out.replace(re, "•".repeat(Math.max(2, w.length)));
  }
  return out;
}

function mockGenerate(input: GenerateMessageInput): GeneratedMessage {
  const interests = input.interests.trim() || "관심 카테고리";
  const behavior = input.recentBehavior.trim() || "최근 활동";
  const goal = input.goal.trim() || "특별 혜택";
  const intro = toneIntros[input.tone];

  const title =
    input.tone === "urgent"
      ? `${interests} 한정 혜택, 곧 마감돼요!`
      : input.tone === "luxury"
      ? `${interests}을(를) 위한 프리미엄 제안`
      : input.tone === "professional"
      ? `${interests} 관련 맞춤 추천`
      : `${interests} 좋아하시죠? 딱 맞는 소식이에요`;

  const body =
    `${intro} ${behavior}을(를) 보셨더라구요. ` +
    `${interests}에 관심 있는 고객님을 위해 ${goal}을(를) 준비했어요. ` +
    `${toneLabel[input.tone]} 톤으로 전달드리는 오늘만의 특별 제안을 놓치지 마세요.`;

  const message: GeneratedMessage = {
    title: applyForbidden(truncate(title, Math.min(input.maxLength, 60)), input.forbiddenWords),
    body: applyForbidden(truncate(body, input.maxLength), input.forbiddenWords),
    cta: toneCTAs[input.tone],
    sendTiming: channelTimings[input.channel],
  };
  return message;
}

/**
 * Generate an AI personalized message.
 * Currently returns mock data. Replace internals with a real API call later.
 */
export async function generateAIMessage(
  input: GenerateMessageInput
): Promise<GeneratedMessage> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 800));
  return mockGenerate(input);

  // --- Future API integration example ---
  // const res = await fetch("/functions/v1/generate-message", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(input),
  // });
  // if (!res.ok) throw new Error("Failed to generate message");
  // return (await res.json()) as GeneratedMessage;
}
