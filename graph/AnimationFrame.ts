import PIXI from 'pixi.js';

import {
	Circle, GeneralisedCircle, LineThroughZero, NonZeroLine, SimpleComplex,
} from '@/math';

import { Color } from './color';
import { createFillStyle, createLineStyle } from './create';
import {
	createGeneralisedCircle, setCircle, setLine, setLineThroughZero, setNonZeroLine,
} from './math';
import { GraphicsGeometryPP } from './pixipp';

export type ActionTypeZero = 'inverse';
export type ActionTypeOne = 'rotateAndScale' | 'move';
export type ActionType = ActionTypeZero | ActionTypeOne;
export type Action = [ActionTypeZero] | [ActionTypeOne, SimpleComplex];

export class AnimationFrame {
	public to: GeneralisedCircle;

	private gd: PIXI.GraphicsData;

	private gg: GraphicsGeometryPP;

	private g: PIXI.Graphics;

	private isStart = false;

	private static index = 0;

	public rerender: (proc: number) => void;

	constructor(
		private app: PIXI.Application,
		from: GeneralisedCircle,
		action: Action,
	) {
		// console.log({ from, action });

		this.to = action[0] === 'inverse' ? from[action[0]] : from[action[0]](action[1]);

		// console.log({ to: this.to, indes: AnimationFrame.index++ });

		this.gd = new PIXI.GraphicsData(
			createGeneralisedCircle(from),
			createFillStyle({ color: Color('gray'), alpha: 0.25 }),
			createLineStyle({ color: Color('black'), width: 2, alpha: 1 }),
		);

		// console.log(this.gd.shape);

		this.gg = new GraphicsGeometryPP(this.gd);

		this.g = new PIXI.Graphics(this.gg);

		this.g.position.copyFrom({ x: 400, y: 400 });

		if (from instanceof Circle && this.gd.shape instanceof PIXI.Circle) {
			const c = this.gd.shape;
			if (action[0] === 'move' || action[0] === 'rotateAndScale' || (action[0] === 'inverse' && this.to instanceof Circle)) {
				if (!(this.to instanceof Circle)) {
					AnimationFrame.throwErrorConstructorReturnType();
				}

				const [fromrealpart, fromimagpart] = SimpleComplex.value(from.c);
				const [torealpart, toimagpart] = SimpleComplex.value(this.to.c);

				const x0 = fromrealpart.valueOf();
				const y0 = fromimagpart.valueOf();
				const r0 = Math.sqrt(from.r2.valueOf());

				const x1 = torealpart.valueOf();
				const y1 = toimagpart.valueOf();
				const r1 = Math.sqrt(this.to.r2.valueOf());

				if (action[0] === 'move' || action[0] === 'inverse') {
					this.rerender = (proc: number) => {
						AnimationFrame.checkProcAndThrowError(proc);

						setCircle(
							c,
							x0 + (x1 - x0) * proc,
							y0 + (y1 - y0) * proc,
							r0 + (r1 - r0) * proc,
						);

						this.gg.rerender();
					};
				} else {
					const a0 = Math.atan2(y0, x0);
					const b0 = Math.sqrt(x0 ** 2 + y0 ** 2);
					const a1 = Math.atan2(y1, x1);
					const b1 = Math.sqrt(x1 ** 2 + y1 ** 2);

					this.rerender = (proc: number) => {
						AnimationFrame.checkProcAndThrowError(proc);

						const bp = b0 + (b1 - b0) * proc;
						const ap = a0 + (a1 - a0) * proc;

						setCircle(
							c,
							bp * Math.cos(ap),
							bp * Math.sin(ap),
							r0 + (r1 - r0) * proc,
						);

						this.gg.rerender();
					};
				}
			} else {
				// console.warn(from, action[0], this.to, c);
				if (!(this.to instanceof NonZeroLine)) {
					AnimationFrame.throwErrorConstructorReturnType();
				}

				const [fromrealpart, fromimagpart] = SimpleComplex.value(from.c);
				const [torealpart, toimagpart] = SimpleComplex.value(this.to.c);

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

				this.rerender = (proc: number) => {
					AnimationFrame.checkProcAndThrowError(proc);

					// todo: более медленный рост радиуса
					setCircle(
						c,
						x0 + (x1 - x0) * proc,
						y0 + (y1 - y0) * proc,
						r0 + (r1 - r0) * proc,
					);

					this.gg.rerender();
				};
			}
		} else if (from instanceof NonZeroLine && this.gd.shape instanceof PIXI.Polygon) {
			if (action[0] === 'inverse') {
				const donor = new AnimationFrame(app, this.to, ['inverse']);
				this.rerender = () => { throw new Error('rerender'); };
				const r = donor.rerender;
				donor.rerender = (proc) => r(1 - proc);
				donor.to = this.to;
				return donor;
			}
			const c = this.gd.shape;

			const [fromrealpart, fromimagpart] = SimpleComplex.value(from.c);
			const [torealpart, toimagpart] = this.to instanceof LineThroughZero
				? [0, 0]
				: SimpleComplex.value(this.to.c);

			const x0 = fromrealpart.valueOf();
			const y0 = fromimagpart.valueOf();

			const x1 = torealpart.valueOf();
			const y1 = toimagpart.valueOf();

			if (action[0] === 'move') {
				this.rerender = (proc: number) => {
					AnimationFrame.checkProcAndThrowError(proc);

					setLine(
						c,
						x0 + (x1 - x0) * proc,
						y0 + (y1 - y0) * proc,
						x0,
						y0,
					);

					this.gg.rerender();
				};
			} else {
				const a0 = Math.atan2(y0, x0);
				const b0 = Math.sqrt(x0 ** 2 + y0 ** 2);
				const a1 = Math.atan2(y1, x1);
				const b1 = Math.sqrt(x1 ** 2 + y1 ** 2);

				this.rerender = (proc: number) => {
					AnimationFrame.checkProcAndThrowError(proc);

					const bp = b0 + (b1 - b0) * proc;
					const ap = a0 + (a1 - a0) * proc;

					setNonZeroLine(
						c,
						bp * Math.cos(ap),
						bp * Math.sin(ap),
					);

					this.gg.rerender();
				};
			}
		} else if (from instanceof LineThroughZero && this.gd.shape instanceof PIXI.Polygon) {
			if (action[0] === 'inverse') {
				const donor = new AnimationFrame(app, from, ['rotateAndScale', this.to.c.div(from.c)]);
				// console.log({ donor, from, to: this.to });
				// donor.gg = this.gg;
				// this.rerender = (proc) => donor.rerender(proc);
				this.rerender = () => { throw new Error('rerender'); };
				donor.to = this.to;
				return donor;
			}

			const c = this.gd.shape;

			const [fromrealpart, fromimagpart] = SimpleComplex.value(from.c);
			const [torealpart, toimagpart] = SimpleComplex.value(this.to.c);

			const x0 = fromrealpart.valueOf();
			const y0 = fromimagpart.valueOf();

			const x1 = torealpart.valueOf();
			const y1 = toimagpart.valueOf();

			if (action[0] === 'move') {
				this.rerender = (proc: number) => {
					AnimationFrame.checkProcAndThrowError(proc);

					setLine(
						c,
						x1 * proc,
						y1 * proc,
						x0,
						y0,
					);

					this.gg.rerender();
				};
			} else {
				const a0 = Math.atan2(y0, x0);
				const b0 = Math.sqrt(x0 ** 2 + y0 ** 2);
				const a1 = Math.atan2(y1, x1);
				const b1 = Math.sqrt(x1 ** 2 + y1 ** 2);

				this.rerender = (proc: number) => {
					AnimationFrame.checkProcAndThrowError(proc);

					const bp = b0 + (b1 - b0) * proc;
					const ap = a0 + (a1 - a0) * proc;

					setLineThroughZero(
						c,
						bp * Math.cos(ap),
						bp * Math.sin(ap),
					);

					this.gg.rerender();
				};
			}
		} else {
			console.warn(this, { from, action });

			throw new Error('fatal');
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
