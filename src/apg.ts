import { ELifeState } from "./conway";
import { Vector2 } from "./utils";

export enum ApgPattern {
    StillLife,
    Oscillator,
    Spaceship,
}

export const APG_TABLE: { [key: string]: string } = {
    '0': '00000',
    '1': '00001',
    '2': '00010',
    '3': '00011',
    '4': '00100',
    '5': '00101',
    '6': '00110',
    '7': '00111',
    '8': '01000',
    '9': '01001',
    a: '01010',
    b: '01011',
    c: '01100',
    d: '01101',
    e: '01110',
    f: '01111',
    g: '10000',
    h: '10001',
    i: '10010',
    j: '10011',
    k: '10100',
    l: '10101',
    m: '10110',
    n: '10111',
    o: '11000',
    p: '11001',
    q: '11010',
    r: '11011',
    s: '11100',
    t: '11101',
    u: '11110',
    v: '11111',
};

export const APG_Y_TABLE: { [key: string]: number } = {
    '0': 4,
    '1': 5,
    '2': 6,
    '3': 7,
    '4': 8,
    '5': 9,
    '6': 10,
    '7': 11,
    '8': 12,
    '9': 13,
    a: 14,
    b: 15,
    c: 16,
    d: 17,
    e: 18,
    f: 19,
    g: 20,
    h: 21,
    i: 22,
    j: 23,
    k: 24,
    l: 25,
    m: 26,
    n: 27,
    o: 28,
    p: 29,
    q: 30,
    r: 31,
    s: 32,
    t: 33,
    u: 34,
    v: 35,
    w: 36,
    x: 37,
    y: 38,
    z: 39,
};

export enum EApgEncodeError {
    EUNKNOWN_CHAR = 'EUNKNOWN_CHAR',
}

export class ApgEncodeError extends Error {
    constructor(type: EApgEncodeError) {
        super(type);
    }
    public static get EUNKNOWNED_CHAR(): ApgEncodeError {
        return new ApgEncodeError(EApgEncodeError.EUNKNOWN_CHAR);
    }
}

export class ApgEncoding {
    private index = 0;
    public readonly source: string;
    constructor(source: string) {
        this.source = source;
    }
    private decodeNext(): string | null {
        if (this.index >= this.source.length) return null;
        const current: string | null = this.source[this.index];
        const previous: string | null = this.index < 0
            ? null
            : this.source[this.index - 1];
        this.index++;
        if (!/[0-9a-z]/g.test(current)) {
            throw ApgEncodeError.EUNKNOWNED_CHAR;
        }
        if (previous == 'y') {
            return '0'.repeat(APG_Y_TABLE[current]);
        } else if (current == 'y') {
            return this.decodeNext();
        } else if (current == 'w' || current == 'x') {
            return current == 'w' ? '00' : '000';
        } else {
            return current;
        }
    }
    public decode(): string {
        let res = '';
        for (const v of this.iter()) {
            res += v;
        }
        return res;
    }
    private *iter(): IterableIterator<string> {
        while (true) {
            const n = this.decodeNext();
            if (n == null) break;
            yield n;
        }
    }
}

export class Apg {
    public static parse(code: string): string[][] {
        let te = new ApgEncoding(code).decode();
        const fres: string[][] = [];
        for (const v of te.split('z')) {
            if (v == '') fres.push([]);
            else {
                const res: string[] = [];
                for (const c of v) {
                    res.push(APG_TABLE[c]);
                }
                fres.push(res);
            }
        }
        return fres;
    }
}

export class ApgCode {
    public readonly source: string;
    public readonly pattern: ApgPattern;
    public readonly strips: string[][] = [];
    public readonly period: number;
    constructor(text: string) {
        this.source = text;
        let split = text.split("_");
        const prefix = split.shift();
        const code = split.shift();
        if (prefix == undefined || code == undefined) throw new Error("Unencodable");
        const ptype = prefix.substring(0, 2);
        if (ptype == "xs") this.pattern = ApgPattern.StillLife;
        else if (ptype == "xp") this.pattern = ApgPattern.Oscillator;
        else if (ptype == "xq") this.pattern = ApgPattern.Spaceship;
        else throw new Error("Unencodable");
        if (this.pattern == ApgPattern.StillLife) this.period = 1;
        else {
            this.period = parseInt(prefix.substring(2));
        }
        this.strips = Apg.parse(code);
    }
    public *iter(): IterableIterator<[Vector2, ELifeState]> {
        let x = 0;
        let y = 4;
        let offset = 0;
        for (const pat of this.strips) {
            for (const strip of pat) {
                for (const s of strip.split('').map(v => parseInt(v))) {
                    yield [{x, y: y + offset}, s == 0 ? ELifeState.Dead : ELifeState.Alive];
                    y--;
                }
                y = 4;
                x++;
            }
            x = 0;
            offset += 5;
        }
    }
}