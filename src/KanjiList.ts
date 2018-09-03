import { KanjiInfo } from "../src/KanjiInfo";
import { KanjiInfoDto } from "./KanjiInfoDto";

// export interface IKanjiInfoMap {
//     [key: number]: KanjiInfo[];
// }

export class KanjiList {

    // private kanji: IKanjiInfoMap = {};
    private kanji = new Map<number, KanjiInfo[]>();

    /**
	 * Adds a kanji to the list.
	 * @param info Kanji to add
	 */
    public add(info: KanjiInfo) {
        const count = info.getStrokeCount();
        let list: KanjiInfo[] = this.kanji.get(count);
        if (list == null) {
            list = [];
            this.kanji.set(count, list);
        }
        list.push(info);
    }

    public save(): string {
        const output: KanjiInfoDto[] = [];
        for (const kinfos of this.kanji.values()) {
            for (const character of kinfos) {
                const kinfoDto = character.write();
                output.push(kinfoDto);
            }
        }
        return JSON.stringify(output);
    }
}
