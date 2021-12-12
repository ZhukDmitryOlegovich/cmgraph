import { SimpleComplex } from '../simple/index.js';
import { Circle, LineThroughZero, } from './index.js';
export class FillLineThroughZero {
    // eslint-disable-next-line no-useless-constructor, no-empty-function
    constructor(ltz, forward) {
        this.ltz = ltz;
        this.forward = forward;
    }
    eq(flts) {
        return flts instanceof FillLineThroughZero
            && this.forward === flts.forward
            && this.ltz.eq(flts.ltz);
    }
    get inverse() {
        return new FillLineThroughZero(this.ltz.inverse, this.forward);
    }
    rotateAndScale(c) {
        return new FillLineThroughZero(this.ltz.rotateAndScale(c), this.forward);
    }
    // eslint-disable-next-line no-use-before-define
    move(c) {
        const line = this.ltz.move(c);
        return line instanceof LineThroughZero
            ? new FillLineThroughZero(line, this.forward)
            // eslint-disable-next-line no-use-before-define
            : new FillNonZeroLine(line, this.forward === SimpleComplex.realpart(line.c.div(this.ltz.c)).gt(0n));
    }
}
export class FillNonZeroLine {
    // eslint-disable-next-line no-useless-constructor, no-empty-function
    constructor(nzl, forward) {
        this.nzl = nzl;
        this.forward = forward;
    }
    eq(fnzl) {
        return fnzl instanceof FillNonZeroLine
            && this.forward === fnzl.forward
            && this.nzl.eq(fnzl.nzl);
    }
    // eslint-disable-next-line no-use-before-define
    get inverse() {
        // eslint-disable-next-line no-use-before-define
        return new FillCircle(this.nzl.inverse, this.forward);
    }
    rotateAndScale(c) {
        return new FillNonZeroLine(this.nzl.rotateAndScale(c), this.forward);
    }
    move(c) {
        const line = this.nzl.move(c);
        return line instanceof LineThroughZero
            ? new FillLineThroughZero(line, this.forward)
            : new FillNonZeroLine(line, this.forward === SimpleComplex.realpart(line.c.div(this.nzl.c)).gt(0n));
    }
}
export class FillCircle {
    // eslint-disable-next-line no-useless-constructor, no-empty-function
    constructor(c, forward) {
        this.c = c;
        this.forward = forward;
    }
    eq(fc) {
        return fc instanceof FillCircle
            && this.forward === fc.forward
            && this.c.eq(fc.c);
    }
    get inverse() {
        const line = this.c.inverse;
        return line instanceof Circle
            ? new FillCircle(line, this.forward)
            : new FillNonZeroLine(line, this.forward);
    }
    rotateAndScale(c) {
        return new FillCircle(this.c.rotateAndScale(c), this.forward);
    }
    move(c) {
        return new FillCircle(this.c.move(c), this.forward);
    }
}
