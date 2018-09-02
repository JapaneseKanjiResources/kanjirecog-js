import { InputStroke } from "./InputStroke";
import { Stroke } from "./Stroke";
import { Direction } from "./Direction";
import { Location } from "./Location";
import { MatchAlgorithmKey, MatchAlgorithm } from "./MatchAlgorithm";
import { IKanjiComparer } from "./KanjiComparer";
import AsyncLock from "async-lock";

export class KanjiInfo {

    private lock = new AsyncLock();

    private loadingStrokes: InputStroke[];
    private strokes!: Stroke[];
    public strokeDirections!: Direction[];
    public moveDirections!: Direction[];
    public strokeStarts!: Location[];
    public strokeEnds!: Location[];
    private comparers!: Partial<Record<MatchAlgorithmKey, IKanjiComparer>>;

    public static parseHex(s: string): number {
        const n = parseInt(s, 16);
        if (n) {
            return n;
        }
        throw new Error("NumberFormatException " + s);
    }

    /**
	 * Converts a two-digit, lowercase hex string to an integer. (This is a lot
	 * faster than doing a substring and Integer.parseInt; I profiled it and
	 * saw a big performance improvement to the overall load process.)
	 * @param input String
	 * @param pos Position in string of first digit
	 * @return Value as integer
	 */
    private static getTwoDigitHexInt(input: string, pos: number): number {
        return this.parseHex(input.substring(pos, pos + 2));
    }

    /**
	 * @param kanji Kanji character (should be a single character, but may be
	 *   a UTF-16 surrogate pair)
	 */
    constructor(readonly kanji: string) {
        this.loadingStrokes = [];
    }

    public static fromFull(kanji: string, full: string): KanjiInfo {
        const ki = new this(kanji);

        const count = (full.length + 1) / 12;
        if ((count * 12 - 1) !== full.length) {
            throw new Error("Invalid full (" + full
                + ") for kanji (" + kanji + ")");
        }

        try {
            ki.strokes = [];
            let offset = 0;
            for (let i = 0; i < count; i++) {
                if (i !== 0) {
                    offset++; // Skip colon
                }

                ki.strokes[i] = new Stroke(
                    this.getTwoDigitHexInt(full, offset),
                    this.getTwoDigitHexInt(full, offset + 3),
                    this.getTwoDigitHexInt(full, offset + 6),
                    this.getTwoDigitHexInt(full, offset + 9));
                offset += 11;
            }

        } catch {
            throw new Error("Invalid summary(" + full
                + ") for kanji (" + kanji + ")");
        }

        ki.findDirections();

        return ki;
    }

    /**
	 * @param kanji Kanji character (should be a single character, but may be
	 *   a UTF-16 surrogate pair)
	 * @param directions Strokes string (in {@link #getAllDirections()} format)
	 * @param full Full summary string (in {@link #getFullSummary()} format)
	 * @throws IllegalArgumentException If strokes string has invalid format
	 */
    public static fromDirectionsFull(kanji: string, directions: string, full: string): KanjiInfo {
        const ki = new this(kanji);
        const count = (full.length + 1) / 12;
        if (count < 1 || (count * 6 - 3) !== directions.length) {
            throw new Error("Invalid directions (" + directions
                + ") for kanji (" + kanji + ")");
        }
        if ((count * 12 - 1) !== full.length) {
            throw new Error("Invalid full (" + full
                + ") for kanji (" + kanji + ")");
        }

        ki.strokeDirections = [];
        ki.strokeStarts = [];
        ki.strokeEnds = [];
        ki.moveDirections = [];

        try {
            let offset = 0;
            for (let i = 0; i < count; i++) {
                if (i !== 0) {
                    offset++; // Skip colon
                    ki.moveDirections[i - 1] = Direction.fromString(directions.charAt(offset++) + "");
                    offset++; // Skip colon
                }

                ki.strokeStarts[i] = Location.fromString(directions.charAt(offset++) + "");
                ki.strokeDirections[i] = Direction.fromString(directions.charAt(offset++) + "");
                ki.strokeEnds[i] = Location.fromString(directions.charAt(offset++) + "");
            }
        } catch {
            throw new Error("Invalid strokes(" + directions
                + ") for kanji (" + kanji + ")");
        }

        try {
            ki.strokes = [];
            let offset = 0;
            for (let i = 0; i < count; i++) {
                if (i !== 0) {
                    offset++; // Skip colon
                }

                ki.strokes[i] = new Stroke(
                    this.parseHex(full.substring(offset, offset + 2)),
                    this.parseHex(full.substring(offset + 3, offset + 5)),
                    this.parseHex(full.substring(offset + 6, offset + 8)),
                    this.parseHex(full.substring(offset + 9, offset + 11)));
                offset += 11;
            }
        } catch {
            throw new Error("Invalid summary(" + full
                + ") for kanji (" + kanji + ")");
        }

        return ki;
    }

