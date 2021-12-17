#!/usr/bin/env node
import { exec } from 'child_process';
import { existsSync } from 'fs';

const root = import.meta.url
  .replace('file://', '')
  .replace('/node_modules/@spotter-app/plugin/src/link.js', '');

const indexFile = `${root}/main.js`;
  
// TODO: check if desnt't exist
if (existsSync(indexFile)) {
  exec(`open 'spotter://x-callback-url/command?type=startPluginScript&value=${indexFile}'`);
}
