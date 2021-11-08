import { SimpleComplex, SimpleFraction } from '@/math/simple';

interface OperationDLO {
	eq(c: any): boolean;
	get inverse(): OperationDLO;
	rotateAndScale(c: SimpleComplex): OperationDLO;
	move(c: SimpleComplex): OperationDLO;
}

export class LineThroughZero implements OperationDLO {
	// eslint-disable-next-line no-useless-constructor
	constructor(public readonly c: SimpleComplex) { /* */ }

	eq(lts: any): boolean {
		return lts instanceof LineThroughZero && this.c.сollinearity(lts.c);
	}

	get inverse(): LineThroughZero {
		return new LineThroughZero(this.c.inverse);
	}

	rotateAndScale(c: SimpleComplex): LineThroughZero {
		return new LineThroughZero(this.c.mul(c));
	}

	// eslint-disable-next-line no-use-before-define
	move(c: SimpleComplex): LineThroughZero | NonZeroLine {
		const core = c.projection(this.c);
		return core.eq(0n)
			? new LineThroughZero(this.c)
			// eslint-disable-next-line no-use-before-define
			: new NonZeroLine(core);
	}
}

export class NonZeroLine implements OperationDLO {
	// eslint-disable-next-line no-useless-constructor, no-empty-function
	constructor(public readonly c: SimpleComplex) {}

	eq(nzl: any): boolean {
		return nzl instanceof NonZeroLine && this.c.eq(nzl.c);
	}

	// eslint-disable-next-line no-use-before-define
	get inverse(): Circle {
		const core = this.c.inverse.div(2n);
		// eslint-disable-next-line no-use-before-define
		return new Circle(core, core.sqrlength);
	}

	rotateAndScale(c: SimpleComplex): NonZeroLine {
		return new NonZeroLine(this.c.mul(c));
	}

	move(c: SimpleComplex): LineThroughZero | NonZeroLine {
		const core = c.add(this.c).projection(this.c);
		return core.eq(0n)
			? new LineThroughZero(this.c)
			: new NonZeroLine(core);
	}
}

export class Circle implements OperationDLO {
	// eslint-disable-next-line no-useless-constructor, no-empty-function
	constructor(public readonly c: SimpleComplex, public readonly r2: SimpleFraction) {}

	eq(c: any): boolean {
		return c instanceof Circle && this.c.eq(c.c) && this.r2.eq(c.r2);
	}

	get inverse(): Circle | NonZeroLine {
		if (this.c.sqrlength.eq(this.r2)) {
			return new NonZeroLine(this.c.mul(2n).inverse);
		}

		if (this.c.eq(0n)) {
			return new Circle(
				new SimpleComplex(new SimpleFraction(0n), new SimpleFraction(0n)),
				this.r2.inverse,
			);
		}

		const { sqrlength } = this.c;
		const div = sqrlength.sub(this.r2);

		return new Circle(
			this.c.inverse.mul(sqrlength.div(div)),
			this.r2.div(div.pow(2n)),
		);
	}

	rotateAndScale(c: SimpleComplex): Circle {
		return new Circle(this.c.mul(c), this.r2.mul(c.sqrlength));
	}

	move(c: SimpleComplex): Circle {
		return new Circle(this.c.add(c), this.r2);
	}
}

export type GeneralisedCircle = LineThroughZero | NonZeroLine | Circle;
