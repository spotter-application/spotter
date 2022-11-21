/**
 * Returns a random float between given min and max bounds (inclusive)
 * @param min Minimum value of the ranfom float
 * @param max Maximum value of the random float
 */
export declare function randomFloat(min: number, max: number): number;
/**
 * Complicated math. All you need to know is that it returns a random number.
 * More info: https://en.wikipedia.org/wiki/Normal_distribution
 */
export declare function gaussRandom(): number;
export declare namespace gaussRandom {
    var returnV: boolean;
    var vVal: number;
}
/**
 * Returns a random integer between given min and max bounds
 * @param min Minimum value of the random integer
 * @param max Maximum value of the random integer
 */
export declare function randomInteger(min: number, max: number): number;
/**
 * If you know what this is: https://en.wikipedia.org/wiki/Normal_distribution
 * @param mu
 * @param std
 */
export declare function randomN(mu: number, std: number): number;
//# sourceMappingURL=random.d.ts.map