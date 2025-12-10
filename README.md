# AquesTalk-web

AquesTalk を Web API で提供する音声合成サーバーです。

Linuxでの運用を想定しています。

## 必要な環境

- Node.js
- Wine（32bit）

## インストール

```bash
npm install
```

## 使い方

### サーバーの起動

```bash
node server.js
```

サーバーは `http://localhost:3000` で起動します。

### API エンドポイント

#### POST /synth

音声合成リクエストを送信します。

**リクエストボディ:**
```json
{
  "text": "合成したいテキスト",
  "voice": "f1",
  "speed": 100
}
```

**パラメータ:**
- `text` (string): 合成する日本語テキスト
- `voice` (string): 声（f1 / m1 / r1）
- `speed` (number): 速度（推奨: 50-200）

**レスポンス:**
- 成功時: WAV 形式の音声ファイル
- エラー時: エラーメッセージ

### 使用例

```javascript
const response = await fetch('http://localhost:3000/synth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'こんにちは',
    voice: 'f1',
    speed: 100
  })
});

const audio = await response.arrayBuffer();
```

## ライセンス

本プログラムでは旧ver.のAquesTalkライブラリを使用しています。

最新版とは異なり、商用、非商用問わず無償で利用できます。

また、「AqLicence.txt」に使用許諾契約書が記載されていますので、必ずご確認ください。

## リンク

- [AquesTalk公式サイト](https://www.a-quest.com/products/aquestalk.html)
- [AquesTalkライセンス情報](https://www.a-quest.com/products/aquestalk_license.html)
- [aquestalk-server](https://github.com/Lqm1/aquestalk-server/)