const http = require('http');
const { spawn } = require('child_process');

async function main() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const tempProfile = process.env.TEMP + "\\kage_cdp_profile";
  
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9222",
    `--user-data-dir=${tempProfile}`,
    "http://localhost:5173/"
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabsRes = await fetch('http://localhost:9222/json');
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

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log(`[BROWSER CONSOLE ${data.params.type.toUpperCase()}]`, data.params.args.map(a => a.value || a.description).join(' '));
      } else if (data.method === 'Runtime.exceptionThrown') {
        console.error('[BROWSER EXCEPTION]', data.params.exceptionDetails);
      }
    });

    await send('Runtime.enable');
    await send('Console.enable');
    await send('Page.enable');

    console.log("Waiting for page load...");
    await new Promise(r => setTimeout(r, 3000));

    // Evaluate iframe content and console
    const res = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const iframe = document.querySelector('iframe');
          if (!iframe) return { error: 'No iframe' };
          const doc = iframe.contentDocument;
          if (!doc) return { error: 'No contentDocument (sandbox?)' };
          return {
            title: doc.title,
            errors: window.__kage ? window.__kage.error : null,
            bodyClass: doc.body.className,
            cardsCount: doc.querySelectorAll('.cards .card').length,
            buttonExists: !!doc.getElementById('scene-return-btn')
          };
        })()
      `,
      returnByValue: true
    });

    console.log("IFRAME EVAL RESULT:", JSON.stringify(res, null, 2));

    // Try clicking Moonwater card
    console.log("Attempting to click Moonwater card...");
    const clickRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const iframe = document.querySelector('iframe');
          const doc = iframe.contentDocument;
          const card = doc.querySelectorAll('.cards .card')[2];
          if (!card) return 'Card not found';
          card.click();
          return {
            clicked: true,
            inSceneMode: doc.body.classList.contains('in-scene-mode'),
            returnHudDisplay: getComputedStyle(doc.getElementById('scene-return-hud')).opacity
          };
        })()
      `,
      returnByValue: true
    });

    console.log("CLICK RESULT:", JSON.stringify(clickRes, null, 2));

    await new Promise(r => setTimeout(r, 2000));

    ws.close();
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    proc.kill();
  }
}

main();
