const { spawn, execFile } = require('node:child_process');
const path = require('node:path');

const RDC_ENTRY = path.join(
  __dirname,
  'node_modules',
  '@wonderwhy-er',
  'desktop-commander',
  'dist',
  'index.js'
);
const RESTART_DELAY_MS = 3000;
const KILL_WAIT_MS = 1500;
const DISCONNECT_ERROR = new RegExp(
  String.raw`Error executing tool [^\r\n]+:\s*(?:Error:\s*)?Not` + ' connected',
  'i'
);

let child = null;
let stopping = false;
let restartTimer = null;
let restartReason = '';
let outputTail = '';

function scheduleRestart(reason) {
  if (stopping || restartTimer) return;
  console.log(`\n[watcher] ${reason}`);
  console.log(`[watcher] Restarting in ${RESTART_DELAY_MS / 1000} seconds...\n`);
  restartTimer = setTimeout(() => {
    restartTimer = null;
    startRemote();
  }, RESTART_DELAY_MS);
}

function handleOutput(data, target) {
  target.write(data);
  const combined = outputTail + data.toString('utf8');
  outputTail = combined.slice(-2048);

  if (DISCONNECT_ERROR.test(combined)) {
    requestRestart('Detected internal Desktop Commander disconnect');
  }
}

function requestRestart(reason) {
  if (stopping || restartReason) return;
  restartReason = reason;
  console.error(`\n[watcher] ${reason}. Restarting Remote Desktop Commander...`);

  const pid = child?.pid;
  if (!pid) {
    restartReason = '';
    scheduleRestart(reason);
    return;
  }

  execFile(
    'taskkill',
    ['/PID', String(pid), '/T', '/F'],
    { windowsHide: true },
    (error) => {
      if (error) {
        console.error(`[watcher] taskkill failed: ${error.message}`);
        try { child?.kill(); } catch {}
      }
    }
  );

  setTimeout(() => {
    if (child?.pid === pid) {
      try { child.kill(); } catch {}
    }
  }, KILL_WAIT_MS).unref();
}

function startRemote() {
  if (stopping) return;
  outputTail = '';
  console.log('[watcher] Starting Remote Desktop Commander...');

  child = spawn(process.execPath, [RDC_ENTRY, 'remote'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    windowsHide: false,
    env: process.env
  });

  child.stdout.on('data', (data) => handleOutput(data, process.stdout));
  child.stderr.on('data', (data) => handleOutput(data, process.stderr));

  child.on('error', (error) => {
    console.error(`[watcher] Launcher error: ${error.message}`);
    requestRestart('Launcher error');
  });

  child.on('exit', (code, signal) => {
    const reason = restartReason ||
      `Remote process exited (code=${code}, signal=${signal})`;
    child = null;
    restartReason = '';
    if (!stopping) scheduleRestart(reason);
  });
}

function stopWatcher() {
  if (stopping) return;
  stopping = true;
  if (restartTimer) clearTimeout(restartTimer);

  const pid = child?.pid;
  if (!pid) process.exit(0);

  console.log('\n[watcher] Stopping...');
  execFile('taskkill', ['/PID', String(pid), '/T', '/F'], { windowsHide: true }, () => {
    process.exit(0);
  });

  setTimeout(() => process.exit(0), 2000).unref();
}

process.on('SIGINT', stopWatcher);
process.on('SIGTERM', stopWatcher);
process.on('uncaughtException', (error) => {
  console.error(`[watcher] Uncaught exception: ${error.stack || error.message}`);
  process.exit(1);
});
process.on('unhandledRejection', (error) => {
  console.error(`[watcher] Unhandled rejection: ${error?.stack || error}`);
  process.exit(1);
});

console.log('[watcher] Auto-recovery enabled. Close this window to stop.');
startRemote();
