const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function main() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const tempProfile = process.env.TEMP + "\\dzx_cdp_profile_chapters_" + Date.now();
  
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9239",
    `--user-data-dir=${tempProfile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:5173/"
  ]);

  await new Promise(r => setTimeout(r, 2800));

  try {
    const tabsRes = await fetch('http://localhost:9239/json');
    const tabs = await tabsRes.json();
    console.log("Connected to Chrome, tabs:", tabs.map(t => t.url));
    const pageTab = tabs.find(t => t.url.includes('5173') && t.webSocketDebuggerUrl);
    if (!pageTab) {
      console.error("No matching page tab found!");
      return;
    }

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
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await new Promise(r => setTimeout(r, 2500));

    // Scroll to 01 ABOUT
    console.log("Scrolling to Chapter 01 ABOUT...");
    await send('Runtime.evaluate', {
      expression: `document.getElementById('ch-01').scrollIntoView({ behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 1200));

    const ssAbout = await send('Page.captureScreenshot', { format: 'png' });
    if (ssAbout && ssAbout.data) {
      fs.writeFileSync('dzx_about_screenshot.png', Buffer.from(ssAbout.data, 'base64'));
      console.log("Saved dzx_about_screenshot.png");
    }

    // Scroll to 02 PROJECTS
    console.log("Scrolling to Chapter 02 PROJECTS...");
    await send('Runtime.evaluate', {
      expression: `document.getElementById('ch-02').scrollIntoView({ behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 1200));

    const ssProjects = await send('Page.captureScreenshot', { format: 'png' });
    if (ssProjects && ssProjects.data) {
      fs.writeFileSync('dzx_projects_screenshot.png', Buffer.from(ssProjects.data, 'base64'));
      console.log("Saved dzx_projects_screenshot.png");
    }

    ws.close();
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    proc.kill();
  }
}

main();
