import { KanjiInfo } from "../src/KanjiInfo";
import { KanjiVgLoader } from "../src/KanjiVgLoader";

export class KanjiVgLoaderTest {
    private static reader: KanjiVgLoader;
    private static info: KanjiInfo[];
    private static DEBUG = false;

    public static async getAll(): Promise<KanjiInfo[]> {
        let x = 0;
        if (KanjiVgLoaderTest.info == null) {
            KanjiVgLoaderTest.reader = new KanjiVgLoader();
            KanjiVgLoaderTest.info = await KanjiVgLoaderTest.reader.loadKanji();
        }
        return KanjiVgLoaderTest.info;
    }
}
