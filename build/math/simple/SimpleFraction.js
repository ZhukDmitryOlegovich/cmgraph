/* eslint-disable no-dupe-class-members */
import { BigIntPP } from './BigIntPP.js';
// numerator - числитель
// denominator - знаменатель
export class SimpleFraction {
    constructor(numerator, denominator = 1n) {
        this.numerator = numerator;
        this.denominator = denominator;
        if (denominator === 0n)
            throw new Error('SimpleFraction.constructor: denominator cannot be zero');
        if (denominator < 0n) {
            this.numerator *= -1n;
            this.denominator *= -1n;
        }
    }
    static fromNumber(n) {
        const m = n.toExponential(60).match(/^(-?\d).(\d*?)0*e([+-]\d+)$/);
        if (m === null) {
            throw new Error(`SimpleFraction.fromNumber: ${n} is incorrect number`);
        }
        const [, first, second, exp] = m;
        const len = Number(exp) - second.length;
        return (len >= 0
            ? new SimpleFraction(BigInt(first + second) * 10n ** BigInt(len))
            : new SimpleFraction(BigInt(first + second), 10n ** BigInt(-len))).simplification;
    }
    static numerator(f) { return f.numerator; }
    static denominator(f) { return f.denominator; }
    static create(numerator, denominator) {
        const f = new SimpleFraction(numerator, denominator);
        return f.denominator === 1n ? new BigIntPP(f.numerator) : f;
    }
    eq(value) {
        const [numerator, denominator] = SimpleFraction.value(value);
        return this.denominator * numerator === this.numerator * denominator;
    }
    gt(value) {
        const [numerator, denominator] = SimpleFraction.value(value);
        return this.denominator * numerator > this.numerator * denominator;
    }
    valueOf() {
        let { numerator: n } = this;
        const { denominator: d } = this;
        let s = n < 0n ? '-' : '';
        n = n < 0n ? -n : n;
        s += `${n / d}.`;
        n = (n % d) * 10n;
        // todo: fix s.length
        while (s.length < 310 && n !== 0n) {
            s += `${n / d}`;
            n = (n % d) * 10n;
        }
        return Number(s);
    }
    toString() { return `${this.numerator}${this.denominator === 1n ? '' : `/${this.denominator}`}`; }
    add(value) {
        const [numerator, denominator] = SimpleFraction.value(value);
        return new SimpleFraction(this.numerator * denominator + numerator * this.denominator, this.denominator * denominator);
    }
    sub(value) {
        const [numerator, denominator] = SimpleFraction.value(value);
        return new SimpleFraction(this.numerator * denominator - numerator * this.denominator, this.denominator * denominator);
    }
    mul(value) {
        const [numerator, denominator] = SimpleFraction.value(value);
        return new SimpleFraction(this.numerator * numerator, this.denominator * denominator);
    }
    div(value) {
        const [numerator, denominator] = SimpleFraction.value(value);
        return new SimpleFraction(this.numerator * denominator, this.denominator * numerator);
    }
    pow(value) {
        return new SimpleFraction(this.numerator ** value, this.denominator ** value);
    }
    get inverse() {
        return new SimpleFraction(this.denominator, this.numerator);
    }
    get simplification() {
        let gcd = this.numerator;
        let d = this.denominator;
        while (d)
            [gcd, d] = [d, gcd % d];
        if (this.numerator % gcd || this.denominator % gcd) {
            throw new Error('SimpleFraction.simplification: gcd-fail');
        }
        return new SimpleFraction(this.numerator / gcd, this.denominator / gcd);
    }
    get abs() {
        return new SimpleFraction(this.numerator * (this.numerator < 0n ? -1n : 1n), this.denominator);
    }
}
SimpleFraction.value = (value) => (value instanceof SimpleFraction
    ? [value.numerator, value.denominator]
    : [BigIntPP.value(value), 1n]);
