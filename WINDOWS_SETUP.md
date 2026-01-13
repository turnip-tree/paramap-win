# Windows環境でのセットアップ

ElectronアプリケーションはGUIアプリケーションのため、Windows環境で直接開発・ビルドすることを推奨します。

## 必要な環境

- Windows 10/11
- Node.js 18以上
- npm または yarn

## セットアップ手順

### 1. Node.jsのインストール

[Node.js公式サイト](https://nodejs.org/)からLTS版をダウンロードしてインストールしてください。

### 2. プロジェクトのクローン/ダウンロード

プロジェクトをWindows環境にコピーします。

### 3. 依存関係のインストール

```powershell
npm install
```

### 4. 開発モードで起動

```powershell
npm run dev
```

これで以下が起動します：
- Vite開発サーバー（http://localhost:5173）
- Electronアプリケーション

## ビルド

### Windows用インストーラーの作成

```powershell
npm run dist:win
```

インストーラーは `release` ディレクトリに生成されます：
- `MyBatis SQL Log Visualizer Setup 1.0.0.exe` (NSISインストーラー)
- `MyBatis SQL Log Visualizer 1.0.0.exe` (Portable版)

### Portable版のみ作成

```powershell
npm run dist:win:portable
```

## Dockerコンテナを使う場合

Dockerコンテナ内ではElectronアプリは動作しませんが、Webアプリケーション部分の開発には使用できます：

```bash
docker-compose up
```

ただし、Electronのビルドや実行はWindows環境で直接行う必要があります。

## トラブルシューティング

### ポート5173が既に使用されている場合

`package.json`の`dev:vite`スクリプトでポートを変更できます：

```json
"dev:vite": "vite --port 3000"
```

### Electronが起動しない場合

1. `electron-dist`ディレクトリが存在するか確認
2. `npm run build:electron`を実行してElectronのメインプロセスをビルド
