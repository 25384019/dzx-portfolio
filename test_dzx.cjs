const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function main() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const tempProfile = process.env.TEMP + "\\dzx_cdp_profile_" + Date.now();
  
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9223",
    `--user-data-dir=${tempProfile}`,
    "http://localhost:5173/"
  ]);

  await new Promise(r => setTimeout(r, 2200));

  try {
    const tabsRes = await fetch('http://localhost:9223/json');
    const tabs = await tabsRes.json();
    const pageTab = tabs.find(t => t.url.includes('5173') && t.webSocketDebuggerUrl);
    if (!pageTab) {
      console.log("No page tab found!", tabs);
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

    const consoleMessages = [];
    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        const text = data.params.args.map(a => a.value || a.description).join(' ');
        consoleMessages.push(`[${data.params.type.toUpperCase()}] ${text}`);
        console.log(`[BROWSER CONSOLE]`, text);
      } else if (data.method === 'Runtime.exceptionThrown') {
        console.error('[BROWSER EXCEPTION]', data.params.exceptionDetails);
      }
    });

    await send('Runtime.enable');
    await send('Console.enable');
    await send('Page.enable');

    console.log("Waiting 3.5s for WebGL scene initialization...");
    await new Promise(r => setTimeout(r, 3500));

    // 1. Evaluate DZX DOM and WebGL canvas
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const canvas = document.querySelector('.dzx-webgl-canvas');
          const title = document.querySelector('h1')?.innerText;
          const chapters = document.querySelectorAll('.dzx-section').length;
          const nav = !!document.querySelector('.dzx-nav');
          const mediaCard = !!document.querySelector('.dzx-media-card');
          const exploreBtn = !!document.querySelector('button');
          return {
            canvasExists: !!canvas,
            canvasWidth: canvas?.width,
            canvasHeight: canvas?.height,
            h1Text: title,
            sectionsCount: chapters,
            navExists: nav,
            mediaCardExists: mediaCard,
          };
        })()
      `,
      returnByValue: true
    });

    console.log("DZX DOM & WEBGL STATUS:", JSON.stringify(evalRes, null, 2));

    // 2. Capture Screenshot of Home
    console.log("Capturing 1440x900 screenshot...");
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 800));

    const ss1 = await send('Page.captureScreenshot', { format: 'png' });
    if (ss1 && ss1.data) {
      fs.writeFileSync('dzx_home_screenshot.png', Buffer.from(ss1.data, 'base64'));
      console.log("Saved dzx_home_screenshot.png successfully!");
    }

    // 3. Test Clicking XiaoZhaiOS EXPLORE Portal button
    console.log("Testing clicking XiaoZhaiOS EXPLORE button...");
    const clickExplore = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const exploreBtn = buttons.find(b => b.innerText.includes('EXPLORE'));
          if (!exploreBtn) return { error: 'Explore button not found', allButtons: buttons.map(b => b.innerText) };
          exploreBtn.click();
          return {
            clicked: true,
            inPortalMode: document.body.classList.contains('in-portal-mode'),
          };
        })()
      `,
      returnByValue: true
    });
    console.log("CLICK EXPLORE RESULT:", JSON.stringify(clickExplore, null, 2));

    // Wait 2 seconds for flight into portal
    await new Promise(r => setTimeout(r, 2000));

    // Capture Portal Screenshot
    const ss2 = await send('Page.captureScreenshot', { format: 'png' });
    if (ss2 && ss2.data) {
      fs.writeFileSync('dzx_portal_screenshot.png', Buffer.from(ss2.data, 'base64'));
      console.log("Saved dzx_portal_screenshot.png successfully!");
    }

    // 4. Test Pressing ESC to return
    console.log("Testing ESC return...");
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });

    await new Promise(r => setTimeout(r, 2200));

    const exitRes = await send('Runtime.evaluate', {
      expression: `
        (() => ({
          inPortalMode: document.body.classList.contains('in-portal-mode'),
          topHudOpacity: getComputedStyle(document.querySelector('.dzx-portal-top-hud')).opacity
        }))()
      `,
      returnByValue: true
    });
    console.log("EXIT PORTAL RESULT:", JSON.stringify(exitRes, null, 2));

    ws.close();
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    proc.kill();
  }
}

main();
