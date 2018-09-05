import "mocha";
import { assert } from "chai";
import { KanjiList } from "../src/KanjiList";
import { MatchAlgorithm } from "../src/MatchAlgorithm";
import { KanjiVgLoaderTest } from "./KanjiVgLoader.test";
/*
import fs from "fs";
import { KanjiInfo } from "../src/KanjiInfo";
import { InputStroke } from "../src/InputStroke";
*/

describe("FuzzyComparer.test", () => {

    const DEBUG = false;

    /*
    it("testSvgInputMatch", async () => {
        const list = new KanjiList();
        const readAll = await KanjiVgLoaderTest.getAll();
        for (const kanjiInfo of readAll) {
            list.add(kanjiInfo);
        }
        list.finish();

        const svg = fs.readFileSync("./tests/yama-handwrit.svg", "utf8");
        const re = /path d="(.*?)"/g;
        let m;
        do {
            m = re.exec(svg);
            if (m) {
                console.log(m[1]);
            }
        } while (m);

        const potentialKanji = new KanjiInfo("?");
        potentialKanji.addStroke(InputStroke.fromSvgPath(""));

    });
    */

    it("testBigMatch", async () => {
        // This compares the first 5 20-stroke kanji characters against all the
        // others and checks that they match themselves. In addition to correctness
        // checking it can be used for timing comparison (increasing the limit may
        // give more stable results).
        const list = new KanjiList();
        const readAll = await KanjiVgLoaderTest.getAll();
        for (const kanjiInfo of readAll) {
            list.add(kanjiInfo);
        }
        list.finish();

        for (let strokeCount = 3; strokeCount <= 20; strokeCount++) {
            const all = list.getKanji(strokeCount);

            for (let i = 0; i < all.length && i < (DEBUG ? 100 : 5); i++) {
                const big = all[i];
                if (DEBUG) {
                    console.log(strokeCount + ":" + big.kanji);
                    if (i % 10 === 9) {
                        console.log();
                    }
                }
                const matches = list.getTopMatches(big, MatchAlgorithm.FUZZY);
                assert.equal(big.kanji, matches[0].kanjiInfo.kanji);
            }

            if (DEBUG) {
                console.log();
            }
        }
    });

});
