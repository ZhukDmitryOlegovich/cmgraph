import { SimpleComplex, SimpleFraction } from '../math/index.js';
import { AnimationFrame } from './AnimationFrame.js';
// eslint-disable-next-line import/prefer-default-export
export class AnimationControl {
    constructor(app, OKS, actions) {
        this.app = app;
        this.OKS = OKS;
        this.actions = actions;
        this.lastState = 0;
        this.OKSS = [this.OKS];
        this.animFrames = actions
            .concat([['move', new SimpleComplex(new SimpleFraction(0n))]])
            .map((action) => {
            const animFrame = new AnimationFrame(app, this.OKSS[this.OKSS.length - 1], action);
            this.OKSS.push(animFrame.tos);
            return animFrame;
        });
        console.log(this);
    }
    getActions() { return this.actions; }
    setData(newOKS = this.OKS, newActions = this.actions) {
        const newAC = new AnimationControl(this.app, newOKS, newActions);
        this.OKS = newAC.OKS;
        this.animFrames = newAC.animFrames;
        this.activeAnimFrame?.stop();
        this.activeAnimFrame = undefined;
        this.lastState = newAC.lastState;
        this.app = newAC.app;
        this.OKS = newAC.OKS;
        this.actions = newAC.actions;
        this.state = this.lastState;
    }
    get maxState() { return this.actions.length; }
    isCorrectState(state) { return 0 <= state && state <= this.maxState; }
    set state(nowState) {
        this.lastState = nowState;
        if (!this.isCorrectState(nowState)) {
            throw new Error(`AnimationControl.state: state = {${nowState}} incorrect for maxState = {${this.maxState}}`);
        }
        const ind = Math.floor(nowState);
        if (this.animFrames[ind] !== this.activeAnimFrame) {
            // console.log(ind, this.animFrames[ind]);
            // console.log(this.activeAnimFrame);
            this.activeAnimFrame?.stop();
            this.activeAnimFrame = this.animFrames[ind];
            this.activeAnimFrame.start(nowState - ind); // todo: .?
            // console.log(this.activeAnimFrame);
        }
        else {
            this.activeAnimFrame.rerender(nowState - ind); // todo: .?
        }
        // console.log({ nowState, ind });
    }
    get state() { return this.lastState; }
}
