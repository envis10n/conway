import { GridMap } from "./grid";
import { Perlin, Rng } from "./utils";

export type CanvasRenderOptions = {
    width: number;
    height: number;
    tileSize: number;
    id: string;
};

export class CanvasRender {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    public readonly width: number;
    public readonly height: number;
    public readonly tileSize: number;
    constructor();
    constructor(options: Partial<CanvasRenderOptions>);
    constructor(options: Partial<CanvasRenderOptions> = {}) {
        const opts: CanvasRenderOptions = Object.assign({width: 512, height: 512, id: "_canvas_render", tileSize: 16}, options);
        let canvas = document.getElementById(opts.id);
        if (canvas == null) {
            canvas = document.createElement("canvas");
            canvas.id = opts.id;
            canvas.setAttribute("width", opts.width.toString());
            canvas.setAttribute("height", opts.height.toString());
            document.body.appendChild(canvas);
        } else {
            opts.height = parseInt(canvas.getAttribute("height") || "512");
            opts.width = parseInt(canvas.getAttribute("width") || "512");
            opts.id = canvas.id;
        }
        this.tileSize = opts.tileSize;
        this.width = opts.width;
        this.height = opts.height;
        this._canvas = canvas as HTMLCanvasElement;
        const ctx = this._canvas.getContext("2d");
        if (ctx == null) throw new Error("Unable to get context.");
        this._ctx = ctx;
    }
    public makeTileSet<T>(fill: T): GridMap<T> {
        return new GridMap(Math.floor(this.width / this.tileSize), Math.floor(this.height / this.tileSize), fill);
    }
    public renderMap<T>(map: GridMap<T>, colorize: (v: T) => string) {
        for (const [i, t] of map.iter()) {
            const x = map.getX(i);
            const y = map.getY(i);
            const color = colorize(t);
            this._ctx.fillStyle = color;
            this._ctx.fillRect(
                x * this.tileSize,
                y * this.tileSize,
                this.tileSize,
                this.tileSize,
            );
        }
    }
}

enum LifeState {
    Dead,
    Alive
}

function getLivingNeighbors(x: number, y: number, grid: GridMap<LifeState>): number {
    return grid.getNeighbors(x, y).filter((v) => v == LifeState.Alive).length;
}

function getDeadNeighbors(x: number, y: number, grid: GridMap<LifeState>): number {
    return grid.getNeighbors(x, y).filter((v) => v == LifeState.Dead).length;
}

function step(grid: GridMap<LifeState>) {
    for (const [pos, state] of grid.iter_coords()) {
        let _state = state;
        const living = getLivingNeighbors(pos.x, pos.y, grid);
        if (living < 2 || living > 3) _state = LifeState.Dead;
        else if (_state == LifeState.Dead && living == 3) _state = LifeState.Alive;
        grid.set(pos.x, pos.y, _state);
    }
}

window.onload = () => {
    const rng = Rng.Rng16();
    const perlin = new Perlin(true);
    const render = new CanvasRender({id: "_conway_render", tileSize: 8, width: 1280, height: 512});
    const map = render.makeTileSet<LifeState>(LifeState.Dead);
    for (const [pos, v] of map.iter_coords()) {
        const n = perlin.noise(pos.x, pos.y);
        if (n >= 0.75) map.set(pos.x, pos.y, LifeState.Alive);
    }
    function simulate() {
        step(map);
        render.renderMap(map, (v) => {
            switch (v) {
                case LifeState.Dead:
                    return "#FFF";
                case LifeState.Alive:
                    return "#000";
            }
        });
        setTimeout(() => {
            requestAnimationFrame(simulate);
        }, 1000/60);
    }
    simulate();
};