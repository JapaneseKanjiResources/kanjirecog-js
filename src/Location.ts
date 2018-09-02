/**
 * Represents approximate location of start/end points of stroke.
 */
export class Location {

    /** Basically N */
    public static readonly N = new Location(1, 0, "\u2580");
    /** Basically NE */
    public static readonly NE = new Location(2, 0, "\u259c");
    /** Basically E */
    public static readonly E = new Location(2, 1, "\u2590");
    /** Basically SE */
    public static readonly SE = new Location(2, 2, "\u259f");
    /** Basically S */
    public static readonly S = new Location(1, 2, "\u2584");
    /** Basically SW */
    public static readonly SW = new Location(0, 2, "\u2599");
    /** Basically W */
    public static readonly W = new Location(0, 1, "\u258c");
    /** Basically NW */
    public static readonly NW = new Location(0, 0, "\u259b");
    /** Basically in the middle */
    public static readonly MID = new Location(1, 1, "\u2588");

    public static readonly locations: Location[] = [Location.N, Location.NE, Location.E, Location.SE, Location.S, Location.SW, Location.W, Location.NW, Location.MID];

    constructor(readonly x: number, readonly y: number, readonly display: string) {}

    public toString(): string {
        return this.display;
    }

    /**
     * Reads from string.
     * @param s Input string
     * @return Location value
     * @throws IllegalArgumentException If not a valid direction
     */
    public static fromString(s: string): Location {
        for (const location of Location.locations) {
            if (location.display === s) {
                return location;
            }
        }
        throw new Error("Unknown location (" + s + ")");
    }

    /**
     * @param other Another location
     * @return True if this location is within one step of the other location
     */
    public isClose(other: Location): boolean {
        return Math.abs(this.x - other.x) <= 1 && Math.abs(this.y - other.y) <= 1;
    }

    /**
     * @param x Normalised X
     * @param y Normalised Y
     * @return Location
     */
    public static get(x: number, y: number): Location {
        if (x < 85) {
            if (y < 85) {
                return Location.NW;
            } else if (y < 170) {
                return Location.W;
            } else {
                return Location.SW;
            }
        } else if (x < 170) {
            if (y < 85) {
                return Location.N;
            } else if (y < 170) {
                return Location.MID;
            } else {
                return Location.S;
            }
        } else {
            if (y < 85) {
                return Location.NE;
            } else if (y < 170) {
                return Location.E;
            } else {
                return Location.SE;
            }
        }
    }
}

// console.log(Location.locations);
