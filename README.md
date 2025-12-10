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

### (いらないと思うけど)Cコンパイラ
```bash
sudo apt update
sudo apt install mingw-w64
i686-w64-mingw32-gcc synth.c -o synth.exe
```

注意：AquesTalkライブラリは32bitDLLなのでコンパイラも32bitじゃないと読み取れなくて動きません。<s>何回詰まったことか</s>

## ライセンス

本プログラムでは旧ver.のAquesTalkライブラリを使用しています。

最新版とは異なり、商用、非商用問わず無償で利用できます。

「AquesTalk」フォルダ配下のDLL等の著作権はアクエスト社に帰属します。http://www.a-quest.com/aquestalk
