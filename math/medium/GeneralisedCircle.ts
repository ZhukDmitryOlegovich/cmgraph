import { SimpleComplex, SimpleFraction } from '../simple';

interface OperationDLO {
	eq(c: any): boolean;
	get inverse(): OperationDLO;
	rotateAndScale(c: SimpleComplex): OperationDLO;
	move(c: SimpleComplex): OperationDLO;
}

export class LineThroughZero implements OperationDLO {
	// eslint-disable-next-line no-useless-constructor
	constructor(public c: SimpleComplex) { /* */ }

	eq = (lts: any): boolean => lts instanceof LineThroughZero && this.c.сollinearity(lts.c);

	get inverse(): LineThroughZero {
		return new LineThroughZero(this.c.inverse);
	}

	rotateAndScale = (c: SimpleComplex): LineThroughZero => new LineThroughZero(this.c.mul(c));

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
	constructor(public c: SimpleComplex) {}

	eq = (nzl: any): boolean => nzl instanceof NonZeroLine && this.c.eq(nzl.c);

	// eslint-disable-next-line no-use-before-define
	get inverse(): Сircle {
		const core = this.c.inverse.div(2n);
		// eslint-disable-next-line no-use-before-define
		return new Сircle(core, core.length);
	}

	rotateAndScale = (c: SimpleComplex): NonZeroLine => new NonZeroLine(this.c.mul(c));

	move(c: SimpleComplex): LineThroughZero | NonZeroLine {
		const core = c.add(this.c).projection(this.c);
		return core.eq(0n)
			? new LineThroughZero(this.c)
			: new NonZeroLine(core);
	}
}

export class Сircle implements OperationDLO {
	// eslint-disable-next-line no-useless-constructor, no-empty-function
	constructor(public c: SimpleComplex, public r: SimpleFraction) {}

	eq = (c: any): boolean => c instanceof Сircle && this.c.eq(c.c) && this.r.eq(c.r);

	get inverse(): Сircle | NonZeroLine {
		if (this.c.length.eq(this.r)) {
			return new NonZeroLine(this.c.mul(2n).inverse);
		}

		if (this.c.eq(0n)) {
			return new Сircle(
				new SimpleComplex(new SimpleFraction(0n), new SimpleFraction(0n)),
				this.r.inverse,
			);
		}

		const { sqrlength } = this.c;
		const div = sqrlength.sub(this.r.pow(2n));

		return new Сircle(
			this.c.inverse.mul(sqrlength.div(div)),
			this.r.div(div.abs),
		);
	}

	rotateAndScale = (c: SimpleComplex): Сircle => new Сircle(
		this.c.mul(c), this.r.mul(SimpleComplex.realpart(c)),
	);

	move = (c: SimpleComplex): Сircle => new Сircle(this.c.add(c), this.r);
}

export type GeneralisedCircle = LineThroughZero | NonZeroLine | Сircle;
