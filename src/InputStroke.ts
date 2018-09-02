import { Stroke } from "./Stroke";

export class InputStroke {
    /**
	 * Normalises an array of strokes by converting their co-ordinates to range
	 * from 0 to 1 in each direction. If the stroke bounding rectangle
	 * has width or height 0, this will be handled so that it is at 0.5 in
	 * the relevant position.
	 * <p>
	 * This works by constructing new stroke objects; strokes are final.
	 * @param strokes Stroke array to convert
	 * @return Resulting converted array
	 */
    public static normalise(strokes: InputStroke[]): Stroke[] {
        return [];
    }
}
