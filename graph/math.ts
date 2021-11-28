import PIXI from 'pixi.js';

import {
	Circle, GeneralisedCircle, LineThroughZero, NonZeroLine, SimpleComplex,
} from '@/math';

const defZoom = 100;

export const createCircle = (
	{ c, r2 }: Circle, pc = new PIXI.Circle(), zoom = defZoom,
): PIXI.Circle => {
	const [realpart, imagpart] = SimpleComplex.value(c);
	pc.x = zoom * realpart.valueOf();
	pc.y = -zoom * imagpart.valueOf();
	pc.radius = zoom * Math.sqrt(r2.valueOf());
	return pc;
};

export const setCircle = (
	pc: PIXI.Circle, x: number, y: number, r: number, zoom = defZoom,
): PIXI.Circle => {
	pc.x = zoom * x;
	pc.y = -zoom * y;
	pc.radius = zoom * r;
	return pc;
};

export type AppSizeOpt = {
	left: number,
	right: number,
	top: number,
	bottom: number,
};

export const setLine = (
	pp: PIXI.Polygon, x0: number, y0: number, xn: number, yn: number, {
		left, right, top, bottom,
	}: AppSizeOpt = {
		left: -400, right: 400, top: 400, bottom: -400,
	}, zoom = defZoom,
): PIXI.Polygon => {
	x0 *= zoom;
	y0 *= zoom;
	xn *= zoom;
	yn *= zoom;

	const p0 = right - x0 - yn * (top - y0) / -xn;
	const p1 = top - y0 + xn * (left - x0) / yn;
	const p2 = -left + x0 + yn * (bottom - y0) / -xn;
	const p3 = -bottom + y0 - xn * (right - x0) / yn;

	const width = right - left;
	const height = top - bottom;

	pp.points = [
		(0 <= p0 && p0 < width ? [right - p0, -top] : []),
		(0 <= p1 && p1 < height ? [left, -(top - p1)] : []),
		(0 <= p2 && p2 < width ? [left + p2, -bottom] : []),
		(0 <= p3 && p3 < height ? [right, -(bottom + p3)] : []),
	].flat();

	return pp;
};

export const setLineThroughZero = (
	pp: PIXI.Polygon, x: number, y: number, opt?: AppSizeOpt, zoom = defZoom,
): PIXI.Polygon => setLine(pp, 0, 0, x, y, opt, zoom);

export const createLineThroughZero = (
	{ c }: LineThroughZero, opt?: AppSizeOpt, zoom = defZoom,
) => setLineThroughZero(
	new PIXI.Polygon(),
	...(SimpleComplex.value(c).map((e) => e.valueOf()) as [number, number]),
	opt,
	zoom,
);

export const setNonZeroLine = (
	pp: PIXI.Polygon, x: number, y: number, opt?: AppSizeOpt, zoom = defZoom,
) => setLine(pp, x, y, x, y, opt, zoom);

export const createNonZeroLine = (
	{ c }: NonZeroLine, opt?: AppSizeOpt, zoom = defZoom,
) => setNonZeroLine(
	new PIXI.Polygon(),
	...(SimpleComplex.value(c).map((e) => e.valueOf()) as [number, number]),
	opt,
	zoom,
);

export const createGeneralisedCircle = (c: GeneralisedCircle, opt?: AppSizeOpt) => (
	// eslint-disable-next-line no-nested-ternary
	c instanceof Circle
		? createCircle(c)
		: c instanceof NonZeroLine
			? createNonZeroLine(c, opt)
			: createLineThroughZero(c, opt)
);
