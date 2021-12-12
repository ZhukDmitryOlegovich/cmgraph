import PIXI from 'pixi.js';

import { clipperLib, window } from '@/graph/clipper';
import { Color } from '@/graph/color';
import { createFillStyle, createLineStyle } from '@/graph/create';
import { createFillGeneralisedCircle, createPole } from '@/graph/fill';
import { AppSizeOpt, createCircle } from '@/graph/math';
import {
	FillCircle, FillGeneralisedCircle, FillLineThroughZero, FillNonZeroLine, OperationDLO,
} from '@/math/medium';
import { SimpleComplex } from '@/math/simple';

export type OperationStackName = 'Intersection' | 'Difference' | 'Xor' | 'Union';
export type OperationStackElement =
	// eslint-disable-next-line no-use-before-define
	[OperationStackName, FillGeneralisedCircle | StackFillGeneralisedCircle];
export type OperationStack = OperationStackElement[];

const arrayToPoints = (array: number[]) => array
	.reduce<{ x: number, y: number }[]>((points, p, i) => {
		if (i % 2 === 0) {
			points.push({ x: Math.round(p), y: NaN });
		} else {
			points[points.length - 1].y = Math.round(p);
		}
		return points;
	}, []);

const clipToPaths = (
	type: OperationStackName, as: PIXI.GraphicsData[], bs: PIXI.GraphicsData[],
) => window.clipper?.clipToPaths({
	clipType: clipperLib.ClipType[type],
	subjectInputs: as.map((a) => ({ data: arrayToPoints(a.points), closed: true })),
	clipInputs: bs.map((b) => ({ data: arrayToPoints(b.points) })),
	subjectFillType: clipperLib.PolyFillType.EvenOdd,
});

export class StackFillGeneralisedCircle implements OperationDLO {
	fillStyle = createFillStyle({ color: Color('aqua'), alpha: 0.5 });

	lineStyle = createLineStyle({ color: Color('black'), alpha: 1, width: 2 });

	// eslint-disable-next-line no-useless-constructor, no-empty-function
	constructor(public firstStateFill: boolean, private stack: OperationStack) { }

	eq(sfgc: any): boolean {
		return sfgc instanceof StackFillGeneralisedCircle
			&& sfgc.firstStateFill === this.firstStateFill
			&& sfgc.stack.every(([op, e], i) => this.stack[i][0] === op && e.eq(this.stack[i][1]));
	}

	get inverse(): StackFillGeneralisedCircle {
		return new StackFillGeneralisedCircle(
			this.firstStateFill,
			this.stack.map(([op, e]) => [op, e.inverse]),
		);
	}

	rotateAndScale(c: SimpleComplex): StackFillGeneralisedCircle {
		return new StackFillGeneralisedCircle(
			this.firstStateFill,
			this.stack.map(([op, e]) => [op, e.rotateAndScale(c)]),
		);
	}

	// eslint-disable-next-line no-use-before-define
	move(c: SimpleComplex): StackFillGeneralisedCircle {
		return new StackFillGeneralisedCircle(
			this.firstStateFill,
			this.stack.map(([op, e]) => [op, e.move(c)]),
		);
	}

	draw(opt?: AppSizeOpt): PIXI.GraphicsData[] {
		let result = this.firstStateFill
			? [new PIXI.GraphicsData(createPole(opt))]
			: [];

		for (const [op, elem] of this.stack) {
			let concat: PIXI.GraphicsData[];
			if (elem instanceof FillCircle) {
				const circle = new PIXI.GraphicsData(
					createCircle(elem.c), this.fillStyle, this.lineStyle,
				);
				if (elem.forward) {
					concat = [circle];
				} else {
					const [gd, ...holes] = this.compareDifference(
						circle,
						new PIXI.GraphicsData(createPole(opt), this.fillStyle, this.lineStyle),
					) ?? [];
					gd.holes = holes;
					concat = [gd];
				}
			} else if (elem instanceof FillLineThroughZero || elem instanceof FillNonZeroLine) {
				concat = [new PIXI.GraphicsData(
					createFillGeneralisedCircle(elem, opt), this.fillStyle, this.lineStyle,
				)];
			} else {
				concat = elem.draw(opt);
			}

			let compare: (a: PIXI.GraphicsData, b: PIXI.GraphicsData) => PIXI.GraphicsData[];
			if (op === 'Intersection') {
				compare = (a, b) => this.compareIntersection(a, b);
			} else if (op === 'Union') {
				compare = (a, b) => this.compareUnion(a, b);
			} else if (op === 'Difference') {
				compare = (a, b) => this.compareDifference(a, b);
			// } else if (op === 'Xor') {
			// 	compare = (a, b) => this.compareXor(a, b);
			} else {
				console.error({ op });
				throw new Error('undefined type: op');
			}

			result = result.flatMap((a) => concat.flatMap((b) => compare(a, b)));
		}

		return result;
	}

	private pathToGraphicsData(holes: PIXI.GraphicsData[]) {
		const self = this;
		return (points: clipperLib.Path) => {
			const gd = new PIXI.GraphicsData(
				new PIXI.Polygon(points), self.fillStyle, self.lineStyle,
			);
			gd.holes = holes;
			return gd;
		};
	}

	private compareIntersection(a: PIXI.GraphicsData, b: PIXI.GraphicsData) {
		return clipToPaths('Intersection', [a], [b])
			?.map(this.pathToGraphicsData([...a.holes, ...b.holes])) ?? [];
	}

	private compareUnion(a: PIXI.GraphicsData, b: PIXI.GraphicsData) {
		return clipToPaths('Union', [a], [b])
			?.map(
				this.pathToGraphicsData([
					...clipToPaths('Difference', a.holes, [b]) ?? [],
					...clipToPaths('Difference', b.holes, [a]) ?? [],
					...clipToPaths('Intersection', a.holes, b.holes) ?? [],
				].map(this.pathToGraphicsData([]))),
			) ?? [];
	}

	private compareDifference(a: PIXI.GraphicsData, b: PIXI.GraphicsData) {
		return [
			...clipToPaths('Difference', [a], [b]) ?? [],
			...clipToPaths('Intersection', [a], b.holes) ?? [],
		].map(this.pathToGraphicsData(a.holes)) ?? [];
	}

	// private compareXor(a: PIXI.GraphicsData, b: PIXI.GraphicsData) {
	// 	return [];
	// }
}
