import { IKanjiComparer } from "./KanjiComparer";
import { KanjiInfo } from "./KanjiInfo";
import { Direction } from "./Direction";
import { Location } from "./Location";

export class SpansComparer implements IKanjiComparer {
    public init(info: KanjiInfo) {
        return;
    }
    public getMatchScore(other: KanjiInfo): number {
        return 0;
    }
}
