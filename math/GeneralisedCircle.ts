import { Complex } from './Complex';

interface OperationDLO {
	equal(c: any): boolean;
	get inverse(): OperationDLO;
	rotateAndScale(c: Complex): OperationDLO;
	move(c: Complex): OperationDLO;
}

export class LineThroughZero implements OperationDLO {
	constructor(public c: Complex) {
		this.c = this.c.normalize;
	}

	equal(lts: any): boolean {
		return lts instanceof LineThroughZero && this.c.equal(lts.c);
	}

	get inverse(): LineThroughZero {
		return new LineThroughZero(this.c.inverse);
	}

	rotateAndScale(c: Complex): LineThroughZero {
		return new LineThroughZero(this.c.mul(c).normalize);
	}

	// eslint-disable-next-line no-use-before-define
	move(c: Complex): LineThroughZero | NonZeroLine {
		const core = c.projection(this.c);
		return core.equal(Complex.ZERO)
			? new LineThroughZero(this.c)
			// eslint-disable-next-line no-use-before-define
			: new NonZeroLine(core);
	}
}

export class NonZeroLine implements OperationDLO {
	// eslint-disable-next-line no-useless-constructor, no-empty-function
	constructor(public c: Complex) {}

	equal(nzl: any): boolean {
		return nzl instanceof NonZeroLine && this.c.equal(nzl.c);
	}

	// eslint-disable-next-line no-use-before-define
	get inverse(): Cicle {
		const core = this.c.inverse.divR(2);
		// eslint-disable-next-line no-use-before-define
		return new Cicle(core, core.length);
	}

	rotateAndScale(c: Complex): NonZeroLine {
		return new NonZeroLine(this.c.mul(c));
	}

	move(c: Complex): LineThroughZero | NonZeroLine {
		const core = c.add(this.c).projection(this.c);
		return core.equal(Complex.ZERO)
			? new LineThroughZero(this.c)
			: new NonZeroLine(core);
	}
}

export class Cicle implements OperationDLO {
	// eslint-disable-next-line no-useless-constructor, no-empty-function
	constructor(public c: Complex, public r: number) {}

	equal(c: any): boolean {
		return c instanceof Cicle
			&& this.c.equal(c.c)
			&& Math.abs(this.r - c.r) < Complex.MAX_PRECISION;
	}

	get inverse(): Cicle | NonZeroLine {
		if (Math.abs(this.c.length - this.r) < Complex.MAX_PRECISION) {
			return new NonZeroLine(this.c.mulR(2).inverse);
		}

		if (this.c.equal(Complex.ZERO)) {
			return new Cicle(Complex.ZERO, 1 / this.r);
		}

		const { sqrlength } = this.c;

		return new Cicle(
			this.c.inverse.mulR(sqrlength / (sqrlength - this.r ** 2)),
			this.r / Math.abs(sqrlength - this.r ** 2),
		);
	}

	rotateAndScale(c: Complex): Cicle {
		return new Cicle(this.c.mul(c), this.r * c.r);
	}

	move(c: Complex): Cicle {
		return new Cicle(this.c.add(c), this.r);
	}
}

export type GeneralisedCircle = LineThroughZero | NonZeroLine | Cicle;
