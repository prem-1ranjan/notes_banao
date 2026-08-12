export function requestOrigin(request: Request) {
  const host = firstHeader(request, "host") || firstHeader(request, "x-forwarded-host");
  if (!host) {
    return new URL(request.url).origin;
  }
  const protocol = firstHeader(request, "x-forwarded-proto") || new URL(request.url).protocol.replace(/:$/, "") || "http";
  return `${safeProtocol(protocol)}://${host}`;
}

export function sameHostUrl(request: Request, path: string) {
  return new URL(path, requestOrigin(request));
}

function firstHeader(request: Request, key: string) {
  const value = request.headers.get(key);
  return value ? value.split(",")[0].trim() : "";
}

function safeProtocol(value: string) {
  return value === "https" ? "https" : "http";
}
