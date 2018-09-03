import "mocha";
import { assert } from "chai";
import { KanjiList } from "../src/KanjiList";
import { KanjiInfo } from "../src/KanjiInfo";
import { InputStroke } from "../src/InputStroke";

describe("KanjiList.test", () => {

    it("testBigMatch", async () => {

        const list = new KanjiList();
        const one = new KanjiInfo("x");
        one.addStroke(InputStroke.fromFloats(0, 0, 100, 100));
        one.addStroke(InputStroke.fromFloats(100, 0, 0, 100));
        await one.finish();
        list.add(one);
        const two = new KanjiInfo("y");
        two.addStroke(InputStroke.fromFloats(0, 0, 50, 50));
        two.addStroke(InputStroke.fromFloats(100, 0, 0, 100));
        await two.finish();
        list.add(two);

        assert.equal(0, list.getKanji(1).length);

        const both = list.getKanji(2);
        assert.equal(2, both.length);
        assert.equal(one, both[0]);
        assert.equal(two, both[1]);

    });

});
