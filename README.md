# MyBatis SQL Log Visualizer

MyBatisのJDBCログ（Preparing / Parameters）を可視化するElectronアプリケーションです。

## 機能

- MyBatisログからSQLを自動抽出
- パラメータをSQLにバインドして実行可能なSQLを表示
- パラメータマッピングテーブルでプレースホルダーと値の対応を可視化
- 複数の表示モード（All、SQL Only、Executable SQL、Parameter Table）

## 開発環境のセットアップ

### Windows環境（推奨）

ElectronアプリケーションはGUIアプリケーションのため、**Windows環境で直接開発することを強く推奨**します。

詳細は [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) を参照してください。

**クイックスタート：**

```powershell
# 依存関係のインストール
npm install

# 開発モードで起動
npm run dev

# Windows用インストーラーの作成
npm run dist:win
```

### Linux/WSL環境

Linux/WSL環境では、Windows用インストーラーの作成に制限があります。詳細は [BUILD.md](./BUILD.md) を参照してください。

**開発モード：**

```bash
npm install
npm run dev
```

**注意**: WSL2環境では、Windows用インストーラーの作成にはwineが必要です。Portable版の作成も試せますが、Windows環境でのビルドを推奨します。

### ビルド

#### アプリケーションのビルド

```bash
npm run build
```

#### Windows用インストーラーの作成

```bash
npm run dist:win
```

インストーラーは `release` ディレクトリに生成されます。

## 使い方

1. アプリケーションを起動
2. テキストエリアにMyBatisのJDBCログを貼り付け
3. 「Convert」ボタンをクリック
4. 結果を確認（表示モードを切り替え可能）

### ログ形式の例

```
==>  Preparing: select * from users where id = ? and status = ?
==> Parameters: 10(Integer), 'ACTIVE'(String)
```

## プロジェクト構造

```
├── electron/          # Electronメインプロセス
│   ├── main.ts       # メインプロセス
│   └── preload.ts    # プリロードスクリプト
├── src/              # アプリケーションソースコード
│   ├── components/   # Reactコンポーネント
│   ├── hooks/        # カスタムフック
│   ├── utils/        # ユーティリティ関数
│   ├── parser.ts     # MyBatisログパーサー
│   └── types.ts      # 型定義
├── scripts/          # ビルドスクリプト
└── dist/             # ビルド出力（生成される）
```

## 技術スタック

- **SolidJS** - UIフレームワーク
- **Vite** - ビルドツール
- **Electron** - デスクトップアプリケーションフレームワーク
- **TypeScript** - 型安全性

## ライセンス

MIT
