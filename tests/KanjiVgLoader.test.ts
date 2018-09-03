import "mocha";
import { assert } from "chai";
import { KanjiInfo } from "../src/KanjiInfo";
import { KanjiVgLoader } from "../kanjivgloader/KanjiVgLoader";
import { InputStroke } from "../src/InputStroke";

export class KanjiVgLoaderTest {
    private static reader: KanjiVgLoader;
    private static info: KanjiInfo[];
    private static DEBUG = false;

    public static async getAll(): Promise<KanjiInfo[]> {
        if (KanjiVgLoaderTest.info == null) {
            KanjiVgLoaderTest.reader = new KanjiVgLoader();
            KanjiVgLoaderTest.info = await KanjiVgLoaderTest.reader.loadKanji();
        }
        return KanjiVgLoaderTest.info;
    }
}
