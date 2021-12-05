import PIXI from 'pixi.js';

import {
	FillCircle, FillGeneralisedCircle, FillLineThroughZero, FillNonZeroLine, SimpleComplex,
} from '@/math';

import { AppSizeOpt, defZoom, lineInRect } from './math';

export const setFillLine = (
	pp: PIXI.Polygon, x0: number, y0: number, xn: number, yn: number, opt?: AppSizeOpt,
): PIXI.Polygon => {
	const { indexes, points, customOpt } = lineInRect(x0, y0, xn, yn, opt);

	console.log({ indexes, points });

	if (indexes.length !== 2) {
		pp.points = [];
		return pp;
	}

	const needSwap = (indexes[1] % 2 === 0 ? indexes[1] - 1 : 0) * xn
	+ (indexes[1] % 2 === 0 ? 0 : indexes[1] - 2) * yn < 0;

	const [xmin, ymin, xmax, ymax] = needSwap
		? [...points.slice(2), ...points.slice(0, 2)]
		: points;
	const [minIndex, maxIndex] = needSwap
		? indexes.reverse()
		: indexes;

	const ansPoints = [xmax, ymax];

	console.log({
		xmin, ymin, xmax, ymax, minIndex, maxIndex, needSwap,
	});

	for (let i = maxIndex; i !== minIndex;) {
		i = (i + 1) % 4;
		console.log({ i });
		ansPoints.push(
			(i + 1) % 4 <= 1 ? customOpt.right : customOpt.left,
			i <= 1 ? customOpt.bottom : customOpt.top,
		);
	}

	ansPoints.push(xmin, ymin);
	pp.points = ansPoints;

	return pp;
};

export const setFillLineThroughZero = (
	pp: PIXI.Polygon, x: number, y: number, forward: boolean, opt?: AppSizeOpt,
): PIXI.Polygon => setFillLine(pp, 0, 0, x * (forward ? 1 : -1), y * (forward ? 1 : -1), opt);

export const createFillLineThroughZero = (
	{ ltz: { c }, forward }: FillLineThroughZero, opt?: AppSizeOpt, zoom = defZoom,
) => setFillLineThroughZero(
	new PIXI.Polygon(),
	...(SimpleComplex.value(c).map((e) => e.valueOf()) as [number, number]),
	forward,
	opt,
);

export const setFillNonZeroLine = (
	pp: PIXI.Polygon, x: number, y: number, forward: boolean, opt?: AppSizeOpt,
) => setFillLine(pp, x, y, x * (forward ? 1 : -1), y * (forward ? 1 : -1), opt);

export const createFillNonZeroLine = (
	{ nzl: { c }, forward }: FillNonZeroLine, opt?: AppSizeOpt,
) => setFillNonZeroLine(
	new PIXI.Polygon(),
	...(SimpleComplex.value(c).map((e) => e.valueOf()) as [number, number]),
	forward,
	opt,
);

export const createFillGeneralisedCircle = (fc: FillGeneralisedCircle, opt?: AppSizeOpt) => (
	// eslint-disable-next-line no-nested-ternary
	fc instanceof FillCircle
		? new PIXI.Polygon() // createCircle(c)
		: fc instanceof FillNonZeroLine
			? createFillNonZeroLine(fc, opt)
			: createFillLineThroughZero(fc, opt)
);
