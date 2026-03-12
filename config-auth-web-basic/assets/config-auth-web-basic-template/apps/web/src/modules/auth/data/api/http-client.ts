const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000";

type QueryValue = string | number | boolean | null | undefined;

type RequestOptions = Omit<RequestInit, "body"> & {
  token?: string;
  body?: unknown;
  query?: Record<string, QueryValue>;
};

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(path, API_BASE_URL);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined;
  }

  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function isJsonBody(body: unknown): boolean {
  if (body === undefined || body === null) {
    return false;
  }

  return !(body instanceof FormData);
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  if (isJsonBody(options.body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path, options.query), {
    ...options,
    headers,
    cache: "no-store",
    body: isJsonBody(options.body)
      ? JSON.stringify(options.body)
      : (options.body as BodyInit | null | undefined),
  });

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const errorData =
      typeof data === "object" && data !== null
        ? data
        : { message: `Request failed with status ${response.status}` };

    throw {
      response: {
        status: response.status,
        data: errorData,
      },
      ...(typeof errorData === "object" && errorData !== null ? errorData : {}),
    };
  }

  return (data as T) ?? (undefined as T);
}
