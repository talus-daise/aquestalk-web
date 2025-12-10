const path = require('path');
const express = require('express');
const fs = require('fs');
const axios = require('axios');  // HTTP リクエスト用
const kuromoji = require('kuromoji');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const ROOT = __dirname;
const VOICES = ['f1', 'f2', 'm1', 'm2', 'r1', 'imd1', 'jgr', 'dvd'];

// ===== kuromoji =====
const tokenizerPromise = new Promise((resolve, reject) => {
    kuromoji.builder({
        dicPath: path.join(ROOT, 'node_modules/kuromoji/dict')
    }).build((err, tokenizer) => {
        if (err) reject(err);
        else resolve(tokenizer);
    });
});

function kataToHira(s) {
    return s.replace(/[ァ-ヶ]/g, c =>
        String.fromCharCode(c.charCodeAt(0) - 0x60)
    );
}

async function toHiragana(text) {
    const tokenizer = await tokenizerPromise;
    return tokenizer.tokenize(text).map(t =>
        t.reading ? kataToHira(t.reading) : t.surface_form
    ).join('');
}

// ===== synth endpoint =====
app.post('/synth', async (req, res) => {
    try {
        const { text, voice = 'f1', speed = 100 } = req.body;
        if (!text) return res.status(400).send('text required');

        const hira = await toHiragana(text);

        // WAV 保存先
        const wavName = `out_${Date.now()}.wav`;
        const wavPath = path.join(ROOT, wavName);

        // Lqm1/aquestalk-server にリクエスト
        const serverUrl = 'http://localhost:50021/speech'; // 起動済みの acestalk-server を想定
        const response = await axios.post(serverUrl, {
            text: hira,
            voice,
            speed
        }, { responseType: 'arraybuffer' });

        fs.writeFileSync(wavPath, Buffer.from(response.data));

        res.sendFile(wavPath, err => {
            if (err) console.error(err);
            fs.unlink(wavPath, () => { }); // 配信後に削除
        });

    } catch (e) {
        console.error(e);
        if (!res.headersSent) res.status(500).send('TTS error');
    }
});

app.listen(3000, () => {
    console.log('AquesTalk Web ready http://localhost:3000');
});