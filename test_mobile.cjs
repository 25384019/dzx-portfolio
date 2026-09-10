const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function main() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const tempProfile = process.env.TEMP + "\\dzx_cdp_mobile_" + Date.now();
  
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9245",
    `--user-data-dir=${tempProfile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:5173/"
  ]);

  await new Promise(r => setTimeout(r, 2800));

  try {
    const tabsRes = await fetch('http://localhost:9245/json');
    const tabs = await tabsRes.json();
    const pageTab = tabs.find(t => t.url.includes('5173') && t.webSocketDebuggerUrl);
    if (!pageTab) return;

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.onopen = resolve);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === msgId) {
            ws.removeEventListener('message', handler);
            resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');
    // Emulate iPhone (390 x 844)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    await new Promise(r => setTimeout(r, 2200));

    const ssMobile = await send('Page.captureScreenshot', { format: 'png' });
    if (ssMobile && ssMobile.data) {
      fs.writeFileSync('dzx_mobile_screenshot.png', Buffer.from(ssMobile.data, 'base64'));
      console.log("Saved dzx_mobile_screenshot.png successfully!");
    }

    ws.close();
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    proc.kill();
  }
}

main();
