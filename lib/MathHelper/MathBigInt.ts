// eslint-disable-next-line import/prefer-default-export
export class MathBigInt {
	public static sign(a: bigint): bigint {
		return (a === 0n ? 0n : 1n) * (a > 0n ? 1n : -1n);
	}
}
