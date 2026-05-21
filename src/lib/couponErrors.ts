export type CouponErrorAction =
  | "load"
  | "create"
  | "update"
  | "toggle"
  | "categories";

const FALLBACK_MESSAGES: Record<CouponErrorAction, string> = {
  load: "Unable to load coupons right now. Please try again in a moment.",
  create:
    "Unable to create the coupon. Please check your details and try again.",
  update: "Unable to update the coupon. Please try again.",
  toggle: "Unable to change coupon status. Please try again.",
  categories:
    "Could not load product categories. Please try again in a moment.",
};

const OFFLINE_MESSAGE =
  "We couldn't reach the server. Please check your connection or try again when the service is back online.";

const SERVICE_UNAVAILABLE_MESSAGE =
  "The coupon service is temporarily unavailable. Please try again in a few minutes.";

function extractMessageFromApiBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const obj = body as Record<string, unknown>;

  if (obj.messages && typeof obj.messages === "object") {
    const msgs = obj.messages as Record<string, unknown>;
    if (typeof msgs.error === "string" && msgs.error.trim()) {
      return msgs.error.trim();
    }
    if (typeof msgs.message === "string" && msgs.message.trim()) {
      return msgs.message.trim();
    }
  }

  if (typeof obj.message === "string" && obj.message.trim()) {
    return obj.message.trim();
  }

  if (typeof obj.error === "string" && obj.error.trim()) {
    return obj.error.trim();
  }

  return null;
}

function parseHttpErrorMessage(message: string): string | null {
  const match = message.match(/^HTTP (\d{3}):\s*([\s\S]*)$/);
  if (!match) return null;

  const status = Number(match[1]);
  const bodyText = match[2].trim();

  if (status >= 500 || status === 502 || status === 503 || status === 504) {
    return SERVICE_UNAVAILABLE_MESSAGE;
  }

  if (bodyText.startsWith("{") || bodyText.startsWith("[")) {
    try {
      return extractMessageFromApiBody(JSON.parse(bodyText));
    } catch {
      return null;
    }
  }

  if (bodyText && bodyText.length <= 200 && !bodyText.startsWith("{")) {
    return bodyText;
  }

  return null;
}

function looksLikeRawApiPayload(message: string): boolean {
  const trimmed = message.trim();
  return (
    /^HTTP \d{3}/.test(trimmed) ||
    (trimmed.startsWith("{") && trimmed.includes('"status"'))
  );
}

/** Maps API/network failures to readable copy for coupon screens only. */
export function getCouponErrorMessage(
  error: unknown,
  action: CouponErrorAction
): string {
  const fallback = FALLBACK_MESSAGES[action];

  if (!(error instanceof Error)) return fallback;

  const message = error.message.trim();
  if (!message) return fallback;

  if (
    message.includes("Network error") ||
    message.includes("Failed to fetch")
  ) {
    return OFFLINE_MESSAGE;
  }

  if (message.includes("Session expired")) {
    return message;
  }

  const httpMessage = parseHttpErrorMessage(message);
  if (httpMessage) return httpMessage;

  if (message.startsWith("{")) {
    try {
      const extracted = extractMessageFromApiBody(JSON.parse(message));
      if (extracted) return extracted;
    } catch {
      /* use fallback */
    }
    return fallback;
  }

  if (looksLikeRawApiPayload(message)) {
    return fallback;
  }

  if (message.length <= 160 && !message.includes("{")) {
    return message;
  }

  return fallback;
}
