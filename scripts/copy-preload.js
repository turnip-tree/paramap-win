import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const preloadTsPath = join(__dirname, '../electron/preload.ts');
const preloadJsPath = join(__dirname, '../electron-dist/preload.js');

try {
  // electron-distディレクトリが存在しない場合は作成
  const electronDistDir = join(__dirname, '../electron-dist');
  mkdirSync(electronDistDir, { recursive: true });

  // preload.tsを読み込む（すでにCommonJS形式なのでそのままコピー）
  const preloadContent = readFileSync(preloadTsPath, 'utf-8');
  
  // .ts拡張子を削除して.jsとして保存
  writeFileSync(preloadJsPath, preloadContent);
  console.log('Preload file copied successfully');
} catch (error) {
  console.error('Error copying preload file:', error);
  process.exit(1);
}
