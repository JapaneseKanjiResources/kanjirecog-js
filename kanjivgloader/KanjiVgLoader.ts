import sax from "sax";
import fs from "fs";
import { KanjiInfo } from "../src/KanjiInfo";
import { InputStroke } from "../src/InputStroke";
import { KanjiList } from "../src/KanjiList";

const read: KanjiInfo[] = [];
const warnings: string[] = [];
const done = new Set<number>();

let current: KanjiInfo;

const warnAndHalt = false;
const strict = true;
const saxStream = sax.createStream(strict, {});

function warn(s: string) {
    warnings.push(s);
    if (warnAndHalt) {
        console.log(s);
        process.exit();
    }
}

saxStream.on("opentag", (node) => {
    if (node.name === "kanji") {
        // Clear current just in case
        current = null;

        // Note: I used the midashi attribute initially, but had problems
        // with the parser bizarrely misinterpreting some four-byte sequences.
        const id = node.attributes.id.replace("kvg:kanji_", "");
        if (id == null) {
            warn("<kanji> tag missing id=");
            return;
        }
        let codePoint;
        try {
            codePoint = KanjiInfo.parseHex(id);
        } catch (e) {
            warn("<kanji> tag invalid id= (" + id + ")" + e);
            return;
        }
        if (done.has(codePoint)) {
            warn("<kanji> duplicate id= (" + id + ")");
            return;
        } else {
            done.add(codePoint);
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
                warn("<stroke> tag in kanji " +
                    current.kanji + " missing path=, ignoring kanji");
                current = null;
                return;
            }
            try {
                const stroke = new InputStroke(path);
                current.addStroke(stroke);
            } catch (e) {
                warn("<stroke> tag in kanji " + current.kanji +
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
            read.push(current);
        }
    }
});

saxStream.on("end", () => {
    console.log("Loaded " + read.length + " kanji.");
    console.log();

    if (warnings.length > 0) {
        console.log("Warnings:");
        for (const warning of warnings) {
            console.log("\t" + warning);
        }
        console.log();
    }

    const list = new KanjiList();
    for (const kanji of read) {
        list.add(kanji);
    }

    const json = list.save();
    console.log(json);
});

fs.createReadStream("./data/kanjivg-20160426.xml")
    .pipe(saxStream)
    .on("error", (e) => {
        console.log(e);
    });
