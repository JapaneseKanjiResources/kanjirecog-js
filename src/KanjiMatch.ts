import { KanjiInfo } from "./KanjiInfo";

export class KanjiMatch {
    /**
     * @param kanji Kanji
     * @param score Match score (higher is better)
     */
    constructor(readonly kanjiInfo: KanjiInfo, readonly score: number) { }

    public static compare(th: KanjiMatch, o: KanjiMatch): number {
        if (th.score > o.score) {
            return -1;
        } else if (th.score < o.score) {
            return 1;
        } else {
            return KanjiMatch.strcmp(th.kanjiInfo.kanji, o.kanjiInfo.kanji);
        }
    }

    private static strcmp(a: string, b: string): number {
        return (a < b ? -1 : (a > b ? 1 : 0));
    }
}
