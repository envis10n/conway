import { ApgCode, Apg } from "./apg";
import { GridMap } from "./grid";
import { Perlin, Rng } from "./utils";

export enum ELifeState {
    Dead,
    Alive,
}

export type IConwayConfig = {
    width: number;
    height: number;
    apgcode?: string;
}

export class Conway {
    public grid: GridMap<ELifeState>;
    public apg?: ApgCode;
    constructor(config: IConwayConfig);
    constructor(t: IConwayConfig) {
        this.grid = new GridMap(t.width, t.height, ELifeState.Dead);
        if (t.apgcode == undefined) {
            const perlin = new Perlin(true);
            const rng = Rng.Rng16();
            for (const [pos, _] of this.grid.iter_coords()) {
                const np = perlin.noise(pos.x, pos.y);
                if (np > 0.5 && rng.randomBool(0.35)) this.grid.set(pos.x, pos.y, ELifeState.Alive);
            }
        } else {
            this.apg = new ApgCode(t.apgcode);
            console.log(this.apg);
            const wx = Math.floor(this.grid.width / 2) - 5;
            const hx = Math.floor(this.grid.height / 2) - 5;
            for (const [pos, v] of this.apg.iter()) {
                this.grid.set(wx + pos.x, hx + pos.y, v);
            }
        }
    }
    public getLivingNeighbors(
        x: number,
        y: number,
    ): number {
        return this.grid.getNeighbors(x, y).filter((v) => v == ELifeState.Alive).length;
    }
    public getDeadNeighbors(
        x: number,
        y: number,
    ): number {
        return this.grid.getNeighbors(x, y).filter((v) => v == ELifeState.Dead).length;
    }
    public step() {
        const updates: Array<[number,number,ELifeState]> = [];
        for (const [pos, state] of this.grid.iter_coords()) {
            let _state = state;
            const living = this.getLivingNeighbors(pos.x, pos.y);
            if (living < 2 || living > 3) _state = ELifeState.Dead;
            else if (_state == ELifeState.Dead && living == 3)
                _state = ELifeState.Alive;
            if (_state != state)
                updates.push([pos.x,pos.y,_state]);
        }
        // Update the field.
        for (const [x,y,state] of updates) {
            this.grid.set(x,y,state);
        }
    }
}