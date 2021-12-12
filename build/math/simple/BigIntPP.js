import { SimpleFraction } from './SimpleFraction.js';
export class BigIntPP {
    // eslint-disable-next-line no-useless-constructor, no-empty-function
    constructor(value) {
        this.value = value;
    }
    static create(b) {
        return (b instanceof BigIntPP ? b : new BigIntPP(b));
    }
    static value(b) {
        return (b instanceof BigIntPP ? b.value : b);
    }
    toString() { return this.value.toString(); }
    valueOf() { return this.value; }
    eq(b) { return this.value === BigIntPP.value(b); }
    lt(b) { return this.value < BigIntPP.value(b); }
    add(b) { return new BigIntPP(this.value + BigIntPP.value(b)); }
    sub(b) { return new BigIntPP(this.value - BigIntPP.value(b)); }
    mul(b) { return new BigIntPP(this.value * BigIntPP.value(b)); }
    div(b) { return SimpleFraction.create(this.value, BigIntPP.value(b)); }
}
