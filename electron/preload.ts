import { contextBridge } from 'electron';

// セキュアな方法でレンダラープロセスにAPIを公開
contextBridge.exposeInMainWorld('electronAPI', {
  // 必要に応じてAPIを追加
  platform: process.platform,
});
