/**
 * Class to make it easier to read path data.
 */
export class PathData {
    public static EOL = "-1";
    public static NUMBER = "-2";

    private remaining: string;
    constructor(path: string) {
        this.remaining = path;
    }

    /**
     * Reads the next non-whitespace character.
     * @return Character or EOL if end of string or NUMBER if number/comma not letter
     */
    public readLetter(): string {
        let pos = 0;
        while (true) {
            if (pos === this.remaining.length) {
                return PathData.EOL;
            }
            const letter = this.remaining.charAt(pos);
            if (letter !== " ") {
                if (letter === "," || letter === "-" || letter === "+" || (letter >= "0" && letter <= "9")) {
                    return PathData.NUMBER;
                }
                this.remaining = this.remaining.substring(pos + 1);
                return letter;
            }
            pos++;
        }
    }

    /**
     * Reads the next number, skipping whitespace and comma and +
     * @return Number
     * @throws IllegalArgumentException If unexpected EOL or invalid number
     */
    public readNumber(): number {
        let start = 0;
        while (true) {
            if (start === this.remaining.length) {
                throw new Error("Unexpected EOL before number");
            }
            const c = this.remaining.charAt(start);
            if (c !== "," && c !== " " && c !== "+") {
                break;
            }
            start++;
        }

        let end = start + 1;
        while (true) {
            if (end === this.remaining.length) {
                break;
            }
            const c = this.remaining.charAt(end);
            if (c !== "." && (c < "0" || c > "9")) {
                break;
            }
            end++;
        }

        const num = this.remaining.substring(start, end);
        this.remaining = this.remaining.substring(end);

        const n = parseFloat(num);
        if (isNaN(n)) {
            throw new Error("Invalid number: " + num);
        }

        return n;
    }
}
