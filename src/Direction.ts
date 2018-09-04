/**
 * The direction of a stroke.
 */
export class Direction {

    /** Basically N */
    public static readonly N = new Direction(0, "\u2191");
    /** Basically NE */
    public static readonly NE = new Direction(1, "\u2197");
    /** Basically E */
    public static readonly E = new Direction(2, "\u2192");
    /** Basically SE */
    public static readonly SE = new Direction(3, "\u2198");
    /** Basically S */
    public static readonly S = new Direction(4, "\u2193");
    /** Basically SW */
    public static readonly SW = new Direction(5, "\u2199");
    /** Basically W */
    public static readonly W = new Direction(6, "\u2190");
    /** Basically NW */
    public static readonly NW = new Direction(7, "\u2196");
    /** No clear movement */
    public static readonly X = new Direction(-1, "\u26aa");

    private static readonly directions: Direction[] = [Direction.N, Direction.NE, Direction.E, Direction.SE, Direction.S, Direction.SW, Direction.W, Direction.NW, Direction.X];

    constructor(readonly index: number, readonly display: string) { }

    /**
     * Reads from string.
     * @param s Input string
     * @return Direction value
     * @throws IllegalArgumentException If not a valid direction
     */
    public static fromString(s: string): Direction {
        for (const direction of Direction.directions) {
            if (direction.display === s) {
                return direction;
            }
        }
        throw new Error("Unknown direction (" + s + ")");
    }

    /**
     * @param other Another direction
     * @return True if this direction is within one step of the other direction
     */
    public isClose(other: Direction): boolean {
        if (this === Direction.X || other === Direction.X || this === other) {
            return true;
        }
        return (this.index === ((other.index + 1) % 8))
            || (((this.index + 1) % 8) === other.index);
    }

    /**
     * Threshold above which something counts as directional.
     */
    public static readonly DIRECTION_THRESHOLD = 51;

    /**
     * Propotion (out of 256) of dominant movement required to count as diagonal.
     * (E.g. if this is 77 = approx 30%, and if movement S is 10, then movenent E must
     * be at least 10 * 77 / 256 in order to count as SE).
     */
    public static readonly DIAGONAL_THRESHOLD = 77;

    /**
     * Calculates the direction between two points.
     * @param startX Start X
     * @param startY Start Y
     * @param endX End X
     * @param endY End Y
     * @param threshold Direction threshold (movement under this is not counted as directional)
     * @return Direction of stroke
     * @throws IllegalStateException If not normalised
     */
    public static get(startX: number, startY: number,
                      endX: number, endY: number, threshold: number): Direction {
        // Get movement in each direction
        const deltaX = endX - startX, deltaY = endY - startY;

        // Check if it's not really movement at all (under threshold)
        const absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY);
        if (absDeltaX < threshold && absDeltaY < threshold) {
            return Direction.X;
        }

        if (absDeltaX > absDeltaY) {
            // X movement is more significant
            const diagonal = absDeltaY > ((Direction.DIAGONAL_THRESHOLD * absDeltaX) >> 8);
            if (deltaX > 0) {
                if (diagonal) {
                    return deltaY < 0 ? Direction.NE : Direction.SE;
                } else {
                    return Direction.E;
                }
            } else {
                if (diagonal) {
                    return deltaY < 0 ? Direction.NW : Direction.SW;
                } else {
                    return Direction.W;
                }
            }
        } else {
            // Y movement is more significant
            const diagonal = absDeltaX > ((Direction.DIAGONAL_THRESHOLD * absDeltaY) >> 8);
            if (deltaY > 0) {
                if (diagonal) {
                    return deltaX < 0 ? Direction.SW : Direction.SE;
                } else {
                    return Direction.S;
                }
            } else {
                if (diagonal) {
                    return deltaX < 0 ? Direction.NW : Direction.NE;
                } else {
                    return Direction.N;
                }
            }
        }
    }
}
