import { Direction } from "./Direction";
import { Location } from "./Location";

/**
 * Single kanji stroke.
 */
export class Stroke {
    /**
	 * Constructs from float data.
	 * @param startX Start position (x) 0-1
	 * @param startY Start position (y) 0-1
	 * @param endX End position (x) 0-1
	 * @param endY End position (y) 0-1
	 * @throws IllegalArgumentException If any value out of range
	 */
    public static fromFloats(startX: number, startY: number,
                             endX: number, endY: number): Stroke {
        return new this(this.convert(startX),
            this.convert(startY),
            this.convert(endX),
            this.convert(endY));
    }

    private static convert(value: number): number {
        return Math.trunc(value * 255 + 0.49999);
    }

    constructor(readonly startX: number, readonly startY: number,
                readonly endX: number, readonly endY: number) {
        if (startX < 0 || startX > 255 || startY < 0 || startY > 255
            || endX < 0 || endX > 255 || endY < 0 || endY > 255) {
            throw new RangeError("Value out of range");
        }
    }

    /**
	 * Calculates the direction of this stroke.
	 * @return Direction of stroke
	 */
    public getDirection(): Direction {
        return Direction.get(this.startX, this.startY, this.endX, this.endY,
            Direction.DIRECTION_THRESHOLD);
    }

    /**
	 * Calculates the direction of this stroke without imposing a threshold
	 * that considers short moves as nondirectional.
	 * @return Direction of stroke (will not be Direction.X)
	 */
    public getDirectionNoThreshold(): Direction {
        return Direction.get(this.startX, this.startY, this.endX, this.endY, 0);
    }

    /**
	 * Calculates the direction that the pen moved between the end of the
	 * last stroke and the start of this one.
	 * @param previous Previous stroke
	 * @return Direction moved
	 */
    public getMoveDirection(previous: Stroke): Direction {
        return Direction.get(previous.endX, previous.endY, this.startX, this.startY,
            Direction.DIRECTION_THRESHOLD);
    }

    /**
	 * @return Approximate location of start of stroke
	 */
    public getStartLocation(): Location {
        return Location.get(this.startX, this.startY);
    }

    /**
	 * @return Approximate location of end of stroke
	 */
    public getEndLocation(): Location {
        return Location.get(this.endX, this.endY);
    }

    public toString(): string {
        return "[" + this.startX + "," + this.startY + ":" + this.endX + "," + this.endY + "]";
    }
}
