import { GridMap } from './grid';
import { ELifeState, Conway } from './conway';

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

let state: {
    width: number;
    height: number;
    isPaused: boolean;
    framerate: number;
    tileSize: number;
    seed: string;
} = { isPaused: true, framerate: 30, width: 512, height: 512, tileSize: 4, seed: "xq4_3482h8a"};

function loadConway() {
    const render = new CanvasRender({
        id: '_conway_render',
        tileSize: state.tileSize,
        width: state.width,
        height: state.height,
    });
    const conway = new Conway({width: Math.floor(state.width / state.tileSize), height: Math.floor(state.height / state.tileSize), apgcode: state.seed == "" ? undefined : state.seed });
    
    function worldLoop() {
        if (!state.isPaused) {
            simulate();
        }
        setTimeout(() => {
            requestAnimationFrame(worldLoop);
        }, 1000 / state.framerate);
    }
    function renderMap() {
        render.renderMap(conway.grid, (v) => {
            switch (v) {
                case ELifeState.Dead:
                    return '#FFF';
                case ELifeState.Alive:
                    return '#000';
            }
        });
    }
    function simulate() {
        conway.step();
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
    const apglink = document.getElementById("apglink") as HTMLDivElement;

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
        if (state.seed == "") apglink.textContent = "";
        else apglink.textContent = `https://catagolue.hatsya.com/object/${state.seed}/b3s23`;
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
