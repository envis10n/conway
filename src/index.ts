import { GridMap } from './grid';
import { Perlin, Rng } from './utils';
import { ApgCode } from './apg';

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
        const opts: CanvasRenderOptions = Object.assign(
            { width: 512, height: 512, id: '_canvas_render', tileSize: 16 },
            options,
        );
        let canvas = document.getElementById(opts.id);
        if (canvas != null) {
            canvas.remove();
            canvas = null;
        }
        if (canvas == null) {
            canvas = document.createElement('canvas');
            canvas.id = opts.id;
            canvas.setAttribute('width', opts.width.toString());
            canvas.setAttribute('height', opts.height.toString());
            document.body.appendChild(canvas);
        }
        this.tileSize = opts.tileSize;
        this.width = opts.width;
        this.height = opts.height;
        this._canvas = canvas as HTMLCanvasElement;
        const ctx = this._canvas.getContext('2d');
        if (ctx == null) throw new Error('Unable to get context.');
        this._ctx = ctx;
    }
    public makeTileSet<T>(fill: T): GridMap<T> {
        return new GridMap(
            Math.floor(this.width / this.tileSize),
            Math.floor(this.height / this.tileSize),
            fill,
        );
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
    Alive,
}

function getLivingNeighbors(
    x: number,
    y: number,
    grid: GridMap<LifeState>,
): number {
    return grid.getNeighbors(x, y).filter((v) => v == LifeState.Alive).length;
}

function getDeadNeighbors(
    x: number,
    y: number,
    grid: GridMap<LifeState>,
): number {
    return grid.getNeighbors(x, y).filter((v) => v == LifeState.Dead).length;
}

function step(grid: GridMap<LifeState>) {
    const updates: Array<[number,number,LifeState]> = [];
    for (const [pos, state] of grid.iter_coords()) {
        let _state = state;
        const living = getLivingNeighbors(pos.x, pos.y, grid);
        if (living < 2 || living > 3) _state = LifeState.Dead;
        else if (_state == LifeState.Dead && living == 3)
            _state = LifeState.Alive;
        if (_state != state)
            updates.push([pos.x,pos.y,_state]);
    }
    // Update the field.
    for (const [x,y,state] of updates) {
        grid.set(x,y,state);
    }
}

let state: {
    width: number;
    height: number;
    isPaused: boolean;
    framerate: number;
    tileSize: number;
    seed: string;
} = { isPaused: true, framerate: 30, width: 512, height: 512, tileSize: 4, seed: "xq4_3482h8a"};

function parseSeed(text: string): Array<[number,number]> {
    const gridWidth = Math.floor(state.width / state.tileSize);
    const gridHeight = Math.floor(state.height / state.tileSize);
    const seed: Array<[number,number]> = [];
    function getNum(char: string): number {
        let res = parseInt(char);
        if (isNaN(res)) res = char.codePointAt(0) || 0;
        return res;
    }
    let temp = "";
    for (const char of text) {
        if (temp.length > 0) {
            seed.push([getNum(temp) % gridWidth,getNum(char) % gridHeight]);
            temp = "";
        } else {
            temp = char;
        }
    }
    if (temp.length > 0) {
        seed.push([getNum(temp) % gridWidth, 0]);
    }
    return seed;
}

function loadConway() {
    const render = new CanvasRender({
        id: '_conway_render',
        tileSize: state.tileSize,
        width: state.width,
        height: state.height,
    });
    const map = render.makeTileSet<LifeState>(LifeState.Dead);
    if (state.seed == "" || true) {
        const perlin = new Perlin(true);
        const rng = Rng.Rng16();
        for (const [pos, _] of map.iter_coords()) {
            const np = perlin.noise(pos.x, pos.y);
            if (np > 0.5 && rng.randomBool(0.35)) map.set(pos.x, pos.y, LifeState.Alive);
        }
    } else {
        const agp = new ApgCode(state.seed);
        for (const pos of agp.iter()) {
            map.set(pos.x + Math.floor(map.width / 2), pos.y + (Math.floor(map.height / 2)), LifeState.Alive);
        }
    }
    function worldLoop() {
        if (!state.isPaused) {
            simulate();
        }
        setTimeout(() => {
            requestAnimationFrame(worldLoop);
        }, 1000 / state.framerate);
    }
    function renderMap() {
        render.renderMap(map, (v) => {
            switch (v) {
                case LifeState.Dead:
                    return '#FFF';
                case LifeState.Alive:
                    return '#000';
            }
        });
    }
    function simulate() {
        step(map);
        renderMap();
    }
    renderMap();
    worldLoop();
}

window.onload = () => {
    const rangeWidth = document.getElementById(
        'rangeWidth',
    ) as HTMLInputElement;
    const widthLabel = document.getElementById(
        'widthValue',
    ) as HTMLLabelElement;
    const rangeHeight = document.getElementById(
        'rangeHeight',
    ) as HTMLInputElement;
    const heightLabel = document.getElementById(
        'heightValue',
    ) as HTMLLabelElement;
    const rangeTileSize = document.getElementById(
        'rangeTileSize',
    ) as HTMLInputElement;
    const tileValue = document.getElementById('tileValue') as HTMLLabelElement;
    const updateBtn = document.getElementById(
        'buttonUpdate',
    ) as HTMLButtonElement;
    const pauseBtn = document.getElementById(
        'buttonPauseToggle',
    ) as HTMLButtonElement;
    const inpFPS = document.getElementById("inpFPS") as HTMLInputElement;
    const seedText = document.getElementById("seedText") as HTMLInputElement;

    widthLabel.textContent = rangeWidth.value;
    heightLabel.textContent = rangeHeight.value;
    tileValue.textContent = rangeTileSize.value;

    rangeWidth.onchange = (ev) => {
        widthLabel.textContent = rangeWidth.value;
    };

    rangeHeight.onchange = (ev) => {
        heightLabel.textContent = rangeHeight.value;
    };

    inpFPS.onchange = (ev) => {
        const nfps: number = parseInt(inpFPS.value);
        if (!isNaN(nfps)) state.framerate = nfps;
    }

    rangeTileSize.onchange = (ev) => {
        tileValue.textContent = rangeTileSize.value;
    };

    function setupConway() {
        state.height = rangeHeight.valueAsNumber;
        state.width = rangeWidth.valueAsNumber;
        state.tileSize = rangeTileSize.valueAsNumber;
        let seedval = seedText.value.trim();
        state.seed = seedval
        state.isPaused = true;
        const nfps = parseInt(inpFPS.value);
        state.framerate = isNaN(nfps) ? state.framerate : nfps;
        pauseBtn.textContent = 'Simulate';
        loadConway();
    }

    updateBtn.onclick = () => {
        setupConway();
    };

    pauseBtn.onclick = () => {
        state.isPaused = !state.isPaused;
        pauseBtn.textContent = state.isPaused ? 'Simulate' : 'Pause';
    };

    setupConway();
};
