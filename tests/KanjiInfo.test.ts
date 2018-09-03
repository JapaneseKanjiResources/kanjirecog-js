import "mocha";
import { assert } from "chai";
import { KanjiInfo } from "../src/KanjiInfo";
import { InputStroke } from "../src/InputStroke";
import { KanjiVgLoaderTest } from "./KanjiVgLoader.test";
import { MatchAlgorithm } from "../src/MatchAlgorithm";

describe("KanjiInfo.test", () => {

    it("testBasic", async () => {

        const one = new KanjiInfo("x");
        one.addStroke(InputStroke.fromFloats(0, 0, 100, 100));
        one.addStroke(InputStroke.fromFloats(100, 0, 0, 100));
        one.finish();

        assert.equal("x", one.kanji);
        assert.equal(2, one.getStrokeCount());
        assert.equal("[0,0:255,255]", one.getStroke(0).toString());
        assert.equal("[255,0:0,255]", one.getStroke(1).toString());

        assert.equal("00,00-ff,ff:ff,00-00,ff", one.getFullSummary());
    });

    it("testFullSummary", async () => {
        // Load all kanji
        let totalScore = 0;
        let totalCount = 0;
        const kanjiInfos = await KanjiVgLoaderTest.getAll();

        assert.isNotEmpty(kanjiInfos);

        for (const kanjiInfo of kanjiInfos) {
            // Get the summary string, and make a new kanji with it
            const loaded = KanjiInfo.fromFull(kanjiInfo.kanji, kanjiInfo.getFullSummary());

            // Check the directions are basically the same (may be slight differences
            // because rounding could push the '<0.1' type comparisons either way)
            const matchScore = loaded.getMatchScore(kanjiInfo, MatchAlgorithm.STRICT);

            assert.isTrue(matchScore > 94, "matchScore = " + matchScore);
            totalScore += matchScore;
            totalCount++;
        }

        // Check on average the similarity was extremely high
        assert.isTrue(totalScore / totalCount > 99, "totalScore / totalCount = " + totalScore / totalCount);
    });

    it("testGetTwoDigitHexInt", () => {
        assert.equal(0, KanjiInfo.getTwoDigitHexInt("00", 0));
        assert.equal(1, KanjiInfo.getTwoDigitHexInt("01", 0));
        assert.equal(16, KanjiInfo.getTwoDigitHexInt("10", 0));
        assert.equal(9 * 16 + 9, KanjiInfo.getTwoDigitHexInt("99", 0));
        assert.equal(255, KanjiInfo.getTwoDigitHexInt("ff", 0));
        assert.equal(9 * 16 + 9, KanjiInfo.getTwoDigitHexInt("blah99blah", 4));
    });

});
