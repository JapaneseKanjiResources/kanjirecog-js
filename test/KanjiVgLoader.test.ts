import { KanjiInfo } from "../src/KanjiInfo";
import { KanjiVgLoader } from "../src/KanjiVgLoader";

export class KanjiVgLoaderTest {
    private static reader: KanjiVgLoader;
    private static info: KanjiInfo[];

    public static async getAll(): Promise<KanjiInfo[]> {
        if (KanjiVgLoaderTest.info == null) {
            KanjiVgLoaderTest.reader = new KanjiVgLoader();
            KanjiVgLoaderTest.info = await KanjiVgLoaderTest.reader.loadKanji();
        }
        return KanjiVgLoaderTest.info;
    }
}
