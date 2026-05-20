export function isDeveloperMode(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.get("dev") === "1" || params.get("mode") === "dev";
}
