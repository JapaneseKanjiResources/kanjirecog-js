import { IKanjiComparer } from "./KanjiComparer";
import { KanjiInfo } from "./KanjiInfo";
import { Direction } from "./Direction";
import { Location } from "./Location";

// tslint:disable-next-line:max-classes-per-file
export class FuzzyComparer implements IKanjiComparer {

    public drawnPairs: Pair[];
    public drawnPoints: Point[];

    public static SCOREMULTI_NOT_PAIR = 0.9;
    public static SCOREMULTI_WRONG_DIRECTION = 0.97;

    public static BEST_SCORES_SORT_FIRST = 5;

    public init(drawn: KanjiInfo) {
        // Set up data about drawn pairs/points
        this.drawnPairs = this.convertKanjiInfo(drawn);
        this.drawnPoints = this.getPairPoints(this.drawnPairs);
        for (const pair of this.drawnPairs) {
            pair.initDrawn(this.drawnPairs.length + 2);
        }
    }

    private convertKanjiInfo(info: KanjiInfo): Pair[] {
        const result: Pair[] = []; // new Pair[info.getStrokeCount()];
        for (let i = 0; i < info.getStrokeCount(); i++) {
            const stroke = info.getStroke(i);
            result[i] = new Pair(
                new Point(stroke.startX, stroke.startY),
                new Point(stroke.endX, stroke.endY));
        }
        for (const pair of result) {
            pair.a.setPair(pair);
            pair.b.setPair(pair);
        }
        return result;
    }

    private getPairPoints(pairs: Pair[]): Point[] {
        const result: Point[] = []; // new Point[pairs.length * 2];
        let out = 0;
        for (let i = 0; i < pairs.length * 2; i++) {
            result[out++] = pairs[i].a;
            result[out++] = pairs[i].b;
        }
        for (const point of result) {
            point.count(result);
        }
        return result;
    }

