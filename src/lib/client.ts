export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let onUnauthorized = (): void => {};

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

export async function apiSend<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (response.status === 401) {
    onUnauthorized();
    throw new ApiError(401, "Phiên đăng nhập đã hết. Đăng nhập lại giúp mình.");
  }
  if (!response.ok) {
    let message = "Không thực hiện được. Thử lại giúp mình.";
    try {
      const body = (await response.json()) as { error?: unknown };
      if (typeof body.error === "string" && body.error.trim()) message = body.error;
    } catch {
      message = "Không thực hiện được. Thử lại giúp mình.";
    }
    throw new ApiError(response.status, message);
  }
  return (await response.json()) as T;
}
