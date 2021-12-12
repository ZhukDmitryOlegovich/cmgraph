/* import PIXI from 'pixi.js'; */
import { FillNonZeroLine, SimpleComplex, } from '../math/index.js';
import { defZoom, lineInRect } from './math.js';
export const setFillLine = (pp, x0, y0, xn, yn, opt) => {
    const { indexes, points, customOpt } = lineInRect(x0, y0, xn, yn, opt);
    console.log({ indexes, points });
    if (indexes.length !== 2) {
        console.log({
            x0, xn, y0, yn, xs: Math.sign(x0 * xn), ys: Math.sign(y0 * yn),
        });
        pp.points = Math.sign(x0 * xn) <= 0 && Math.sign(y0 * yn) <= 0
            ? [
                customOpt.right, customOpt.top,
                customOpt.left, customOpt.top,
                customOpt.left, customOpt.bottom,
                customOpt.right, customOpt.bottom,
            ]
            : [];
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
        ansPoints.push((i + 1) % 4 <= 1 ? customOpt.right : customOpt.left, i <= 1 ? customOpt.bottom : customOpt.top);
    }
    ansPoints.push(xmin, ymin);
    pp.points = ansPoints;
    return pp;
};
export const setFillLineThroughZero = (pp, x, y, forward, opt) => setFillLine(pp, 0, 0, x * (forward ? 1 : -1), y * (forward ? 1 : -1), opt);
export const createFillLineThroughZero = ({ ltz: { c }, forward }, opt, zoom = defZoom) => setFillLineThroughZero(new PIXI.Polygon(), ...SimpleComplex.value(c).map((e) => e.valueOf()), forward, opt);
export const setFillNonZeroLine = (pp, x, y, forward, opt) => setFillLine(pp, x, y, x * (forward ? 1 : -1), y * (forward ? 1 : -1), opt);
export const createFillNonZeroLine = ({ nzl: { c }, forward }, opt) => setFillNonZeroLine(new PIXI.Polygon(), ...SimpleComplex.value(c).map((e) => e.valueOf()), forward, opt);
export const createPole = ({ left, top, right, bottom, } = {
    left: -4, right: 4, top: 4, bottom: -4,
}) => {
    left *= defZoom * 1.1;
    right *= defZoom * 1.1;
    top *= defZoom * 1.1;
    bottom *= defZoom * 1.1;
    return new PIXI.Rectangle(left, top, right - left, top - bottom);
};
export const createFillGeneralisedCircle = (fc, opt) => (fc instanceof FillNonZeroLine
    ? createFillNonZeroLine(fc, opt)
    : createFillLineThroughZero(fc, opt));
