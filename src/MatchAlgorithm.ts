import { IKanjiComparer } from "./KanjiComparer";
import { KanjiInfo } from "./KanjiInfo";
import { StrictComparer } from "./StrictComparer";
import { FuzzyComparer } from "./FuzzyComparer";
import { SpansComparer } from "./SpansComparer";

export type MatchAlgorithmKey = "STRICT" | "FUZZY" | "FUZZY_1OUT" | "FUZZY_2OUT" | "SPANS" | "SPANS_1OUT" | "SPANS_2OUT";

interface IKanjiComparerConstructor {
    new(): IKanjiComparer;
}

/**
* Algorithm used for comparing kanji.
*/
export class MatchAlgorithm {

    /**
     * Accurate, fast, but strict algorithm (requires precise stroke count
     * and order).
     */
    public static readonly STRICT = new MatchAlgorithm("STRICT", 0, StrictComparer);

    /**
    * Fuzzy matching algorithm which allows arbitrary stroke order. Very slow.
    */
    public static readonly FUZZY = new MatchAlgorithm("FUZZY", 0, FuzzyComparer);

    /**
    * Fuzzy matching algorithm which allows arbitrary stroke order; with
    * either +1 or -1 stroke count (does not include =). Even slower.
    */
    public static readonly FUZZY_1OUT = new MatchAlgorithm("FUZZY_1OUT", 1, FuzzyComparer);
    /**
    * Fuzzy matching algorithm which allows arbitrary stroke order; with
    * either +2 or -2 stroke count. Also slow
    */
    public static readonly FUZZY_2OUT = new MatchAlgorithm("FUZZY_2OUT", 2, FuzzyComparer);

    /**
    * Second fuzzy matching algorithm based on the 'spans' created by each
    * stroke.
    */
    public static readonly SPANS = new MatchAlgorithm("SPANS", 0, SpansComparer);

    /**
    * Second fuzzy matching algorithm based on the 'spans' created by each
    * stroke.
    * Allows +1 or -1 stroke count.
    */
    public static readonly SPANS_1OUT = new MatchAlgorithm("SPANS_1OUT", 1, SpansComparer);

    /**
    * Second fuzzy matching algorithm based on the 'spans' created by each
    * stroke.
    * Allows +2 or -2 stroke count.
    */
    public static readonly SPANS_2OUT = new MatchAlgorithm("SPANS_2OUT", 2, SpansComparer);

    constructor(readonly key: MatchAlgorithmKey, readonly out: number, readonly ctor: IKanjiComparerConstructor) { }

    /**
    * Constructs a new comparer object with the given drawn kanji
    * @param drawn Drawn kanji
    * @return Comparer object, already inited
    */
    public newComparer(drawn: KanjiInfo): IKanjiComparer {
        let comparer: IKanjiComparer;
        try {
            comparer = new this.ctor();
        } catch {
            throw new Error("Incorrectly defined comparer");
        }
        comparer.init(drawn);
        return comparer;
    }
}
