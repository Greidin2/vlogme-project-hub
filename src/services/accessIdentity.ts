export type AccessIdentity = {
  email: string;
  name?: string;
};

export type AccessIdentityResult =
  | { state: "local" }
  | { state: "authenticated"; identity: AccessIdentity }
  | { state: "unavailable"; message: string };

type CloudflareIdentityResponse = {
  email?: unknown;
  name?: unknown;
};

export async function getAccessIdentity(): Promise<AccessIdentityResult> {
  if (import.meta.env.DEV) {
    return { state: "local" };
  }

  try {
    const response = await fetch("/cdn-cgi/access/get-identity", {
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        state: "unavailable",
        message: "Не удалось получить данные рабочей учётной записи. Обновите страницу или войдите повторно.",
      };
    }

    const data = (await response.json()) as CloudflareIdentityResponse;

    if (typeof data.email !== "string" || data.email.length === 0) {
      return {
        state: "unavailable",
        message: "Не удалось получить данные рабочей учётной записи. Обновите страницу или войдите повторно.",
      };
    }

    return {
      state: "authenticated",
      identity: {
        email: data.email,
        name: typeof data.name === "string" ? data.name : undefined,
      },
    };
  } catch {
    return {
      state: "unavailable",
      message: "Не удалось получить данные рабочей учётной записи. Обновите страницу или войдите повторно.",
    };
  }
}