    /**
	 * Adds a stroke. Can only be called during initialisation.
	 * @param stroke New stroke
	 * @throws IllegalStateException If already finished
	 */
    public addStroke(stroke: InputStroke) {
        this.lock.acquire("sync", () => {
            if (this.loadingStrokes == null) {
                throw new Error("Cannot add strokes after loading");
            }
            this.loadingStrokes.push(stroke);
        });
    }

    /**
	 * Marks kanji as finished, normalising all strokes.
	 * @throws IllegalStateException If already finished
	 */
    public finish() {
        this.lock.acquire("sync", () => {
            if (this.loadingStrokes == null) {
                throw new Error("Cannot finish more than once");
            }

            // Get stroke array and normalise it
            const inputStrokes = this.loadingStrokes;

            this.strokes = InputStroke.normalise(inputStrokes);

            // Find directions
            this.findDirections();
        });
    }

    /**
	 * Calculate the direction summary.
	 */
    private findDirections() {
        // Find all the directions
        this.strokeDirections = [];
        this.strokeStarts = [];
        this.strokeEnds = [];
        for (let i = 0; i < this.strokes.length; i++) {
            this.strokeDirections[i] = this.strokes[i].getDirection();
            this.strokeStarts[i] = this.strokes[i].getStartLocation();
            this.strokeEnds[i] = this.strokes[i].getEndLocation();
        }
        this.moveDirections = [];
        for (let i = 1; i < this.strokes.length; i++) {
            this.moveDirections[i - 1] = this.strokes[i].getMoveDirection(this.strokes[i - 1]);
        }
    }

    /**
	 * Checks that this kanji has been finished.
	 * @throws IllegalStateException If not finished
	 */
    private checkFinished() {
        if (this.strokeDirections == null) {
            throw new Error("Cannot call on unfinished kanji");
        }
    }

    /**
	 * @return Stroke count
	 * @throws IllegalStateException If not finished
	 */
    public getStrokeCount(): number {
        this.checkFinished();
        return this.strokeDirections.length;
    }

    /**
	 * @param index Stroke index
	 * @return Stroke
	 * @throws ArrayIndexOutOfBoundsException If index >=
	 *   {@link #getStrokeCount()}
	 * @throws IllegalStateException If loaded in a way that doesn't give
	 *   these
	 */
    private getStroke(index: number): Stroke {
        if (this.strokes == null) {
            throw new Error("Cannot call getStroke in this state");
        }

        return this.strokes[index];
    }

    /**
	 * Obtains all the directions (stroke and move).
	 * @return All the direction arrows
	 */
    public getAllDirections(): string {
        let out = "";
        for (let i = 0; i < this.strokeDirections.length; i++) {
            if (i > 0) {
                out += ":";
                out += this.moveDirections[i - 1];
                out += ":";
            }
            out += this.strokeStarts[i];
            out += this.strokeDirections[i];
            out += this.strokeEnds[i];
        }
        return out;
    }

    private getTwoDigitPosition(intPos: number): string {
        let result = intPos.toString(16);
        if (result.length === 1) {
            result = "0" + result;
        }
        return result;
    }

    /**
	 * Obtains all stroke details as a from/to summary.
	 * @return Full details as string
	 */
    public getFullSummary(): string {
        if (this.strokes == null) {
            throw new Error("Strokes not available");
        }

        let out = "";
        for (const stroke of this.strokes) {
            if (out.length > 0) {
                out += ":";
            }
            out += this.getTwoDigitPosition(stroke.startX);
            out += ",";
            out += this.getTwoDigitPosition(stroke.startY);
            out += "-";
            out += this.getTwoDigitPosition(stroke.endX);
            out += ",";
            out += this.getTwoDigitPosition(stroke.endY);
        }

        return out;
    }

    /**
	 * Writes the basic info from this kanji to short XML format data.
	 * @param out Writer that receives data
	 * @throws IOException Any error
	 */
    public write(): string {
        const code = this.kanji.codePointAt(0);
        return ("<kanji unicode='"
            + (code || 0).toString(16).toUpperCase()
            + "' strokes='" + this.getFullSummary() + "'/>\n");
    }

    /**
	 * Gets a score for matching with the specified other kanji. Scores are
	 * only comparable against other kanji with same stroke count.
	 * @param other Other kanji
	 * @param algo Match algorithm to use
	 * @return Score
	 * @throws IllegalArgumentException If other kanji has inappropriate stroke count
	 */
    public getMatchScore(other: KanjiInfo, algo: MatchAlgorithm): number {
        let ret!: IKanjiComparer;
        this.lock.acquire("sync", () => {
            if (this.comparers == null) {
                this.comparers = {};
            }

            let comparer = this.comparers[algo.key];
            if (comparer == null) {
                comparer = algo.newComparer(this);
                this.comparers[algo.key] = comparer;
            }
            ret = comparer;
        });

        return ret.getMatchScore(other);
    }
}
