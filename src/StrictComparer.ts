import { IKanjiComparer } from "./KanjiComparer";
import { KanjiInfo } from "./KanjiInfo";
import { Direction } from "./Direction";
import { Location } from "./Location";

/**
 * Compares entered strokes with other kanji using slightly fuzzy logic.
 */
export class StrictComparer implements IKanjiComparer {
    private static readonly STROKE_DIRECTION_WEIGHT = 1.0;
    private static readonly MOVE_DIRECTION_WEIGHT = 0.8;
    private static readonly STROKE_LOCATION_WEIGHT = 0.6;

    private static readonly CLOSE_WEIGHT = 0.7;

    private drawnStarts!: Location[];
    private drawnEnds!: Location[];
    private drawnDirections!: Direction[];
    private drawnMoves!: Direction[];

    /**
	 * Initialises with given drawn kanji.
	 * @param info Drawn kanji
	 */
    public init(info: KanjiInfo) {
        this.drawnStarts = info.strokeStarts;
        this.drawnEnds = info.strokeEnds;
        this.drawnDirections = info.strokeDirections;
        this.drawnMoves = info.moveDirections;
    }

    /**
	 * Compares against the given other kanji.
	 * @param other Other kanji
	 * @return Score in range 0 to 100
	 */
    public getMatchScore(other: KanjiInfo): number {
        const otherStarts = other.strokeStarts,
            otherEnds = other.strokeEnds;
        const otherDirections = other.strokeDirections,
            otherMoves = other.moveDirections;

        if (otherStarts.length !== this.drawnStarts.length) {
            throw new Error(
                "Can only compare with same match length");
        }

        let score = 0;
        for (let i = 0; i < this.drawnStarts.length; i++) {
            // Stroke direction
            if (this.drawnDirections[i] === otherDirections[i]) {
                score += StrictComparer.STROKE_DIRECTION_WEIGHT;
            } else if (this.drawnDirections[i].isClose(otherDirections[i])) {
                score += StrictComparer.STROKE_DIRECTION_WEIGHT * StrictComparer.CLOSE_WEIGHT;
            }

            // Move direction
            if (i > 0) {
                if (this.drawnMoves[i - 1] === otherMoves[i - 1]) {
                    score += StrictComparer.MOVE_DIRECTION_WEIGHT;
                } else if (this.drawnMoves[i - 1].isClose(otherMoves[i - 1])) {
                    score += StrictComparer.MOVE_DIRECTION_WEIGHT * StrictComparer.CLOSE_WEIGHT;
                }
            }

            // Start and end locations
            if (this.drawnStarts[i] === otherStarts[i]) {
                score += StrictComparer.STROKE_LOCATION_WEIGHT;
            } else if (this.drawnStarts[i].isClose(otherStarts[i])) {
                score += StrictComparer.STROKE_LOCATION_WEIGHT * StrictComparer.CLOSE_WEIGHT;
            }
            if (this.drawnEnds[i] === otherEnds[i]) {
                score += StrictComparer.STROKE_LOCATION_WEIGHT;
            } else if (this.drawnEnds[i].isClose(otherEnds[i])) {
                score += StrictComparer.STROKE_LOCATION_WEIGHT * StrictComparer.CLOSE_WEIGHT;
            }
        }

        const max = this.drawnStarts.length * (StrictComparer.STROKE_DIRECTION_WEIGHT
            + 2 * StrictComparer.STROKE_LOCATION_WEIGHT)
            + (this.drawnStarts.length - 1) * StrictComparer.MOVE_DIRECTION_WEIGHT;

        return 100.0 * score / max;
    }
}
