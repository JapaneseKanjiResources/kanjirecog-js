import { IKanjiComparer } from "./KanjiComparer";
import { KanjiInfo } from "./KanjiInfo";
import { Direction } from "./Direction";
import { Location } from "./Location";

export class SpansComparer implements IKanjiComparer {

    /**
     * Number of categories for X and Y. Note: There is one array with (this
     * number) to power four, so don't increase it too much...
     */
    public static LOCATION_RANGE = 5;
    public static ARRAY_SIZE = SpansComparer.LOCATION_RANGE * SpansComparer.LOCATION_RANGE * SpansComparer.LOCATION_RANGE * SpansComparer.LOCATION_RANGE;

    public static SCORE_RIGHTDIRECTION = 2;
    public static SCORE_EXACTLOCATION = 4;
    public static SCORE_STRAIGHTLOCATION = 3;
    public static SCORE_DIAGONALLOCATION = 2;

    public static MAX_SCORE = SpansComparer.SCORE_EXACTLOCATION * 2 + SpansComparer.SCORE_RIGHTDIRECTION;
    public static MIN_SCORE = SpansComparer.SCORE_DIAGONALLOCATION * 2;

    public static NO_MATCH = -1;

    /**
     * Array of possible matching strokes. The indexes of this array are in
     * the form startX * LOCATION_RANGE^3 + startY * LOCATION_RANGE^2 +
     * endX * LOCATION_RANGE + endY
     */
    private positions: Position[];

    private count = 0;

    public init(info: KanjiInfo) {
        // Create positions array
        this.positions = [];
        for (let i = 0; i < SpansComparer.ARRAY_SIZE; i++) {
            this.positions[i] = new Position();
        }

        // Loop through all the strokes
        this.count = info.getStrokeCount();
        for (let i = 0; i < this.count; i++) {
            const s = info.getStroke(i);

            // Work out X and Y
            const startX = (s.startX * SpansComparer.LOCATION_RANGE) >> 8;
            const startY = (s.startY * SpansComparer.LOCATION_RANGE) >> 8;
            const endX = (s.endX * SpansComparer.LOCATION_RANGE) >> 8;
            const endY = (s.endY * SpansComparer.LOCATION_RANGE) >> 8;

            this.addSpan(i, startX, startY, endX, endY, true);
            this.addSpan(i, endX, endY, startX, startY, false);
        }

        // Finish everything
        for (let i = 0; i < SpansComparer.ARRAY_SIZE; i++) {
            this.positions[i].finish();
        }
    }

    private getIndex(sX: number, sY: number, eX: number, eY: number): number {
        return sX * SpansComparer.LOCATION_RANGE * SpansComparer.LOCATION_RANGE * SpansComparer.LOCATION_RANGE
            + sY * SpansComparer.LOCATION_RANGE * SpansComparer.LOCATION_RANGE
            + eX * SpansComparer.LOCATION_RANGE
            + eY;
    }

    private addSpan(stroke: number, startX: number, startY: number, endX: number, endY: number,
                    rightDirection: boolean) {
        for (let sX = startX - 1; sX <= startX + 1; sX++) {
            if (sX < 0 || sX >= SpansComparer.LOCATION_RANGE) {
                continue;
            }
            for (let sY = startY - 1; sY <= startY + 1; sY++) {
                if (sY < 0 || sY >= SpansComparer.LOCATION_RANGE) {
                    continue;
                }
                for (let eX = endX - 1; eX <= endX + 1; eX++) {
                    if (eX < 0 || eX >= SpansComparer.LOCATION_RANGE) {
                        continue;
                    }
                    for (let eY = endY - 1; eY <= endY + 1; eY++) {
                        if (eY < 0 || eY >= SpansComparer.LOCATION_RANGE) {
                            continue;
                        }

                        // Get score
                        let score;
                        if (startX === sX && startY === sY) {
                            score = SpansComparer.SCORE_EXACTLOCATION;
                        } else if (startX === sX || startY === sY) {
                            score = SpansComparer.SCORE_STRAIGHTLOCATION;
                        } else {
                            score = SpansComparer.SCORE_DIAGONALLOCATION;
                        }
                        if (endX === eX && endY === eY) {
                            score += SpansComparer.SCORE_EXACTLOCATION;
                        } else if (endX === eX || endY === eY) {
                            score += SpansComparer.SCORE_STRAIGHTLOCATION;
                        } else {
                            score += SpansComparer.SCORE_DIAGONALLOCATION;
                        }
                        if (rightDirection) {
                            score += SpansComparer.SCORE_RIGHTDIRECTION;
                        }

                        // Add to positions
                        this.positions[this.getIndex(sX, sY, eX, eY)].add(stroke, score);
                    }
                }
            }
        }
    }

