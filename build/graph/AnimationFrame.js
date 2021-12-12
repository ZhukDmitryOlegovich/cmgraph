/* import PIXI from 'pixi.js'; */
import { Circle, LineThroughZero, NonZeroLine, SimpleComplex, } from '../math/index.js';
import { Color } from './color.js';
import { createFillStyle, createLineStyle } from './create.js';
import { createGeneralisedCircle, defZoom, setCircle, setLineThroughZero, } from './math.js';
import { GraphicsGeometryPP } from './pixipp.js';
export class AnimationFrame {
    constructor(app, froms, action) {
        this.app = app;
        this.action = action;
        this.tos = [];
        this.isStart = false;
        this.rerenderArr = [];
        const graphicsData = [];
        if (action[0] === 'move') {
            const [moverealpart, moveimagpart] = SimpleComplex.value(action[1]);
            const xm = moverealpart.valueOf();
            const ym = moveimagpart.valueOf();
            this.rerenderArr = [
                (proc) => this.g.position.copyFrom({
                    x: (4 + xm * proc) * defZoom,
                    y: (4 - ym * proc) * defZoom,
                }),
            ];
            const opt = {
                left: -4 - Math.abs(xm),
                right: 4 + Math.abs(xm),
                top: 4 + Math.abs(ym),
                bottom: -4 - Math.abs(ym),
            };
            for (const from of froms) {
                this.tos.push(from[action[0]](action[1]));
                graphicsData.push(new PIXI.GraphicsData(createGeneralisedCircle(from, opt), createFillStyle({ color: Color('gray'), alpha: 0.25 }), createLineStyle({ color: Color('black'), width: 2, alpha: 1 })));
            }
        }
        else if (action[0] === 'rotateAndScale') {
            const [rotateAndScaleRealpart, rotateAndScaleImagpart] = SimpleComplex.value(action[1]);
            const xm = rotateAndScaleRealpart.valueOf();
            const ym = rotateAndScaleImagpart.valueOf();
            const phi = Math.atan2(-ym, xm);
            const needScale = Math.sqrt(xm ** 2 + ym ** 2);
            const [fromScale, toScale] = needScale <= 1 ? [1, needScale] : [1 / needScale, 1];
            const minScale = Math.min(fromScale, toScale);
            const lineStyle = createLineStyle({ color: Color('black'), width: 2, alpha: 1 });
            const startWidth = lineStyle.width;
            this.rerenderArr = [
                (proc) => {
                    this.g.rotation = phi * proc;
                    const currentScale = fromScale + (toScale - fromScale) * proc;
                    this.g.scale.copyFrom({ x: currentScale, y: currentScale });
                    lineStyle.width = startWidth / currentScale;
                },
            ];
            const opt = {
                left: -4 / minScale * Math.SQRT2,
                right: 4 / minScale * Math.SQRT2,
                top: 4 / minScale * Math.SQRT2,
                bottom: -4 / minScale * Math.SQRT2,
                zoom: 1 / fromScale,
            };
            console.log({ opt, fromScale, toScale });
            for (const from of froms) {
                this.tos.push(from[action[0]](action[1]));
                graphicsData.push(new PIXI.GraphicsData(createGeneralisedCircle(from, opt), createFillStyle({ color: Color('gray'), alpha: 0.25 }), lineStyle));
            }
        }
        else {
            for (const from of froms) {
                const to = from[action[0]];
                this.tos.push(to);
                // console.log({ to: this.to, indes: AnimationFrame.index++ });
                const gd = new PIXI.GraphicsData(createGeneralisedCircle(from), createFillStyle({ color: Color('gray'), alpha: 0.25 }), createLineStyle({ color: Color('black'), width: 2, alpha: 1 }));
                graphicsData.push(gd);
                if (from instanceof Circle && gd.shape instanceof PIXI.Circle) {
                    if (to instanceof Circle) {
                        const [fromrealpart, fromimagpart] = SimpleComplex.value(from.c);
                        const [torealpart, toimagpart] = SimpleComplex.value(to.c);
                        const x0 = fromrealpart.valueOf();
                        const y0 = fromimagpart.valueOf();
                        const r0 = Math.sqrt(from.r2.valueOf());
                        const x1 = torealpart.valueOf();
                        const y1 = toimagpart.valueOf();
                        const r1 = Math.sqrt(to.r2.valueOf());
                        this.rerenderArr.push((proc) => {
                            setCircle(gd.shape, x0 + (x1 - x0) * proc, y0 + (y1 - y0) * proc, r0 + (r1 - r0) * proc);
                        });
                    }
                    else if (to instanceof NonZeroLine) {
                        const [fromrealpart, fromimagpart] = SimpleComplex.value(from.c);
                        const [torealpart, toimagpart] = SimpleComplex.value(to.c);
                        const x0 = fromrealpart.valueOf();
                        const y0 = fromimagpart.valueOf();
                        const r0 = Math.sqrt(from.r2.valueOf());
                        const xt = torealpart.valueOf();
                        const yt = toimagpart.valueOf();
                        const rt = Math.sqrt(xt ** 2 + yt ** 2);
                        const max = 100;
                        const x1 = xt / rt * max;
                        const y1 = yt / rt * max;
                        const r1 = Math.sqrt((x1 - xt) ** 2 + (y1 - yt) ** 2);
                        // console.log({
                        // 	x0, y0, r0, x1, y1, r1,
                        // });
                        this.rerenderArr.push((proc) => {
                            // todo: более медленный рост радиуса
                            setCircle(gd.shape, x0 + (x1 - x0) * proc, y0 + (y1 - y0) * proc, r0 + (r1 - r0) * proc);
                        });
                    }
                    else {
                        AnimationFrame.throwErrorConstructorReturnType();
                    }
                }
                else if (from instanceof NonZeroLine && gd.shape instanceof PIXI.Polygon) {
                    const donor = new AnimationFrame(app, [to], ['inverse']);
                    graphicsData.pop();
                    graphicsData.push(donor.gg.graphicsData[0]);
                    this.rerenderArr.push((proc) => donor.rerenderArr[0](1 - proc));
                }
                else if (from instanceof LineThroughZero && gd.shape instanceof PIXI.Polygon) {
                    const c = gd.shape;
                    const [fromrealpart, fromimagpart] = SimpleComplex.value(from.c);
                    const [torealpart, toimagpart] = SimpleComplex.value(to.c);
                    const x0 = fromrealpart.valueOf();
                    const y0 = fromimagpart.valueOf();
                    const x1 = torealpart.valueOf();
                    const y1 = toimagpart.valueOf();
                    const a0 = Math.atan2(y0, x0);
                    const b0 = Math.sqrt(x0 ** 2 + y0 ** 2);
                    const a1 = Math.atan2(y1, x1);
                    const b1 = Math.sqrt(x1 ** 2 + y1 ** 2);
                    this.rerenderArr.push((proc) => {
                        const bp = b0 + (b1 - b0) * proc;
                        const ap = a0 + (a1 - a0) * proc;
                        setLineThroughZero(c, bp * Math.cos(ap), bp * Math.sin(ap));
                    });
                    // const donor = new AnimationFrame(app, [from], ['rotateAndScale', to.c.div(from.c)]);
                    // this.rerenderArr.push(donor.rerenderArr[0]);
                }
                else {
                    console.warn(this, { from, action });
                    throw new Error('fatal');
                }
            }
        }
        // const gd = new PIXI.GraphicsData(
        // 	createFillGeneralisedCircle(
        // 		new FillNonZeroLine(
        // 			new NonZeroLine(new SimpleComplex(
        // 				new SimpleFraction(5n), new SimpleFraction(5n),
        // 			)),
        // 			false,
        // 		),
        // 	),
        // 	createFillStyle({ color: Color('greenyellow'), alpha: 0.25 }),
        // 	createLineStyle({ color: Color('black'), width: 2, alpha: 1 }),
        // );
        // graphicsData.push(gd);
        this.gg = new GraphicsGeometryPP(...graphicsData);
        this.g = new PIXI.Graphics(this.gg);
        this.g.position.copyFrom({ x: 400, y: 400 });
    }
    rerender(proc) {
        AnimationFrame.checkProcAndThrowError(proc);
        this.rerenderArr.forEach((r) => { r(proc); });
        if (this.action[0] !== 'move') {
            this.gg.rerender();
        }
    }
    static checkProcAndThrowError(proc) {
        if (proc < 0 || proc >= 1)
            throw new Error(`AnimationFrame.rerender: proc = {${proc}} incorrect`);
    }
    static throwErrorConstructorReturnType() {
        throw new Error('AnimationFrame.constructor: after calculate return incorrect type');
    }
    start(proc = 0) {
        if (this.isStart) {
            throw new Error('AnimationFrame.start: already start');
        }
        this.isStart = true;
        this.rerender(proc);
        this.app.stage.addChild(this.g);
    }
    stop() {
        if (!this.isStart) {
            throw new Error('AnimationFrame.stop: already stop');
        }
        this.isStart = false;
        this.app.stage.removeChild(this.g);
    }
}
