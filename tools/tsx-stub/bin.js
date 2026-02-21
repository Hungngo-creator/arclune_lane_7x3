#!/usr/bin/env node
/**
 * Minimal offline-friendly replacement for the `tsx` CLI.
 * The goal is to keep the local developer experience functional
 * even when we cannot download the real package from npm.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

function printHelp() {
  const helpText = `tsx v4.7.1 (offline stub)\n\n` +
    `Usage:\n` +
    `  tsx [options] <script> [-- <args>]\n` +
    `  tsx watch <script> [-- <args>]\n\n` +
    `Options:\n` +
    `  -h, --help    Hiển thị hướng dẫn\n` +
    `  -v, --version Hiển thị phiên bản\n` +
    `\n` +
    `Lệnh:\n` +
    `  watch         Chạy Node.js ở chế độ theo dõi (sử dụng --watch)\n`;
  console.log(helpText);
}

function printVersion() {
  console.log('4.7.1');
}

function resolveEntry(raw) {
  const candidate = raw || '';
  if (!candidate) {
    console.error('Lỗi: thiếu đường dẫn tập tin cần chạy.');
    process.exitCode = 1;
    return null;
  }

  const abs = path.resolve(candidate);
  if (!fs.existsSync(abs)) {
    console.error(`Lỗi: không tìm thấy tập tin "${candidate}".`);
    process.exitCode = 1;
    return null;
  }
  return abs;
}

function runNode(entry, scriptArgs, { watch }) {
  const loaderPath = path.resolve(__dirname, 'loader.mjs');
  const loaderUrl = pathToFileURL(loaderPath).href;
  const nodeArgs = [];
  if (watch) {
    nodeArgs.push('--watch');
  }
  nodeArgs.push('--loader', loaderUrl);
  nodeArgs.push(entry, ...scriptArgs);

  const child = spawn(process.execPath, nodeArgs, {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

function main() {
  const args = process.argv.slice(2);
  const envEntry = process.env.APP_ENTRY;

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }
  if (args.includes('--version') || args.includes('-v')) {
    printVersion();
    return;
  }

  if (args.length === 0 && envEntry) {
    const resolved = resolveEntry(envEntry);
    if (!resolved) {
      return;
    }
    runNode(resolved, [], { watch: false });
    return;
  }

  if (args.length === 0) {
    printHelp();
    return;
  }

  if (args[0] === 'watch') {
    const watchArgs = args.slice(1);
    const entryArgIndex = watchArgs.findIndex((value) => value === '--');
    const entryPath = watchArgs[0] || envEntry;
    const scriptArgs = entryArgIndex >= 0 ? watchArgs.slice(entryArgIndex + 1) : watchArgs.slice(1);

    const resolved = resolveEntry(entryPath);
    if (!resolved) {
      return;
    }

    console.log(`tsx (stub): đang chạy chế độ theo dõi với tập tin ${resolved}`);
    runNode(resolved, scriptArgs, { watch: true });
    return;
  }

  const runArgs = args;
  const entryArgIndex = runArgs.findIndex((value) => value === '--');
  const entryPath = runArgs[0] || envEntry;
  const scriptArgs = entryArgIndex >= 0 ? runArgs.slice(entryArgIndex + 1) : runArgs.slice(1);
  const resolved = resolveEntry(entryPath);
  if (!resolved) {
    return;
  }

  runNode(resolved, scriptArgs, { watch: false });
}

main();
