const path = require('path');
const express = require('express');
const fs = require('fs');
const { spawn } = require('child_process');
const kuromoji = require('kuromoji');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const ROOT = __dirname;
const WINE_DIR = path.join(ROOT, 'wine');
const AQUESTALK_ROOT = path.join(ROOT, 'AquesTalk');
const SYNTH_EXE = path.join(WINE_DIR, 'synth.exe');

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

function cleanWineDir() {
    fs.readdir(WINE_DIR, (err, files) => {
        if (err) return console.error('cleanWineDir error:', err);
        for (const file of files) {
            const filePath = path.join(WINE_DIR, file);
            if (fs.lstatSync(filePath).isFile() && file.endsWith('.wav')) {
                fs.unlink(filePath, err => {
                    if (err) console.error('delete error:', err);
                });
            }
        }
    });
}

// 30分ごとに自動削除
setInterval(cleanWineDir, 30 * 60 * 1000);

// プロセス終了時にも削除
process.on('exit', cleanWineDir);
process.on('SIGINT', () => { process.exit(); });
process.on('SIGTERM', () => { process.exit(); });

app.post('/synth', async (req, res) => {
    try {
        const { text, voice = 'f1', speed = 100 } = req.body;
        if (!text) return res.status(400).send('text required');

        const hira = await toHiragana(text);
        const wavName = `out_${Date.now()}.wav`;
        const wavPath = path.join(WINE_DIR, wavName);

        fs.copyFileSync(
            path.join(AQUESTALK_ROOT, voice, 'AquesTalk.dll'),
            path.join(WINE_DIR, 'AquesTalk.dll')
        );

        const p = spawn('wine', [
            'synth.exe',
            hira,
            String(speed),
            wavName
        ], {
            cwd: WINE_DIR,
            env: { ...process.env, WINEDEBUG: '-all' }
        });

        p.on('error', err => {
            console.error('wine spawn error:', err);
            res.status(500).send('wine spawn error');
        });

        p.on('close', code => {
            if (code !== 0) {
                console.error('synth exited with code', code);
                return res.status(500).send('synth failed');
            }

            const start = Date.now();
            const wait = setInterval(() => {
                if (fs.existsSync(wavPath)) {
                    clearInterval(wait);
                    return res.sendFile(wavPath);
                }

                if (Date.now() - start > 2000) {
                    clearInterval(wait);
                    console.error('wav not generated');
                    return res.status(500).send('wav not generated');
                }
            }, 50);
        });

    } catch (e) {
        console.error(e);
        res.status(500).send('internal error');
    }
});

app.listen(3000, () => {
    console.log('AquesTalk Web ready http://localhost:3000');
});