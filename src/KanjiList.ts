import { KanjiInfo } from "./KanjiInfo";
import { KanjiInfoDto } from "./KanjiInfoDto";
import { MatchAlgorithm } from "./MatchAlgorithm";
import { KanjiMatch } from "./KanjiMatch";

// interface IKanjiInfoMap {
//   [key: number]: KanjiInfo[];
// }

export class KanjiList {

    // private kanji: IKanjiInfoMap = {};
    private kanjiInfos = new Map<number, KanjiInfo[]>();

    /**
	 * Adds a kanji to the list.
	 * @param info Kanji to add
	 */
    public add(info: KanjiInfo) {
        const count = info.getStrokeCount();
        let list: KanjiInfo[] = this.kanjiInfos.get(count);
        if (list == null) {
            list = [];
            this.kanjiInfos.set(count, list);
        }
        list.push(info);
    }

    /**
	 * @param strokeCount Stroke count
	 * @return All kanji with that stroke count
	 */
    public getKanji(strokeCount: number): KanjiInfo[] {
        const list = this.kanjiInfos.get(strokeCount);
        if (list == null) {
            return [];
        }
        return list;
    }

    /**
	 * @param search Kanji to find
	 * @return Info for that kanji
	 * @throws IllegalArgumentException If kanji does not exist in list
	 */
    public find(search: string): KanjiInfo {
        for (const list of this.kanjiInfos.values()) {
            for (const info of list) {
                if (info.kanji === search) {
                    return info;
                }
            }
        }
        throw new Error("Kanji '" + search + "' not found");
    }

    /**
	 * Searches for closest matches.
	 * @param compare Kanji to compare
	 * @param algo Match algorithm to use
	 * @param progress Progress reporter (null if not needed)
	 * @return Top matches above search threshold
	 * @throws IllegalArgumentException If match algorithm not set
	 */
    public getTopMatches(compare: KanjiInfo,
                         algo: MatchAlgorithm): KanjiMatch[] {
        let matches: KanjiMatch[] = [];
        const list: KanjiInfo[] = [];

        if (compare.getStrokeCount() > 0) {
            // Do either -2 and +2, -1 and +1, or just 0
            const range = algo.out;
            let count = compare.getStrokeCount() - range;
            for (let i = 0; i < 2; i++) {
                if (count > 0) {
                    const countList = this.kanjiInfos.get(count);
                    if (countList != null) {
                        list.push(...countList);
                    }
                }
                count += 2 * range;
                if (range === 0) {
                    break;
                }
            }
        }

        for (const other of list) {
            const score = compare.getMatchScore(other, algo);
            const match = new KanjiMatch(other, score);
            matches.push(match);
        }
        matches = matches.sort((a, b) => KanjiMatch.compare(a, b));

        // Pull everything down to half match score
        const results: KanjiMatch[] = [];
        let maxScore = -1;
        for (const match of matches) {
            if (maxScore === -1) {
                maxScore = match.score;
            } else {
                if (match.score < maxScore * 0.75) {
                    break;
                }
            }
            results.push(match);
        }

        return results;
    }

    public save(): KanjiInfoDto[] {
        const output: KanjiInfoDto[] = [];
        for (const kinfos of this.kanjiInfos.values()) {
            for (const character of kinfos) {
                const kinfoDto = character.write();
                output.push(kinfoDto);
            }
        }
        return output;
    }
}
