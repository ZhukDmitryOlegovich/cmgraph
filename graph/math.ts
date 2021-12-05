import PIXI from 'pixi.js';

import {
	Circle, GeneralisedCircle, LineThroughZero, NonZeroLine, SimpleComplex,
} from '@/math';

export const defZoom = 100;

export type AppSizeOpt = {
	left: number,
	right: number,
	top: number,
	bottom: number,
	zoom?: number,
};

export const createCircle = (
	{ c, r2 }: Circle, { zoom = 1 }: Pick<AppSizeOpt, 'zoom'> = {}, pc = new PIXI.Circle(),
): PIXI.Circle => {
	const [realpart, imagpart] = SimpleComplex.value(c);
	pc.x = zoom * realpart.valueOf() * defZoom;
	pc.y = -zoom * imagpart.valueOf() * defZoom;
	pc.radius = zoom * Math.sqrt(r2.valueOf()) * defZoom;
	return pc;
};

export const setCircle = (
	pc: PIXI.Circle, x: number, y: number, r: number, { zoom = 1 }: Pick<AppSizeOpt, 'zoom'> = {},
): PIXI.Circle => {
	pc.x = zoom * x * defZoom;
	pc.y = -zoom * y * defZoom;
	pc.radius = zoom * r * defZoom;
	return pc;
};

export const lineInRect = (
	x0: number, y0: number, xn: number, yn: number, {
		left, right, top, bottom, zoom = 1,
	}: AppSizeOpt = {
		left: -4, right: 4, top: 4, bottom: -4,
	},
) => {
	x0 *= zoom * defZoom;
	y0 *= zoom * defZoom;
	xn *= zoom * defZoom;
	yn *= zoom * defZoom;

	left *= defZoom * 1.1;
	right *= defZoom * 1.1;
	top *= defZoom * 1.1;
	bottom *= defZoom * 1.1;

	const p0 = right - x0 - yn * (top - y0) / -xn;
	const p1 = top - y0 + xn * (left - x0) / yn;
	const p2 = -left + x0 + yn * (bottom - y0) / -xn;
	const p3 = -bottom + y0 - xn * (right - x0) / yn;

	const width = right - left;
	const height = top - bottom;

	const t0 = 0 <= p0 && p0 < width;
	const t1 = 0 <= p1 && p1 < height;
	const t2 = 0 <= p2 && p2 < width;
	const t3 = 0 <= p3 && p3 < height;

	return {
		points: [
			(t0 ? [right - p0, -top] : []),
			(t1 ? [left, -(top - p1)] : []),
			(t2 ? [left + p2, -bottom] : []),
			(t3 ? [right, -(bottom + p3)] : []),
		].flat(),
		indexes: [
			(t0 ? 0 : []),
			(t1 ? 1 : []),
			(t2 ? 2 : []),
			(t3 ? 3 : []),
		].flat(),
		customOpt: {
			left, right, top, bottom,
		} as AppSizeOpt,
	};
};

export const setLine = (
	pp: PIXI.Polygon, x0: number, y0: number, xn: number, yn: number, opt?: AppSizeOpt,
): PIXI.Polygon => {
	pp.points = lineInRect(x0, y0, xn, yn, opt).points;
	return pp;
};

export const setLineThroughZero = (
	pp: PIXI.Polygon, x: number, y: number, opt?: AppSizeOpt,
): PIXI.Polygon => setLine(pp, 0, 0, x, y, opt);

export const createLineThroughZero = (
	{ c }: LineThroughZero, opt?: AppSizeOpt,
) => setLineThroughZero(
	new PIXI.Polygon(),
	...(SimpleComplex.value(c).map((e) => e.valueOf()) as [number, number]),
	opt,
);

export const setNonZeroLine = (
	pp: PIXI.Polygon, x: number, y: number, opt?: AppSizeOpt,
) => setLine(pp, x, y, x, y, opt);

export const createNonZeroLine = (
	{ c }: NonZeroLine, opt?: AppSizeOpt,
) => setNonZeroLine(
	new PIXI.Polygon(),
	...(SimpleComplex.value(c).map((e) => e.valueOf()) as [number, number]),
	opt,
);

export const createGeneralisedCircle = (c: GeneralisedCircle, opt?: AppSizeOpt) => (
	// eslint-disable-next-line no-nested-ternary
	c instanceof Circle
		? createCircle(c, opt)
		: c instanceof NonZeroLine
			? createNonZeroLine(c, opt)
			: createLineThroughZero(c, opt)
);
