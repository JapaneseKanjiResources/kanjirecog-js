import "mocha";
import { assert } from "chai";
import { Stroke } from "../src/Stroke";
import { Direction } from "../src/Direction";
import { Location } from "../src/Location";
import { InputStroke } from "../src/InputStroke";

describe("Stroke.test", () => {

    it("testCreateBasic", () => {
        const stroke = Stroke.fromInts(1, 2, 3, 4);
        assertStroke(stroke, 1, 2, 3, 4);
    });

    it("testDirection", () => {
        let stroke = Stroke.fromFloats(0.5, 0.5, 0.5, 0.5);
        assertStroke(stroke, 127, 127, 127, 127);

        assert.equal(Direction.X, stroke.getDirection());

        // Exact straights
        stroke = Stroke.fromFloats(0.5, 0.5, 0.8, 0.5);
        assert.equal(Direction.E, stroke.getDirection());
        stroke = Stroke.fromFloats(0.5, 0.5, 0.5, 0.8);
        assert.equal(Direction.S, stroke.getDirection());
        stroke = Stroke.fromFloats(0.5, 0.5, 0.2, 0.5);
        assert.equal(Direction.W, stroke.getDirection());
        stroke = Stroke.fromFloats(0.5, 0.5, 0.5, 0.2);
        assert.equal(Direction.N, stroke.getDirection());

        // Exact diagonals
        stroke = Stroke.fromFloats(0.5, 0.5, 0.8, 0.8);
        assert.equal(Direction.SE, stroke.getDirection());
        stroke = Stroke.fromFloats(0.5, 0.5, 0.2, 0.8);
        assert.equal(Direction.SW, stroke.getDirection());
        stroke = Stroke.fromFloats(0.5, 0.5, 0.2, 0.2);
        assert.equal(Direction.NW, stroke.getDirection());
        stroke = Stroke.fromFloats(0.5, 0.5, 0.8, 0.2);
        assert.equal(Direction.NE, stroke.getDirection());

        // Rough straights
        stroke = Stroke.fromFloats(0.5, 0.5, 0.8, 0.52);
        assert.equal(Direction.E, stroke.getDirection());
        stroke = Stroke.fromFloats(0.5, 0.5, 0.8, 0.48);
        assert.equal(Direction.E, stroke.getDirection());

        // Rough diagonals
        stroke = Stroke.fromFloats(0.5, 0.5, 0.8, 0.6);
        assert.equal(Direction.SE, stroke.getDirection());
        stroke = Stroke.fromFloats(0.5, 0.5, 0.8, 0.4);
        assert.equal(Direction.NE, stroke.getDirection());
    });

    it("testMoveDirection", () => {
        const inputStrokes =
            [
                InputStroke.fromSvgPath("M23.78,21.29"
                    + "c3.6,0.9,6.76,0.85,10.36,0.3"
                    + "c10.48-1.6,38.27-5.5,40.43-5.84"
                    + "c3.93-0.62,4.68,1.86,2.07,4.08"
                    + "c-2.6,2.22-14.89,12.42-21.68,17.44"),
                    InputStroke.fromSvgPath("M51.94,38.24"
                    + "C61.5,42.5,64.75,70.25,57.89,90"
                    + "c-3.24,9.32-8.64,2.5-10.39,0.5"),
            ];
        const strokes = InputStroke.normalise(inputStrokes);
        assert.equal(Direction.X, strokes[1].getMoveDirection(strokes[0]));
    });

    it("testLocation", () => {
        let stroke = Stroke.fromFloats(0.1, 0.1, 0.4, 0.1);
        assert.equal(Location.NW, stroke.getStartLocation());
        assert.equal(Location.N, stroke.getEndLocation());

        stroke = Stroke.fromFloats(0.7, 0.1, 0.9, 0.4);
        assert.equal(Location.NE, stroke.getStartLocation());
        assert.equal(Location.E, stroke.getEndLocation());

        stroke = Stroke.fromFloats(0.8, 0.94, 0.4, 0.7);
        assert.equal(Location.SE, stroke.getStartLocation());
        assert.equal(Location.S, stroke.getEndLocation());

        stroke = Stroke.fromFloats(0.2, 0.9, 0.3, 0.5);
        assert.equal(Location.SW, stroke.getStartLocation());
        assert.equal(Location.W, stroke.getEndLocation());

        stroke = Stroke.fromFloats(0.4, 0.4, 0.6, 0.6);
        assert.equal(Location.MID, stroke.getStartLocation());
        assert.equal(Location.MID, stroke.getEndLocation());
    });

    it("testDirectionCompare", () => {
        // One edge
        assert.isFalse(Direction.N.isClose(Direction.E));
        assert.isTrue(Direction.N.isClose(Direction.NE));
        assert.isTrue(Direction.N.isClose(Direction.N));
        assert.isTrue(Direction.N.isClose(Direction.NW));
        assert.isFalse(Direction.N.isClose(Direction.W));

        // Middle
        assert.isFalse(Direction.S.isClose(Direction.E));
        assert.isTrue(Direction.S.isClose(Direction.SE));
        assert.isTrue(Direction.S.isClose(Direction.S));
        assert.isTrue(Direction.S.isClose(Direction.SW));
        assert.isFalse(Direction.S.isClose(Direction.W));

        // compare with X
        assert.isTrue(Direction.W.isClose(Direction.X));
        assert.isTrue(Direction.X.isClose(Direction.W));
        assert.isTrue(Direction.X.isClose(Direction.X));
    });
});

function assertStroke(stroke: Stroke,
                      startX: number, startY: number, endX: number, endY: number) {
    assert.equal(startX, stroke.startX);
    assert.equal(startY, stroke.startY);
    assert.equal(endX, stroke.endX);
    assert.equal(endY, stroke.endY);
}
