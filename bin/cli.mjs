#!/usr/bin/env node
// npx github:bvminh-dev/my-port -> start the app on localhost and open the browser.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");

const isFree = (port) =>
  new Promise((resolve) => {
    const s = createServer()
      .once("error", () => resolve(false))
      .once("listening", () => s.close(() => resolve(true)))
      .listen(port, "127.0.0.1");
  });

let port = Number(process.env.PORT) || 3300;
while (!(await isFree(port))) port++;

const url = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)], {
  cwd: root,
  stdio: "inherit",
});
server.on("exit", (code) => process.exit(code ?? 0));
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => server.kill(sig));

// wait until the server answers, then open the browser
for (let i = 0; i < 100; i++) {
  if (await fetch(url).then(() => true, () => false)) break;
  await new Promise((r) => setTimeout(r, 300));
}
const [cmd, args] =
  process.platform === "darwin" ? ["open", [url]]
  : process.platform === "win32" ? ["cmd", ["/c", "start", "", url]]
  : ["xdg-open", [url]];
spawn(cmd, args, { stdio: "ignore", detached: true }).on("error", () => console.log(`Open ${url}`)).unref();
