// Cross-origin settings for the public API.
export function applyCors(req: Request, headers: Headers): void {
  const origin = req.headers.get("origin") ?? "*";
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
}
