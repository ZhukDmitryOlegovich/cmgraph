import { SimpleComplex, SimpleFraction } from '../simple/index.js';
export class LineThroughZero {
    constructor(c) {
        this.c = c;
        this.c = this.c.simplification;
    }
    eq(lts) {
        return lts instanceof LineThroughZero && this.c.сollinearity(lts.c);
    }
    get inverse() {
        return new LineThroughZero(this.c.inverse);
    }
    rotateAndScale(c) {
        return new LineThroughZero(this.c.mul(c));
    }
    // eslint-disable-next-line no-use-before-define
    move(c) {
        const core = c.projection(this.c);
        return core.eq(0n)
            ? new LineThroughZero(this.c)
            // eslint-disable-next-line no-use-before-define
            : new NonZeroLine(core);
    }
}
export class NonZeroLine {
    constructor(c) {
        this.c = c;
        this.c = this.c.simplification;
    }
    eq(nzl) {
        return nzl instanceof NonZeroLine && this.c.eq(nzl.c);
    }
    // eslint-disable-next-line no-use-before-define
    get inverse() {
        const core = this.c.inverse.div(2n);
        // eslint-disable-next-line no-use-before-define
        return new Circle(core, core.sqrlength);
    }
    rotateAndScale(c) {
        return new NonZeroLine(this.c.mul(c));
    }
    move(c) {
        const core = c.add(this.c).projection(this.c);
        return core.eq(0n)
            ? new LineThroughZero(this.c)
            : new NonZeroLine(core);
    }
}
export class Circle {
    constructor(c, r2) {
        this.c = c;
        this.r2 = r2;
        this.c = this.c.simplification;
        this.r2 = this.r2.simplification;
    }
    eq(c) {
        return c instanceof Circle && this.c.eq(c.c) && this.r2.eq(c.r2);
    }
    get inverse() {
        if (this.c.sqrlength.eq(this.r2)) {
            return new NonZeroLine(this.c.mul(2n).inverse);
        }
        if (this.c.eq(0n)) {
            return new Circle(new SimpleComplex(new SimpleFraction(0n), new SimpleFraction(0n)), this.r2.inverse);
        }
        const { sqrlength } = this.c;
        const div = sqrlength.sub(this.r2);
        return new Circle(this.c.inverse.mul(sqrlength.div(div)), this.r2.div(div.pow(2n)));
    }
    rotateAndScale(c) {
        return new Circle(this.c.mul(c), this.r2.mul(c.sqrlength));
    }
    move(c) {
        return new Circle(this.c.add(c), this.r2);
    }
}
