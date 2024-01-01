import { Vector2 } from './utils';

export enum EGridMapErrorType {
    EOUT_OF_BOUNDS = 'EOUT_OF_BOUNDS',
}

export class GridMapError extends Error {
    constructor(err: EGridMapErrorType) {
        super(err);
    }
    public static OutOfBounds(): GridMapError {
        return new GridMapError(EGridMapErrorType.EOUT_OF_BOUNDS);
    }
}

export class GridMap<T> {
    public readonly width: number;
    public readonly height: number;
    private _arr: T[];
    constructor(width: number, height: number, default_value: T) {
        this.width = width;
        this.height = height;
        this._arr = Array(width * height).fill(default_value);
    }
    public *iter(): IterableIterator<[number, T]> {
        for (let i = 0; i < this._arr.length; i++) {
            const v = this._arr[i];
            yield [i, v];
        }
    }
    public *iter_coords(): IterableIterator<[Vector2, T]> {
        for (let i = 0; i < this._arr.length; i++) {
            const v = this._arr[i];
            yield [{ x: this.getX(i), y: this.getY(i) }, v];
        }
    }
    public getNeighbors(x: number, y: number): T[] {
        const res: T[] = [];
        for (let iy = -1; iy <= 1; iy++) {
            for (let ix = -1; ix <= 1; ix++) {
                if (ix == 0 && iy == 0) continue;
                const nx = x + ix;
                const ny = y + iy;
                if (nx < 0 || nx >= this.width) continue;
                if (ny < 0 || ny >= this.height) continue;
                res.push(this.get(nx, ny));
            }
        }
        return res;
    }
    public getX(idx: number): number {
        return idx % this.width;
    }
    public getY(idx: number): number {
        return Math.floor(idx / this.width);
    }
    public getIdx(x: number, y: number): number {
        return x + this.width * y;
    }
    public get(x: number, y: number): T {
        const idx = this.getIdx(x, y);
        if (idx >= this._arr.length || idx < 0)
            throw GridMapError.OutOfBounds();
        return this._arr[idx];
    }
    public set(x: number, y: number, value: T): void {
        const idx = this.getIdx(x, y);
        if (idx >= this._arr.length || idx < 0)
            throw GridMapError.OutOfBounds();
        this._arr[idx] = value;
    }
}
