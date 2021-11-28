import PIXI from 'pixi.js';

import {
	Circle, GeneralisedCircle, LineThroughZero, NonZeroLine, SimpleComplex,
} from '@/math';

import { Color } from './color';
import { createFillStyle, createLineStyle } from './create';
import {
	AppSizeOpt,
	createGeneralisedCircle, setCircle, setLineThroughZero, setNonZeroLine,
} from './math';
import { GraphicsGeometryPP } from './pixipp';

export type ActionTypeZero = 'inverse';
export type ActionTypeOne = 'rotateAndScale' | 'move';
export type ActionType = ActionTypeZero | ActionTypeOne;
export type Action = [ActionTypeZero] | [ActionTypeOne, SimpleComplex];

export class AnimationFrame {
	public tos: GeneralisedCircle[] = [];

	private gg: GraphicsGeometryPP;

	private g: PIXI.Graphics;

	private isStart = false;

	public rerenderArr: ((proc: number) => void)[] = [];

	constructor(
		private app: PIXI.Application,
		froms: GeneralisedCircle[],
		private action: Action,
	) {
		// console.log({ from, action });

		const graphicsData: PIXI.GraphicsData[] = [];

		const opt: AppSizeOpt | undefined = action[0] === 'move'
			? ((): AppSizeOpt => {
				const [moverealpart, moveimagpart] = SimpleComplex.value(action[1]);

				const xm = moverealpart.valueOf() * 100;
				const ym = moveimagpart.valueOf() * 100;

				console.log({ xm, ym });

				this.rerenderArr = [
					(proc) => this.g.position.copyFrom({
						x: 400 + xm * proc,
						y: 400 - ym * proc,
					}),
				];

				return {
					left: -400 - Math.abs(xm),
					right: 400 + Math.abs(xm),
					top: 400 + Math.abs(ym),
					bottom: -400 - Math.abs(ym),
				};
			})()
			: undefined;

		for (const from of froms) {
			const to = action[0] === 'inverse' ? from[action[0]] : from[action[0]](action[1]);
			this.tos.push(to);

			// console.log({ to: this.to, indes: AnimationFrame.index++ });

			const gd = new PIXI.GraphicsData(
				createGeneralisedCircle(from, opt),
				createFillStyle({ color: Color('gray'), alpha: 0.25 }),
				createLineStyle({ color: Color('black'), width: 2, alpha: 1 }),
			);
			graphicsData.push(gd);

			if (action[0] === 'move') {
				// eslint-disable-next-line no-continue
				continue;
			}

			if (from instanceof Circle && gd.shape instanceof PIXI.Circle) {
				const c = gd.shape;
				if (action[0] === 'rotateAndScale' || (action[0] === 'inverse' && to instanceof Circle)) {
					if (!(to instanceof Circle)) {
						AnimationFrame.throwErrorConstructorReturnType();
					}

					const [fromrealpart, fromimagpart] = SimpleComplex.value(from.c);
					const [torealpart, toimagpart] = SimpleComplex.value(to.c);

					const x0 = fromrealpart.valueOf();
					const y0 = fromimagpart.valueOf();
					const r0 = Math.sqrt(from.r2.valueOf());

					const x1 = torealpart.valueOf();
					const y1 = toimagpart.valueOf();
					const r1 = Math.sqrt(to.r2.valueOf());

					if (action[0] === 'inverse') {
						this.rerenderArr.push((proc) => {
							setCircle(
								c,
								x0 + (x1 - x0) * proc,
								y0 + (y1 - y0) * proc,
								r0 + (r1 - r0) * proc,
							);
						});
					} else {
						const a0 = Math.atan2(y0, x0);
						const b0 = Math.sqrt(x0 ** 2 + y0 ** 2);
						const a1 = Math.atan2(y1, x1);
						const b1 = Math.sqrt(x1 ** 2 + y1 ** 2);

						this.rerenderArr.push((proc) => {
							const bp = b0 + (b1 - b0) * proc;
							const ap = a0 + (a1 - a0) * proc;

							setCircle(
								c,
								bp * Math.cos(ap),
								bp * Math.sin(ap),
								r0 + (r1 - r0) * proc,
							);
						});
					}
				} else {
				// console.warn(from, action[0], this.to, c);
					if (!(to instanceof NonZeroLine)) {
						AnimationFrame.throwErrorConstructorReturnType();
					}

					const [fromrealpart, fromimagpart] = SimpleComplex.value(from.c);
					const [torealpart, toimagpart] = SimpleComplex.value(to.c);

					const x0 = fromrealpart.valueOf();
					const y0 = fromimagpart.valueOf();
					const r0 = Math.sqrt(from.r2.valueOf());

					const xt = torealpart.valueOf();
					const yt = toimagpart.valueOf();
					const rt = Math.sqrt(xt ** 2 + yt ** 2);

					const max = 1000;

					const x1 = xt / rt * max;
					const y1 = yt / rt * max;
					const r1 = Math.sqrt((x1 - xt) ** 2 + (y1 - yt) ** 2);

					// console.log({
					// 	x0, y0, r0, x1, y1, r1,
					// });

					this.rerenderArr.push((proc) => {
						// todo: более медленный рост радиуса
						setCircle(
							c,
							x0 + (x1 - x0) * proc,
							y0 + (y1 - y0) * proc,
							r0 + (r1 - r0) * proc,
						);
					});
				}
			} else if (from instanceof NonZeroLine && gd.shape instanceof PIXI.Polygon) {
				if (action[0] === 'inverse') {
					const donor = new AnimationFrame(app, [to], ['inverse']);
					this.rerenderArr.push((proc) => donor.rerenderArr[0](1 - proc));
					// eslint-disable-next-line no-continue
					continue;
				}
				const c = gd.shape;

				const [fromrealpart, fromimagpart] = SimpleComplex.value(from.c);
				const [torealpart, toimagpart] = to instanceof LineThroughZero
					? [0, 0]
					: SimpleComplex.value(to.c);

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

					setNonZeroLine(
						c,
						bp * Math.cos(ap),
						bp * Math.sin(ap),
					);
				});
			} else if (from instanceof LineThroughZero && gd.shape instanceof PIXI.Polygon) {
				if (action[0] === 'inverse') {
					const donor = new AnimationFrame(app, [from], ['rotateAndScale', to.c.div(from.c)]);
					this.rerenderArr.push(donor.rerenderArr[0]);
					// eslint-disable-next-line no-continue
					continue;
				}

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

					setLineThroughZero(
						c,
						bp * Math.cos(ap),
						bp * Math.sin(ap),
					);
				});
			} else {
				console.warn(this, { from, action });

				throw new Error('fatal');
			}
		}

		this.gg = new GraphicsGeometryPP(...graphicsData);

		this.g = new PIXI.Graphics(this.gg);

		this.g.position.copyFrom({ x: 400, y: 400 });
	}

	rerender(proc: number) {
		AnimationFrame.checkProcAndThrowError(proc);

		this.rerenderArr.forEach((r) => { r(proc); });

		if (this.action[0] !== 'move') {
			this.gg.rerender();
		}
	}

	static checkProcAndThrowError(proc: number) {
		if (proc < 0 || proc >= 1) throw new Error(`AnimationFrame.rerender: proc = {${proc}} incorrect`);
	}

	static throwErrorConstructorReturnType(): never {
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
