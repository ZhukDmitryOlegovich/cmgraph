export class ClipperError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        Object.setPrototypeOf(this, ClipperError.prototype);
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}
