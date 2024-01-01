// Encoding
/**
 * Decode a byte array into a hex string.
 * @param {Uint8Array} input The input bytes to decode.
 * @returns {string} The decoded string.
 */
export function decodeToString(input: Uint8Array): string {
    const temp: string[] = [];
    for (const v of input) {
        temp.push(v.toString(16).padStart(2, '0'));
    }
    return temp.join('');
}

export function hex2int(input: Uint8Array): number {
    return parseInt(decodeToString(input));
}

export type Vector2 = { x: number; y: number };

export function lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
}

/**
 * Helper class for Rng and other random functions.
 */
export class Rng {
    public readonly bits: number;
    public readonly byteLength: number;
    public readonly RAND_MAX: number;
    public readonly SIGNED_MAX: number;
    public readonly SIGNED_MIN: number;
    /**
     * Create a default 32-bit Rng instance.
     */
    constructor();
    /**
     * Create an Rng instance with a chosen bit depth.
     * @param {number} bits
     */
    constructor(bits: number);
    constructor(bits?: number) {
        this.bits = bits || 32;
        if (this.bits % 8 != 0)
            throw new Error('Bits must be in increments of 8.');
        this.byteLength = this.bits / 8;
        this.RAND_MAX = parseInt('FF'.repeat(this.byteLength), 16);
        this.SIGNED_MAX = Math.floor(this.RAND_MAX / 2);
        this.SIGNED_MIN = this.SIGNED_MAX - this.RAND_MAX;
    }
    /**
     * An 8-bit Rng instance.
     * @returns {Rng}
     */
    public static Rng8(): Rng {
        return new Rng(8);
    }
    /**
     * A 16-bit Rng instance.
     * @returns {Rng}
     */
    public static Rng16(): Rng {
        return new Rng(16);
    }
    /**
     * A 32-bit Rng instance.
     * @returns {Rng}
     */
    public static Rng32(): Rng {
        return new Rng(32);
    }
    /**
     * A 64-bit Rng instance.
     * @returns {Rng}
     */
    public static Rng64(): Rng {
        return new Rng(64);
    }
    /**
     * Generate a random value between 0.0 and 1.0 using the crypto library and this instance's bit depth.
     * @returns {number}
     */
    public random(): number {
        return (
            parseInt(
                decodeToString(
                    crypto.getRandomValues(new Uint8Array(this.byteLength)),
                ),
                16,
            ) / this.RAND_MAX
        );
    }
    /**
     * Generate a random integer between `SIGNED_MIN` and `SIGNED_MAX`.
     */
    public randomInt(): number;
    /**
     * Generate a random integer between `SIGNED_MIN` and `max`.
     * @param {number} max The upper bound of the generation.
     */
    public randomInt(max: number): number;
    /**
     * Generate a random integer between `min` and `max`.
     * @param {number} max The upper bound of the generation.
     * @param {number} min The lower bound of the generation.
     */
    public randomInt(max: number, min: number): number;
    public randomInt(
        max: number = this.SIGNED_MAX,
        min: number = this.SIGNED_MIN,
    ): number {
        if (max > this.SIGNED_MAX || max % 1 != 0)
            throw new Error(
                'Maximum should be an integer <= ' + this.SIGNED_MAX,
            );
        if (min < this.SIGNED_MIN || min % 1 != 0)
            throw new Error(
                'Minimum should be and integer >= ' + this.SIGNED_MIN,
            );
        return Math.round(this.random() * (max - min) + min);
    }
    /**
     * Generate a random unsigned integer between `0` and `RAND_MAX`.
     */
    public randomUInt(): number;
    /**
     * Generate a random unsigned integer between `0` and `max`.
     * @param {number} max The upper bound of the generation.
     */
    public randomUInt(max: number): number;
    /**
     * Generate a random unsigned integer between `min` and `max`.
     * @param {number} max The upper bound of the generation.
     * @param {number} min The lower bound of the generation.
     */
    public randomUInt(max: number, min: number): number;
    public randomUInt(max: number = this.RAND_MAX, min: number = 0): number {
        if (max > this.RAND_MAX || max % 1 != 0)
            throw new Error('Maximum should be an integer <= ' + this.RAND_MAX);
        if (min < 0 || min % 1 != 0)
            throw new Error('Minimum should be an integer >= 0');
        return Math.round(this.random() * (max - min) + min);
    }
    /**
     * Generate a random boolean.
     */
    public randomBool(): boolean;
    /**
     * Generate a random weighted boolean.
     * @param {number} weight The 'chance' of the result being true.
     */
    public randomBool(weight: number): boolean;
    public randomBool(weight: number = 0.5): boolean {
        if (weight > 1 || weight < 0)
            throw new Error('Weight should be a value between 0.0 and 1.0');
        return this.random() <= weight;
    }
    public randomGradient(ix: number, iy: number): Vector2 {
        const w: number = this.RAND_MAX;
        const s: number = Math.floor(w / 2);
        let a = ix;
        let b = iy;
        a *= 3284157443;
        b = b ^ ((a << s) | (a >> (w - s)));
        b *= 1911520717;
        a = a ^ ((b << 5) | (b >> (w - s)));
        a *= 2048419325;
        let r = a * Math.PI;
        const res: Vector2 = { x: 0, y: 0 };
        res.x = Math.cos(r);
        res.y = Math.sin(r);
        return res;
    }
}

export class Perlin {
    public readonly rng: Rng = Rng.Rng16();
    private _permutation: number[] = [
        151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
        140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247,
        120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57,
        177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74,
        165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
        60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
        65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
        200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3,
        64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85,
        212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170,
        213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43,
        172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185,
        112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191,
        179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
        181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150,
        254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195,
        78, 66, 215, 61, 156, 180,
    ];
    private _p: number[] = new Array(512);
    public get permutation(): number[] {
        return new Array(...this._permutation);
    }
    constructor(rand?: boolean) {
        if (rand) {
            this._permutation.sort(() => (this.rng.randomBool() ? -1 : 1));
        }
        for (let i = 0; i < 256; i++) {
            this._p[i] = this._permutation[i];
            this._p[256 + i] = this._p[i];
        }
    }
    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    private grad(hash: number, x: number, y: number, z: number) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h == 12 || h == 14 ? x : z;
        return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
    }
    public noise(x: number, y: number): number {
        let z = 10;
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this._p[X] + Y;
        const AA = this._p[A] + Z;
        const AB = this._p[A + 1] + Z;
        const B = this._p[X + 1] + Y;
        const BA = this._p[B] + Z;
        const BB = this._p[B + 1] + Z;
        return lerp(
            w,
            lerp(
                v,
                lerp(
                    u,
                    this.grad(this._p[AA], x, y, z), // AND ADD
                    this.grad(this._p[BA], x - 1, y, z),
                ), // BLENDED
                lerp(
                    u,
                    this.grad(this._p[AB], x, y - 1, z), // RESULTS
                    this.grad(this._p[BB], x - 1, y - 1, z),
                ),
            ), // FROM  8
            lerp(
                v,
                lerp(
                    u,
                    this.grad(this._p[AA + 1], x, y, z - 1), // CORNERS
                    this.grad(this._p[BA + 1], x - 1, y, z - 1),
                ), // OF CUBE
                lerp(
                    u,
                    this.grad(this._p[AB + 1], x, y - 1, z - 1),
                    this.grad(this._p[BB + 1], x - 1, y - 1, z - 1),
                ),
            ),
        );
    }
}
