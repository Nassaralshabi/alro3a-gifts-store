import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";

const port = 9229;
const output = "/home/ubuntu/alro3a-gifts-store/docs/hero-carousel-browser-verification.json";
const chrome = spawn("chromium", ["--headless", "--no-sandbox", "--disable-gpu", `--remote-debugging-port=${port}`, "about:blank"], { stdio: "ignore" });
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function waitForDebugger() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const version = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (version.ok) return version.json();
    } catch {
      // Chrome is still starting.
    }
    await wait(200);
  }
  throw new Error("Chrome DevTools did not start");
}

function connect(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  let commandId = 0;
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    const handler = pending.get(message.id);
    if (handler) {
      pending.delete(message.id);
      handler(message);
    }
  });
  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve({
      send(method, params = {}) {
        const id = ++commandId;
        socket.send(JSON.stringify({ id, method, params }));
        return new Promise((resolveCommand, rejectCommand) => {
          pending.set(id, message => message.error ? rejectCommand(new Error(message.error.message)) : resolveCommand(message.result));
        });
      },
      close() { socket.close(); },
    }));
    socket.addEventListener("error", reject, { once: true });
  });
}

const version = await waitForDebugger();
const browser = await connect(version.webSocketDebuggerUrl);
const created = await browser.send("Target.createTarget", { url: "http://127.0.0.1:3000/" });
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = await connect(targets.find(target => target.id === created.targetId).webSocketDebuggerUrl);

async function evaluate(expression) {
  const result = await page.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return result.result.value;
}

for (let attempt = 0; attempt < 30; attempt += 1) {
  const tabs = await evaluate("document.querySelectorAll('[role=tab]').length");
  if (tabs >= 2) break;
  await wait(200);
}

const activeLabel = () => evaluate("document.querySelector('[role=tab][aria-selected=\"true\"]')?.getAttribute('aria-label')");
const click = label => evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.getAttribute('aria-label') === ${JSON.stringify(label)})?.click()`);
const initial = await activeLabel();
await click("الصورة التالية");
await wait(100);
const afterNext = await activeLabel();
await click("الصورة السابقة");
await wait(100);
const afterPrevious = await activeLabel();
await click("إيقاف العرض");
await wait(5200);
const afterPause = await activeLabel();
await click("تشغيل العرض");
await wait(5200);
const afterResume = await activeLabel();

const result = { initial, afterNext, afterPrevious, afterPause, afterResume, passed: initial !== afterNext && afterPrevious === initial && afterPause === initial && afterResume !== afterPause };
await writeFile(output, JSON.stringify(result, null, 2));
page.close();
browser.close();
chrome.kill();
console.log(JSON.stringify(result));
if (!result.passed) process.exitCode = 1;