    public getMatchScore(other: KanjiInfo): number {
        // Set up used array with nothing used
        const used: boolean[] = []; // new boolean[count]
        let unmatched = this.count;

        // Convert each stroke ion the target kanji to a position index
        const otherCount = other.getStrokeCount();
        let otherUnmatched = otherCount;
        const otherUsed: boolean[] = [];
        const otherIndexes: number[] = [];

        for (let i = 0; i < otherCount; i++) {
            const s = other.getStroke(i);

            // Work out X and Y
            const startX = (s.startX * SpansComparer.LOCATION_RANGE) >> 8;
            const startY = (s.startY * SpansComparer.LOCATION_RANGE) >> 8;
            const endX = (s.endX * SpansComparer.LOCATION_RANGE) >> 8;
            const endY = (s.endY * SpansComparer.LOCATION_RANGE) >> 8;

            otherIndexes[i] = this.getIndex(startX, startY, endX, endY);
        }

        // Calculate total score
        let score = 0;

        // Loop through all the strokes in the other kanji and try to match them
        // Begin with max score
        for (let requiredScore = SpansComparer.MAX_SCORE; requiredScore >= SpansComparer.MIN_SCORE; requiredScore--) {
            for (let i = 0; i < otherCount; i++) {
                if (otherUsed[i]) {
                    continue;
                }

                const match = this.positions[otherIndexes[i]].match(requiredScore, used);
                if (match !== SpansComparer.NO_MATCH) {
                    // Add score
                    score += requiredScore;

                    // Mark it as used
                    otherUsed[i] = true;
                    used[match] = true;
                    unmatched--;
                    otherUnmatched--;
                    if (unmatched === 0 || otherUnmatched === 0) {
                        break;
                    }
                }
            }
        }

        // Work out as a proportion of max possible score
        const maxScore = Math.min(this.count, otherCount) * SpansComparer.MAX_SCORE;
        return 100 * (score / maxScore);
    }
}

// tslint:disable-next-line:max-classes-per-file
export class SpanScore {
    /**
     * @param stroke Index of stroke within drawn kanji
     * @param score Score of this combination (how closely it reflects the stroke)
     */
    constructor(readonly stroke: number, readonly score: number) { }

    public static compare(th: SpanScore, other: SpanScore): number {
        if (other.score > th.score) {
            return 1;
        } else if (other.score < th.score) {
            return -1;
        }
        return other.stroke - th.stroke;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class Position {
    private spanSet: SpanScore[] = [];
    private spanScores: SpanScore[];

    public add(stroke: number, score: number) {
        this.spanSet.push(new SpanScore(stroke, score));
    }

    public finish() {
        this.spanScores = this.spanSet.sort((a, b) => SpanScore.compare(a, b));
        this.spanSet = null;
    }

    /**
     * Returns the id of the stroke that matches this position at this score
     * or NO_MATCH if none
     * @param minScore Required score
     * @param used Array of used strokes
     * @return Stroke index or NO_MATCH if nothing with that score
     */
    public match(minScore: number, used: boolean[]): number {
        for (const score of this.spanScores) {
            if (score.score < minScore) {
                return SpansComparer.NO_MATCH;
            }
            if (!used[score.stroke]) {
                return score.stroke;
            }
        }
        return SpansComparer.NO_MATCH;
    }
}