    /**
	 * Compares against the given other kanji.
	 * @param other Other kanji
	 * @return Score in range 0 to 100
	 */
    public getMatchScore(other: KanjiInfo): number {
        // Get data from match kanji
        const otherPairs = this.convertKanjiInfo(other);
        const otherPoints = this.getPairPoints(otherPairs);

        // Max difference is (less than) the highest number of strokes *
        // 6 facets.
        const maxScore = Math.max(this.drawnPoints.length, otherPoints.length) * 6;

        // Score all points against all points; O(points^2)
        for (const point of this.drawnPoints) {
            point.calcScore(otherPoints, maxScore);
        }

        // Score all pairs
        for (const pair of this.drawnPairs) {
            pair.calcScore(otherPoints);
        }

        // Copy source pairs into list of remaining ones
        const remainingPairs = this.drawnPairs.slice();

        // How many remaining things to match?
        let pairsLeft = remainingPairs.length;
        let pointsLeft = otherPoints.length;
        let totalScore = 0;

        while (pointsLeft > 0 && pairsLeft > 0) {
            // Score all pairs to find best match
            let bestPairIndex = -1;
            let bestPair: Pair = null;
            let bestPairScore = -1;
            for (let i = 0; i < remainingPairs.length; i++) {
                const pair = remainingPairs[i];
                if (pair == null) {
                    continue;
                }
                pair.scoreAvailable(otherPoints, bestPairScore);
                if (pair.bestScore > bestPairScore) {
                    bestPair = pair;
                    bestPairIndex = i;
                    bestPairScore = pair.bestScore;
                }
            }

            // Eat that pair and its points, and add to total score
            remainingPairs[bestPairIndex] = null;
            const aIndex = bestPair.bestAIndex;
            const bIndex = bestPair.bestBIndex;
            otherPoints[aIndex] = null;
            otherPoints[bIndex] = null;
            totalScore += bestPairScore;
            pairsLeft--;
            pointsLeft -= 2;
        }

        // Scale score (it is now up to 2 * max * number of pairs matched)
        totalScore /= 2 * maxScore * (this.drawnPairs.length - pairsLeft);

        // Return as percentage
        return totalScore * 100;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class Pair {
    public a: Point;
    public b: Point;

    public pointCount: number;

    public scores: number[][];
    public maxBScore: number;
    public maxAScore: number;

    public bestScore: number;
    public bestAIndex: number;
    public bestBIndex: number;

    constructor(a: Point, b: Point) {
        this.a = a;
        this.b = b;
    }

    public initDrawn(maxStrokes: number) {
        this.scores = []; // new float[maxStrokes * 2][];
        for (let i = 0; i < maxStrokes * 2; i++) {
            this.scores[i] = []; // new float[maxStrokes * 2];
        }
        this.a.initDrawn(maxStrokes);
        this.b.initDrawn(maxStrokes);
    }

    public calcScore(availablePoints: Point[]) {
        this.pointCount = availablePoints.length;
        this.maxBScore = -1;
        this.maxAScore = -1;

        // Get max B score
        for (let bIndex = 0; bIndex < this.pointCount; bIndex++) {
            const bScore = this.b.score[bIndex];
            if (bScore > this.maxBScore) {
                this.maxBScore = bScore;
            }
        }

        for (let aIndex = 0; aIndex < this.pointCount; aIndex++) {
            // Track max A score
            const aScore = this.a.score[aIndex];
            if (aScore > this.maxAScore) {
                this.maxAScore = aScore;
            }
            const aPair = availablePoints[aIndex].pair;
            const wrongDirection = aPair.a !== availablePoints[aIndex];

            for (let bIndex = 0; bIndex < this.pointCount; bIndex++) {
                const bScore = this.b.score[bIndex];

                if (bIndex === aIndex) {
                    continue;
                }

                // Basic score is sum of individual scores
                let score = aScore + bScore;

                if (aPair !== availablePoints[bIndex].pair) {
                    score *= FuzzyComparer.SCOREMULTI_NOT_PAIR;
                } else if (wrongDirection) {
                    score *= FuzzyComparer.SCOREMULTI_WRONG_DIRECTION;
                }

                this.scores[aIndex][bIndex] = score;
            }
        }

        this.bestScore = -1;
    }

    public scoreAvailable(otherPoints: Point[], mustBeOver: number) {
        // If it hasn't changed since last time, do nothing
        if (this.bestScore > 0) {
            return;
        }
        // If we can't possibly achieve a better score than the current best,
        // return
        if (this.maxAScore + this.maxBScore < mustBeOver) {
            return;
        }

        // Consider all combinations of point A and B
        this.bestScore = -1;
        // 			int loopCount = 0;
        for (let aIndex = 0; aIndex < this.pointCount; aIndex++) {
            const aScore = this.a.sortedScore[aIndex];
            const aPointIndex = aScore.index;
            if (aScore.score + this.maxBScore < mustBeOver
                || otherPoints[aPointIndex] === null) {
                // If A score + any B score can't beat min score, then continue, or
                // also if point is done
                continue;
            }

            const correspondingScores = this.scores[aPointIndex];
            for (let bIndex = 0; bIndex < this.pointCount; bIndex++) {
                const bScore = this.b.sortedScore[bIndex];
                const bPointIndex = bScore.index;
                if (bPointIndex === aPointIndex || otherPoints[bPointIndex] === null) {
                    continue;
                }

                // 					loopCount++;

                // Basic score is sum of individual scores
                const score = correspondingScores[bPointIndex];

                // Is this best?
                if (score > this.bestScore) {
                    this.bestScore = score;
                    this.bestAIndex = aPointIndex;
                    this.bestBIndex = bPointIndex;

                    if (this.bestScore > mustBeOver) {
                        mustBeOver = this.bestScore;
                    }
                }
            }
        }

        // 			System.err.println(loopCount + "/" + (pointCount * pointCount));

    }
}

// tslint:disable-next-line:max-classes-per-file
export class ScoreAndIndex {

    public score: number;
    public index: number;
    public used: boolean;

    public compare(th: ScoreAndIndex, o: ScoreAndIndex): number {
        if (o.score > th.score) {
            return 1;
        } else if (o.score < th.score) {
            return -1;
        } else {
            return th.index - o.index;
        }
    }
}

// tslint:disable-next-line:max-classes-per-file
export class Point {
    public static SIMILAR_RANGE = 13;

    public x: number;
    public y: number;
    public xLess: number;
    public xMore: number;
    public xSimilar: number;
    public yLess: number;
    public yMore: number;
    public ySimilar: number;

    public pair: Pair;

    public score: number[];
    public sortedScore: ScoreAndIndex[];
    public preSortedScore: ScoreAndIndex[];
    public best: number[] = []; // new int[FuzzyComparer.BEST_SCORES_SORT_FIRST];

    constructor(x: number, y: number) {
        this.x = Math.trunc((x + 0.5) * 255);
        this.y = Math.trunc((y + 0.5) * 255);
    }

    public setPair(pair: Pair) {
        this.pair = pair;
    }

    public count(allPoints: Point[]) {
        for (const point of allPoints) {
            if (point !== this) {
                if (point.x < this.x - Point.SIMILAR_RANGE) {
                    this.xLess++;
                } else if (point.x > this.x + Point.SIMILAR_RANGE) {
                    this.xMore++;
                } else {
                    this.xSimilar++;
                }

                if (point.y < this.y - Point.SIMILAR_RANGE) {
                    this.yLess++;
                } else if (point.y > this.y + Point.SIMILAR_RANGE) {
                    this.yMore++;
                } else {
                    this.ySimilar++;
                }
            }
        }
    }

    public initDrawn(maxStrokes: number) {
        // Initialise the array only once per drawn character
        this.score = []; // new int[maxStrokes * 2];
        this.sortedScore = []; // new ScoreAndIndex[maxStrokes * 2];
        this.preSortedScore = []; // new ScoreAndIndex[maxStrokes * 2 + 1];
        for (let i = 0; i < maxStrokes * 2; i++) {
            this.preSortedScore[i] = new ScoreAndIndex();
        }
        // Dummy score to use for 'best' marker
        this.preSortedScore[maxStrokes * 2] = new ScoreAndIndex();
    }

    public calcScore(otherPoints: Point[], maxScore: number) {
        for (let i = 0; i < FuzzyComparer.BEST_SCORES_SORT_FIRST; i++) {
            this.best[i] = this.preSortedScore.length - 1;
        }
        let worstBestScore = 0;
        for (let i = 0; i < otherPoints.length; i++) {
            const other = otherPoints[i];

            // Work out difference between each element of these points
            const difference = Math.abs(this.xLess - other.xLess)
                + Math.abs(this.xMore - other.xMore) + Math.abs(this.xSimilar - other.xSimilar)
                + Math.abs(this.yLess - other.yLess) + Math.abs(this.yMore - other.yMore)
                + Math.abs(this.ySimilar - other.ySimilar);

            const thisScore = maxScore - difference;
            this.preSortedScore[i].index = i;
            this.preSortedScore[i].score = thisScore;
            this.preSortedScore[i].used = false;
            this.score[i] = thisScore;

            if (thisScore >= worstBestScore) {
                let bestIndex = 0;
                for (; bestIndex < FuzzyComparer.BEST_SCORES_SORT_FIRST - 1; bestIndex++) {
                    if (thisScore > this.preSortedScore[this.best[bestIndex]].score) {
                        break;
                    }
                }
                for (let moveIndex = FuzzyComparer.BEST_SCORES_SORT_FIRST - 1; moveIndex > bestIndex; moveIndex--) {
                    this.best[moveIndex] = this.best[moveIndex - 1];
                }
                this.best[bestIndex] = i;
                if (bestIndex === FuzzyComparer.BEST_SCORES_SORT_FIRST - 1) {
                    worstBestScore = thisScore;
                }
            }
        }

        for (let i = 0; i < FuzzyComparer.BEST_SCORES_SORT_FIRST; i++) {
            this.sortedScore[i] = this.preSortedScore[this.best[i]];
            this.preSortedScore[this.best[i]].used = true;
        }

        let index = FuzzyComparer.BEST_SCORES_SORT_FIRST;
        for (let i = 0; i < otherPoints.length; i++) {
            if (!this.preSortedScore[i].used) {
                this.sortedScore[index++] = this.preSortedScore[i];
            }
        }
        // 			System.err.println(Arrays.toString(sortedScore));

        // 			for(int i=otherPoints.length; i<sortedScore.length; i++)
        // 			{
        // 				sortedScore[i] = new ScoreAndIndex(0, i);
        // 			}
        //
        // 			// Sort score into order
        // 			Arrays.sort(sortedScore);
    }
}
