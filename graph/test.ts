import PIXI from 'pixi.js';

// eslint-disable-next-line no-undef
declare const document: Document;

const app = new PIXI.Application({
	antialias: true, backgroundColor: 0xFFFFFF, width: 800, height: 800,
});
document.body.appendChild(app.view);

const createFillStyle = (opt: PIXI.IFillStyleOptions & {visible?: boolean}): PIXI.FillStyle => {
	const ans = new PIXI.FillStyle();
	opt.visible ??= true;

	// @ts-ignore
	Object.entries(opt).forEach(([type, val]) => { if (val) ans[type] = val; });

	return ans;
};

const createLineStyle = (opt: PIXI.ILineStyleOptions & {visible?: boolean}): PIXI.LineStyle => {
	const ans = new PIXI.LineStyle();
	opt.visible ??= true;

	// @ts-ignore
	Object.entries(opt).forEach(([type, val]) => { if (val) ans[type] = val; });

	return ans;
};

const c1 = new PIXI.GraphicsData(
	new PIXI.Circle(0, 0, 50),
	createFillStyle({ color: 0x0000FF }),
	createLineStyle({ width: 1 }),
);

const c2 = new PIXI.GraphicsData(
	new PIXI.Circle(100, 0, 50),
	createFillStyle({ color: 0x00FF00 }),
	c1.lineStyle,
);

const gg = new PIXI.GraphicsGeometry();

gg.graphicsData.push(c1, c2);

const g = new PIXI.Graphics(gg);

app.stage.addChild(g);

// eslint-disable-next-line no-undef
const input = document.getElementById('range') as HTMLInputElement | null;

input?.addEventListener('input', (e) => {
	if (c2.shape instanceof PIXI.Circle) {
		c2.shape.x = Number(input.value);
		// @ts-ignore
		gg.invalidate();
	}
});

// Circle
// graphics.lineStyle(1); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
// const g1 = new PIXI.Graphics()
// 	.lineStyle(1)
// 	.beginFill(0x0000FF)
// 	.drawShape(c1)
// 	.endFill();
// const g2 = new PIXI.Graphics()
// 	.lineStyle(1)
// 	.beginFill(0x00FF00)
// 	.drawCircle(2 * 50, 0, 50)
// 	.endFill();

console.log(
	[
		g.width,
		g.height,
	],
);

// graphics.pivot.copyFrom({ x: graphics.width / 2, y: graphics.height / 2 });
const { width, height } = app.screen;
g.position.copyFrom({ x: width / 2, y: height / 2 });

// g.beginFill(0x00FF00).drawCircle(0, 0, 10).endFill();

console.log(
	[
		g.pivot,
		g.position,
	],
);

let all = 0;
let count = 0;
console.time('delta');

const second = 60;
let speedRotate = 1;

// eslint-disable-next-line no-undef
const speed = document.getElementById('speed') as HTMLInputElement | null;

speed?.addEventListener('input', (e) => {
	if (c2.shape instanceof PIXI.Circle) {
		speedRotate = Number(speed.value);
	}
});

app.ticker.add((delta) => {
	all += delta;
	count += 1;
	if (all >= second) {
		console.timeEnd('delta');
		console.time('delta');
		console.log('count:', count);
		all -= second;
		count = 0;
	}
	g.angle += (delta / second) * (360 / 4) * speedRotate;
});

g.interactive = true;
g.buttonMode = true;

let status = 0;

console.log(g.width, g.height, g.children, g.geometry);

g.on('click', () => {
	status = (status + 1) % 4;
	const { y } = g.pivot;
	g.pivot.copyFrom({ x: 50 * (status % 2 === 1 ? 1 : status), y });
	console.log('click', { status, x: g.pivot.x });
	console.log(g.children, g.geometry);
});
