import p5 from 'p5';

// types
const State = {
    INIT: Symbol(),
    DRAWING_CIRCLE: Symbol(),
    GRANULATING: Symbol(),
    DRAWING_WAVE: Symbol(),
    END: Symbol(),
} as const;
type State = typeof State[keyof typeof State];

function sketch(p: p5) {
    // constants
    const FRAME_RATE = 24;
    const BACKGROUND = p.color(255 - 16, 255 - 8, 255);
    const CIRCLE_COLOR = p.color(255 - 64, 255 - 32, 255 - 16);
    const CIRCLE_PER_PIXEL = 0.00001;
    const CIRCLE_RADIUS_MIN = 100;
    const CIRCLE_RADIUS_MAX = 300;
    const DRAWING_CIRCLE_SPEED = 30;
    const GRANULATING_TIMES = FRAME_RATE * 5;
    const GRANULATING_PER_FRAME = 100;
    const WAVE_RADIUS = 150;
    const WAVE_SPEED = 10;
    const SATELLITE_COUNT = 10;
    const SATELLITE_DELTA_THETA = 0.1;

    // variables
    var state: State = State.INIT;
    const circleList: { x: number, y: number, r: number }[] = [];
    var drawingCircleX = 0;
    var granulatingCount = 0;
    var waveCenter = { x: 0, y: 0 };
    var waveSlope = 0;
    var satelliteList: { r: number, theta: number, phi: number }[] = [];

    function initVariables() {
        state = State.INIT;
        drawingCircleX = 0;
        circleList.length = 0;
        const circleCount = p.width * p.height * CIRCLE_PER_PIXEL;
        for (let i = 0; i < circleCount; i++) {
            circleList.push({
                x: p.random(p.width),
                y: p.random(p.height),
                r: p.random(CIRCLE_RADIUS_MIN, CIRCLE_RADIUS_MAX),
            });
        }
        granulatingCount = 0;
        waveCenter = {x: -WAVE_RADIUS, y: p.random(p.height / 8)};
        waveSlope = p.height / p.width;
        satelliteList.length = 0;
        for (let i = 0; i < SATELLITE_COUNT; i++) {
            satelliteList.push({
                r: p.random(WAVE_RADIUS / 2, WAVE_RADIUS),
                theta: p.random(p.HALF_PI) + ((i < SATELLITE_COUNT / 2) ? p.HALF_PI : 0),
                phi: p.random(p.HALF_PI) + p.QUARTER_PI,
            });
        }
    }

    p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.position(0, 0, "fixed");
        canvas.style("z-index", "-256");
        p.frameRate(24);
        p.background(CIRCLE_COLOR);

        initVariables();
    };

    p.draw = () => {
        switch (state) {
            case State.INIT:
                state = State.DRAWING_CIRCLE;
                break;
            case State.DRAWING_CIRCLE:
                p.push();
                p.clip(() => {
                    for (const circle of circleList) {
                        p.circle(circle.x, circle.y, circle.r);
                    }
                }, { invert: true });
                p.fill(BACKGROUND);
                p.noStroke();
                p.rect(drawingCircleX, 0, DRAWING_CIRCLE_SPEED, p.height);
                drawingCircleX += DRAWING_CIRCLE_SPEED;
                p.pop();
                if (drawingCircleX >= p.width) {
                    state = State.GRANULATING;
                }
                break;
            case State.GRANULATING:
                p.push();
                p.clip(() => {
                    for (const circle of circleList) {
                        p.circle(circle.x, circle.y, circle.r);
                    }
                }, { invert: true });
                const c = p.color(p.random(255), p.random(255), p.random(255));
                p.fill(c);
                p.noStroke();
                for (let i = 0; i < GRANULATING_PER_FRAME; i++) {
                    p.circle(p.random(p.width), p.random(p.height), p.random(1, 2));
                }
                p.pop();
                if (++granulatingCount >= GRANULATING_TIMES) {
                    state = State.DRAWING_WAVE;
                }
                break;
            case State.DRAWING_WAVE:
                const nextWaveCenter = { x: waveCenter.x + WAVE_SPEED, y: waveCenter.y + waveSlope * WAVE_SPEED};
                for (const satellite of satelliteList) {
                    const from = {
                        x: waveCenter.x + satellite.r * p.cos(satellite.theta) * p.cos(satellite.phi),
                        y: waveCenter.y + satellite.r * p.cos(satellite.theta) * p.sin(satellite.phi),
                    }
                    satellite.theta += SATELLITE_DELTA_THETA;
                    const to = {
                        x: nextWaveCenter.x + satellite.r * p.cos(satellite.theta) * p.cos(satellite.phi),
                        y: nextWaveCenter.y + satellite.r * p.cos(satellite.theta) * p.sin(satellite.phi),
                    }
                    p.stroke(p.noise(from.x / 100, from.y/ 100) * 255);
                    p.line(from.x, from.y, to.x, to.y);
                }
                waveCenter = nextWaveCenter;
                if (waveCenter.x >= p.width + WAVE_RADIUS) {
                    state = State.END;
                }
                break;
            case State.END:
                break;
        }
    };
    
    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.background(CIRCLE_COLOR);
        initVariables();
    }
}

new p5(sketch);