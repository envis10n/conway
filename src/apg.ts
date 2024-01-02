import { Vector2 } from "./utils";

export enum ApgPattern {
    StillLife,
    Oscillator,
    Spaceship,
}

class Bytes {
    private index: number = 0;
    constructor(private bytes: Uint8Array) {
        console.log(bytes);
    }
    public next(): number | null {
        if (this.index >= this.bytes.length) return null;
        const res = this.bytes[this.index];
        this.index++;
        return res;
    }
}

const CHAR_MAP: {[key: string]: number} = ((): {[key: string]: number} => {
    const res: {[key: string]: number} = {};
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
    for (const char of chars) {
        res[char] = char.codePointAt(0) || -1;
    }
    return res;
})();

export class Wechsler {
    public bytes: Bytes;
    public position: Vector2 = {x: 0, y: 0};
    public current_strip: number = 0;
    public index: number = 5;
    constructor(text: string) {
        this.bytes = new Bytes(new Uint8Array(text.split('').map(v => v.charCodeAt(0))));
    }
    [Symbol.iterator] = this.iter;
    public *iter() {
        while (true) {
            console.log("WECHSLER LOOP");
            if (this.index < 5) {
                while(this.index < 5) {
                    if ((this.current_strip & 1) << this.index == 0) {
                        this.index += 1;
                        if (this.index == 5) {
                            this.position.x += 1;
                            break;
                        }
                    } else {
                        let cell: Vector2 = {x: this.position.x, y: this.position.y + this.index};
                        this.index += 1;
                        if (this.index == 5) {
                            this.position.x += 1;
                        }
                        yield cell;
                    }
                }
            } else {
                const n = this.bytes.next();
                if (n == null) break;
                if (n == CHAR_MAP["0"]) this.position.x += 1;
                else if (n >= CHAR_MAP["1"] && n <= CHAR_MAP["9"]) {
                    this.current_strip = n - CHAR_MAP["0"];
                    this.index = 0;
                } 
                else if (n >= CHAR_MAP["a"] && n <= CHAR_MAP["v"]) {
                    this.current_strip = n - CHAR_MAP["a"] + 10;
                    this.index = 0;
                }
                else if (n == CHAR_MAP["w"]) this.position.x += 2;
                else if (n == CHAR_MAP["x"]) this.position.x += 3;
                else if (n == CHAR_MAP["y"]) {
                    const n2 = this.bytes.next();
                    let c = n;
                    if (n2 == null) throw new Error("Unexpected character.");
                    if (n2 >= CHAR_MAP["0"] && n2 <= CHAR_MAP["9"]) c = n - CHAR_MAP["0"];
                    else if (n2 >= CHAR_MAP["a"] && n2 <= CHAR_MAP["z"]) c = n - CHAR_MAP["a"] + 10;
                    else throw new Error("Unexpected character.");
                    this.position.x += 4 + c;
                }
                else if (n == CHAR_MAP["z"]) {
                    this.position.x = 0;
                    this.position.y += 5;
                }
                else throw new Error("Unexpected character.");
            }
        }
    }
}

export class ApgCode {
    public readonly source: string;
    public readonly pattern: ApgPattern;
    public readonly period: number;
    private wechsler: Wechsler;
    constructor(text: string) {
        this.source = text;
        let split = text.split("_");
        const prefix = split.shift();
        if (prefix == undefined) throw new Error("Unencodable");

        const ptype = prefix.substring(0, 2);
        if (ptype == "xs") this.pattern = ApgPattern.StillLife;
        else if (ptype == "xp") this.pattern = ApgPattern.Oscillator;
        else if (ptype == "xq") this.pattern = ApgPattern.Spaceship;
        else throw new Error("Unencodable");
        
        if (this.pattern == ApgPattern.StillLife) this.period = 1;
        else {
            this.period = parseInt(prefix.substring(2));
        }
        const wechsler_string = split.shift();
        if (wechsler_string == undefined) throw new Error("Unencodable");
        this.wechsler = new Wechsler(wechsler_string);
    }
    public *iter() {
        for (const res of this.wechsler.iter()) {
            if (res != undefined) yield res;
        }
    }
}