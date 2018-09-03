import "mocha";
import { assert } from "chai";
import { InputStroke } from "../src/InputStroke";
import { assertStroke } from "./Stroke.test";

describe("InputStroke.test", () => {

    it("testCreatePath", () => {
        // M and c
        let stroke = InputStroke.fromSvgPath(
            "M8.75,23.62c1.5,1.25,2.16,3.14,2.38,5.38c0.96,10.07,0.89,8.17,1.89,19.38"
            + "c0.31,3.4,0.59,6.58,0.86,9.38");
        assertInputStroke(stroke, 8.75, 23.62,
            8.75 + 2.38 + 1.89 + 0.86, 23.62 + 5.38 + 19.38 + 9.38);

        // m and c (with c used multiple times without repeating command)
        stroke = InputStroke.fromSvgPath(
            "m7.4963375,37.394827"
            + "c1.1989328,0.99911,1.7264632,2.509766,1.9023067,4.300172,"
            + "0.7673168,8.048836,0.7113668,6.530187,1.5106558,15.490212,"
            + "0.247779,2.717581,0.47158,5.259319,0.687388,7.497327");

        assertInputStroke(stroke, 7.4963375, 37.394827,
            7.4963375 + 1.9023067 + 1.5106558 + 0.687388,
            37.394827 + 4.300172 + 15.490212 + 7.497327);

        // M and c and s
        stroke = InputStroke.fromSvgPath(
            "M19.25,16.75c0.75,1.25,1.25,3.25,1,5.5s0.25,68.5,0.25,72.25");
        assertInputStroke(stroke, 19.25, 16.75, 19.25 + 1 + 0.25, 16.75 + 5.5 + 72.25);

        // M and c and C
        stroke = InputStroke.fromSvgPath(
            "M71.81,39.33c0.12,0.85,0.22,2.03-0.62,3.03"
            + "C60.33,55.27,50.25,66.5,30.25,76.79");
        assertInputStroke(stroke, 71.81, 39.33, 30.25, 76.79);

        // M and c and S
        stroke = InputStroke.fromSvgPath(
            "M17.33,15.25c0.59,0.41,1.13,2.19,1.33,2.74"
            + "c0.2,0.55-0.3,15.37-0.3,17.09c0,6.42,5.68,6.74,15.16,6.74"
            + "S49,41.5,49,34.43");
        assertInputStroke(stroke, 17.33, 15.25, 49, 34.43);

        // M and c and s and C and z
        stroke = InputStroke.fromSvgPath(
            "M6.93,103.36c3.61-2.46,6.65-6.21,6.65-13.29c0-1.68-1.36-3.03-3.03-3.03"
            + "s-3.03,1.36-3.03,3.03s1.36,3.03,3.03,3.03"
            + "C15.17,93.1,10.4,100.18,6.93,103.36z");
        assertInputStroke(stroke, 6.93, 103.36, 6.93, 103.36);
    });

    it("testCreateBasic", () => {
        const stroke = InputStroke.fromFloats(1, 2, 3, 4);
        assertInputStroke(stroke, 1, 2, 3, 4);
    });

    it("testNormalise", () => {
        // Horizontal line
        let strokes = [
            InputStroke.fromFloats(7, 4, 77, 4),
        ];
        let out = InputStroke.normalise(strokes);
        assertStroke(out[0], 0, 127, 255, 127);

        // Vertical line
        strokes = [
            InputStroke.fromFloats(0, 4, 0, -174),
        ];
        out = InputStroke.normalise(strokes);
        assertStroke(out[0], 127, 255, 127, 0);

        // Single dot
        strokes = [
            InputStroke.fromFloats(4, 16, 4, 16),
        ];
        out = InputStroke.normalise(strokes);
        assertStroke(out[0], 127, 127, 127, 127);

        // Multiple lines
        strokes = [
            InputStroke.fromFloats(100, 40, 150, 10),
            InputStroke.fromFloats(150, 30, 200, 0),
            InputStroke.fromFloats(125, 20, 150, 30),
        ];
        out = InputStroke.normalise(strokes);
        assertStroke(out[0], 0, 255, 127, 64);
        assertStroke(out[1], 127, 191, 255, 0);
        assertStroke(out[2], 64, 127, 127, 191);

        // Very steep diagonal
        strokes = [
            InputStroke.fromFloats(0, 0, 1, 50),
        ];
        out = InputStroke.normalise(strokes);
        assert.equal(0, out[0].startY);
        assert.equal(255, out[0].endY);
        assert.isTrue(Math.abs(128 - out[0].startX) < 10);
        assert.isTrue(Math.abs(128 - out[0].endX) < 10);
    });

});

function assertInputStroke(stroke: InputStroke,
                           startX: number, startY: number, endX: number, endY: number) {
    assert.isTrue(Math.abs(stroke.startX - startX) < 0.001);
    assert.isTrue(Math.abs(stroke.endX - endX) < 0.001);
    assert.isTrue(Math.abs(stroke.startY - startY) < 0.001);
    assert.isTrue(Math.abs(stroke.endY - endY) < 0.001);
}
