const FIREHACKS_HOST = "firehacks.codestarters.org";

export function getFirehacksPath(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/firehacks")) return normalized;

  if (typeof window !== "undefined" && window.location.hostname === FIREHACKS_HOST) {
    return normalized;
  }

  return normalized === "/" ? "/firehacks" : `/firehacks${normalized}`;
}
