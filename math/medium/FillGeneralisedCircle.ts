import { SimpleComplex } from '@/math/simple';

import {
	Circle, LineThroughZero, NonZeroLine, OperationDLO,
} from '.';

export class FillLineThroughZero implements OperationDLO {
	// eslint-disable-next-line no-useless-constructor, no-empty-function
	constructor(public readonly ltz: LineThroughZero, public readonly forward: boolean) { }

	eq(flts: any): boolean {
		return flts instanceof FillLineThroughZero
			&& this.forward === flts.forward
			&& this.ltz.eq(flts.ltz);
	}

	get inverse(): FillLineThroughZero {
		return new FillLineThroughZero(this.ltz.inverse, this.forward);
	}

	rotateAndScale(c: SimpleComplex): FillLineThroughZero {
		return new FillLineThroughZero(this.ltz.rotateAndScale(c), this.forward);
	}

	// eslint-disable-next-line no-use-before-define
	move(c: SimpleComplex): FillLineThroughZero | FillNonZeroLine {
		const line = this.ltz.move(c);
		return line instanceof LineThroughZero
			? new FillLineThroughZero(line, this.forward)
			// eslint-disable-next-line no-use-before-define
			: new FillNonZeroLine(
				line,
				this.forward === SimpleComplex.realpart(line.c.div(this.ltz.c)).gt(0n),
			);
	}
}

export class FillNonZeroLine implements OperationDLO {
	// eslint-disable-next-line no-useless-constructor, no-empty-function
	constructor(public readonly nzl: NonZeroLine, public readonly forward: boolean) { }

	eq(fnzl: any): boolean {
		return fnzl instanceof FillNonZeroLine
			&& this.forward === fnzl.forward
			&& this.nzl.eq(fnzl.nzl);
	}

	// eslint-disable-next-line no-use-before-define
	get inverse(): FillCircle {
		// eslint-disable-next-line no-use-before-define
		return new FillCircle(this.nzl.inverse, this.forward);
	}

	rotateAndScale(c: SimpleComplex): FillNonZeroLine {
		return new FillNonZeroLine(this.nzl.rotateAndScale(c), this.forward);
	}

	move(c: SimpleComplex): FillNonZeroLine | FillLineThroughZero {
		const line = this.nzl.move(c);
		return line instanceof LineThroughZero
			? new FillLineThroughZero(line, this.forward)
			: new FillNonZeroLine(
				line,
				this.forward === SimpleComplex.realpart(line.c.div(this.nzl.c)).gt(0n),
			);
	}
}

export class FillCircle implements OperationDLO {
	// eslint-disable-next-line no-useless-constructor, no-empty-function
	constructor(public readonly c: Circle, public readonly forward: boolean) { }

	eq(fc: any): boolean {
		return fc instanceof FillCircle
			&& this.forward === fc.forward
			&& this.c.eq(fc.c);
	}

	get inverse(): FillCircle | FillNonZeroLine {
		const line = this.c.inverse;
		return line instanceof Circle
			? new FillCircle(line, this.forward)
			: new FillNonZeroLine(line, this.forward);
	}

	rotateAndScale(c: SimpleComplex): FillCircle {
		return new FillCircle(this.c.rotateAndScale(c), this.forward);
	}

	move(c: SimpleComplex): FillCircle {
		return new FillCircle(this.c.move(c), this.forward);
	}
}

export type FillGeneralisedCircle = FillLineThroughZero | FillNonZeroLine | FillCircle;
