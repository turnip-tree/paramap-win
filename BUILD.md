# ビルドガイド

## Windows用インストーラーの作成

### 方法1: Windows環境でビルド（推奨）

Windows環境で直接ビルドするのが最も簡単です：

```bash
npm install
npm run dist:win
```

インストーラーは `release` ディレクトリに生成されます。

### 方法2: WSL2環境でビルド

WSL2環境からWindows用のインストーラーを作成するには、wineが必要です：

```bash
# wineをインストール（Ubuntu/Debianの場合）
sudo apt-get update
sudo apt-get install wine64

# ビルド実行
npm run dist:win
```

**注意**: wineのインストールと設定は複雑な場合があります。

### 方法3: Portable版の作成（WSL2環境推奨）

WSL2環境では、portable版（インストーラー不要）を作成する方が簡単です：

```bash
npm run dist:win:portable
```

portable版は `release` ディレクトリに生成され、解凍して実行できます。

## Linux用AppImageの作成

```bash
npm run dist:linux
```

## 開発モード

```bash
npm run dev
```

## トラブルシューティング

### wineエラーが発生する場合

WSL2環境でWindows用インストーラーを作成する際にwineエラーが発生する場合は：

1. **Portable版を使用**: `npm run dist:win:portable`
2. **Windows環境でビルド**: Windows環境に移行してビルド
3. **wineをインストール**: 上記の方法2を参照

### コード署名エラー

開発用ビルドではコード署名は無効になっています。本番環境で配布する場合は、適切なコード署名証明書を設定してください。
