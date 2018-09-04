import { Stroke } from "./Stroke";

// tslint:disable-next-line:max-classes-per-file
export class KanjiInfoDto {
    constructor(readonly unicode: string, readonly strokes: string) {}
}

// tslint:disable-next-line:max-classes-per-file
export class KanjiInfoBinaryDto {
    constructor(readonly unicodeNum: number, readonly strokes: Stroke[]) { }
}
