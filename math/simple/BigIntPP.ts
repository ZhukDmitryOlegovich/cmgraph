import { SimpleFraction } from './SimpleFraction';

export type BigIntPPValue = bigint;

export class BigIntPP {
	// eslint-disable-next-line no-useless-constructor, no-empty-function
	constructor(private value: bigint) { }

	static create(b: BigIntPP | bigint): BigIntPP {
		return (b instanceof BigIntPP ? b : new BigIntPP(b));
	}

	static value(b: BigIntPP | bigint): BigIntPPValue {
		return (b instanceof BigIntPP ? b.value : b);
	}

	toString(): string { return this.value.toString(); }

	valueOf(): bigint { return this.value; }

	eq(b: BigIntPP | bigint): boolean { return this.value === BigIntPP.value(b); }

	lt(b: BigIntPP | bigint): boolean { return this.value < BigIntPP.value(b); }

	add(b: BigIntPP | bigint): BigIntPP { return new BigIntPP(this.value + BigIntPP.value(b)); }

	sub(b: BigIntPP | bigint): BigIntPP { return new BigIntPP(this.value - BigIntPP.value(b)); }

	mul(b: BigIntPP | bigint): BigIntPP { return new BigIntPP(this.value * BigIntPP.value(b)); }

	div(b: BigIntPP | bigint) { return SimpleFraction.create(this.value, BigIntPP.value(b)); }
}
