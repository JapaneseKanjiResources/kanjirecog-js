import { KanjiInfo } from "./KanjiInfo";

/**
 * Interface for a method that can compare different kanji.
 */
export interface IKanjiComparer {
    /**
	 * Initialises the comparer. Should be called immediately after the
	 * constructor.
	 * @param info Kanji that the user drew
	 */
    init(info: KanjiInfo): void;

    /**
	 * Compares against the given other kanji.
	 * @param other Other kanji
	 * @return Score in range 0 to 100
	 */
    getMatchScore(other: KanjiInfo): number;
}
