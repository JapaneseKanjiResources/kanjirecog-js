import { Stroke } from "./Stroke";
import { PathData } from "./PathData";

export class InputStroke {

    private startX: number;
    private startY: number;
    private endX: number;
    private endY: number;

    /**
    * Constructs from an SVG path. The full SVG path sequence is not accepted.
    * Instead all paths must begin with a single M or m followed by commands from
    * the following list: "CcSsZz"
    * @param svgPath SVG path string
    * @throws IllegalArgumentException If string can't be parsed
    */
    public static fromSvgPath(svgPath: string) {
        const output = new InputStroke();

        const data = new PathData(svgPath);

        // Read initial M
        const initial = data.readLetter();
        if (initial !== "M" && initial !== "m") {
            throw new Error("Path must start with M");
        }

        // Read start co-ordinates (note: 'm' is not really relative at start
        // of path, so treated the same as M; see SVG spec)
        output.startX = data.readNumber();
        output.startY = data.readNumber();

        // Handle all other commands
        let x = output.startX;
        let y = output.startY;
        let lastCommand = "-1";
        loop: while (true) {
            let command = data.readLetter();
            if (command === PathData.NUMBER) {
                if (lastCommand === "-1") {
                    throw new Error("Expecting command, not number");
                }
                command = lastCommand;
            } else {
                lastCommand = command;
            }
            switch (command) {
                case PathData.EOL:
                    break loop; // End of line
                case "c":
                    data.readNumber();
                    data.readNumber();
                    data.readNumber();
                    data.readNumber();
                    x += data.readNumber();
                    y += data.readNumber();
                    break;
                case "C":
                    data.readNumber();
                    data.readNumber();
                    data.readNumber();
                    data.readNumber();
                    x = data.readNumber();
                    y = data.readNumber();
                    break;
                case "s":
                    data.readNumber();
                    data.readNumber();
                    x += data.readNumber();
                    y += data.readNumber();
                    break;
                case "S":
                    data.readNumber();
                    data.readNumber();
                    x = data.readNumber();
                    y = data.readNumber();
                    break;
                case "z":
                case "Z":
                    x = output.startX;
                    y = output.startY;
                    break;
                default:
                    throw new Error("Unexpected path command: "
                        + command);
            }
        }

        output.endX = x;
        output.endY = y;
        return output;
    }

    /**
	 * Constructs from raw data.
	 * @param startX Start position (x) 0-1
	 * @param startY Start position (y) 0-1
	 * @param endX End position (x) 0-1
	 * @param endY End position (y) 0-1
	 */
    public static fromFloats(startX: number, startY: number, endX: number, endY: number) {
        const output = new InputStroke();
        output.startX = startX;
        output.endX = endX;
        output.startY = startY;
        output.endY = endY;
        return output;
    }

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
        // Find range
        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = Number.MIN_VALUE;
        let maxY = Number.MIN_VALUE;

        for (const stroke of strokes) {
            if (stroke.startX < minX) {
                minX = stroke.startX;
            }
            if (stroke.startX > maxX) {
                maxX = stroke.startX;
            }
            if (stroke.startY < minY) {
                minY = stroke.startY;
            }
            if (stroke.startY > maxY) {
                maxY = stroke.startY;
            }

            if (stroke.endX < minX) {
                minX = stroke.endX;
            }
            if (stroke.endX > maxX) {
                maxX = stroke.endX;
            }
            if (stroke.endY < minY) {
                minY = stroke.endY;
            }
            if (stroke.endY > maxY) {
                maxY = stroke.endY;
            }
        }

        // Adjust max/min to avoid divide by zero
        if (Math.abs(minX - maxX) < 0.0000000001) {
            // Adjust by 1% of height
            let adjust = Math.abs(minY - maxY);
            if (adjust < 0.0000000001) {
                adjust = 0.1;
            }
            minX -= adjust;
            maxX += adjust;
        }
        if (Math.abs(minY - maxY) < 0.0000000001) {
            // Adjust by 1% of width
            let adjust = Math.abs(minX - maxX) / 100;
            if (adjust < 0.0000000001) {
                adjust = 0.1;
            }

            minY -= adjust;
            maxY += adjust;
        }

        // Now sort out a maximum scale factor, so that very long/thin kanji
        // don't get stretched to square
        const xRange = Math.abs(minX - maxX);
        const yRange = Math.abs(minY - maxY);
        if (xRange > 5 * yRange) {
            const adjust = (xRange - yRange) / 2;
            minY -= adjust;
            maxY += adjust;
        } else if (yRange > 5 * xRange) {
            const adjust = (yRange - xRange) / 2;
            minX -= adjust;
            maxX += adjust;
        }

        // Convert all points according to range
        const output: Stroke[] = [];
        for (let i = 0; i < strokes.length; i++) {
            output[i] = Stroke.fromFloats(
                (strokes[i].startX - minX) / (maxX - minX),
                (strokes[i].startY - minY) / (maxY - minY),
                (strokes[i].endX - minX) / (maxX - minX),
                (strokes[i].endY - minY) / (maxY - minY));
        }

        return output;
    }
}
