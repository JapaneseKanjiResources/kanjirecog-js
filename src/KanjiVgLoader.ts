import sax from "sax";
import fs from "fs";
import pako from "pako";
import { KanjiInfo } from "./KanjiInfo";
import { InputStroke } from "./InputStroke";
import { KanjiList } from "./KanjiList";

export class KanjiVgLoader {

    constructor(readonly path: string = "./data/kanjivg-20160426.xml") { }

    public readonly read: KanjiInfo[] = [];
    public readonly warnings: string[] = [];
    public readonly done = new Set<number>();
    private readonly warnAndHalt = false;

    private warn(s: string) {
        this.warnings.push(s);
        if (this.warnAndHalt) {
            console.log(s);
            process.exit();
        }
    }

    public async loadKanji(): Promise < KanjiInfo[] > {
        let current: KanjiInfo;

        const strict = true;
        const saxStream = sax.createStream(strict, {});

        saxStream.on("opentag", (node) => {
            if (node.name === "kanji") {
                // Clear current just in case
                current = null;

                // Note: I used the midashi attribute initially, but had problems
                // with the parser bizarrely misinterpreting some four-byte sequences.
                const id = node.attributes.id.replace("kvg:kanji_", "");
                if (id == null) {
                    this.warn("<kanji> tag missing id=");
                    return;
                }
                let codePoint;
                try {
                    codePoint = KanjiInfo.parseHex(id);
                } catch (e) {
                    this.warn("<kanji> tag invalid id= (" + id + ")" + e);
                    return;
                }
                if (this.done.has(codePoint)) {
                    this.warn("<kanji> duplicate id= (" + id + ")");
                    return;
                } else {
                    this.done.add(codePoint);
                }
                // Check if code point is actually a CJK ideograph
                const kanjiString = String.fromCharCode(codePoint);
                if ((codePoint >= 0x4e00 && codePoint <= 0x9fff)
                    || (codePoint >= 0x3400 && codePoint <= 0x4dff)
                    || (codePoint >= 0x20000 && codePoint <= 0x2a6df)
                    || (codePoint >= 0xf900 && codePoint <= 0xfaff)
                    || (codePoint >= 0x2f800 && codePoint <= 0x2fa1f)) {
                    current = new KanjiInfo(kanjiString);
                } else {
                    // Ignore non-kanji characters
                    return;
                }
            } else if (node.name === "path") {
                if (current != null) {
                    const path = node.attributes.d;
                    if (path == null) {
                        this.warn("<stroke> tag in kanji " +
                            current.kanji + " missing path=, ignoring kanji");
                        current = null;
                        return;
                    }
                    try {
                        const stroke = InputStroke.fromSvgPath(path);
                        current.addStroke(stroke);
                    } catch (e) {
                        this.warn("<stroke> tag in kanji " + current.kanji +
                            " invalid path= (" + path + "): " + e);
                        current = null;
                        return;
                    }
                }
            }
        });

        saxStream.on("closetag", (tag) => {
            if (tag === "kanji") {
                if (current != null) {
                    current.finish();
                    this.read.push(current);
                }
            }
        });

        let saxStreamEnded = (): void => { throw new Error(); };

        saxStream.on("end", () => {

            saxStreamEnded();
        });

        return new Promise<KanjiInfo[]>((resolve, reject) => {

            saxStreamEnded = () => {
                resolve(this.read);
            };

            fs.createReadStream(this.path)
                .pipe(saxStream)
                .on("error", (e) => {
                    reject(e);
                });
        });
    }
}

const isMain = (typeof require !== "undefined" && require.main === module);

if (isMain) {
    console.log("KanjiVgLoader");

    const loader = new KanjiVgLoader();
    loader.loadKanji()
        .then(() => {
            console.log("Loaded " + loader.read.length + " kanji.");
            console.log();

            if (loader.warnings.length > 0) {
                console.log("Warnings:");
                for (const warning of loader.warnings) {
                    console.log("\t" + warning);
                }
                console.log();
            }

            const list = new KanjiList();
            for (const kanji of loader.read) {
                list.add(kanji);
            }
            list.finish();

            const dtos = list.save();
            const json = JSON.stringify(dtos);
            const buffer = pako.deflate(json, { level: 5 });
            console.log(json.length);

            const datPath = "./data/strokes.dat";

            const ws = fs.createWriteStream(datPath);
            ws.write(buffer);
            ws.end();

            fs.readFile(datPath, (err, data) => {
                const ungzipped = pako.inflate(buffer);
                console.log(ungzipped.length);
            });
        });
}
