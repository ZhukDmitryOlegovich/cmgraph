import PIXI from 'pixi.js';

import { GeneralisedCircle, SimpleComplex, SimpleFraction } from '@/math';

import { Action, AnimationFrame } from './AnimationFrame';

// eslint-disable-next-line import/prefer-default-export
export class AnimationControl {
	private OKS: GeneralisedCircle[];

	private animFrames: AnimationFrame[];

	private activeAnimFrame?: AnimationFrame;

	public lastState = 0;

	constructor(
		private app: PIXI.Application,
		private OK: GeneralisedCircle,
		private actions: Action[],
	) {
		this.OKS = [OK];
		this.animFrames = actions
			.concat([['move', new SimpleComplex(new SimpleFraction(0n))]])
			.map((action) => {
				const animFrame = new AnimationFrame(app, this.OKS[this.OKS.length - 1], action);
				this.OKS.push(animFrame.to);
				return animFrame;
			});
		console.log(this);
	}

	getActions() { return this.actions; }

	setActions(newActions = this.actions) {
		const newAC = new AnimationControl(this.app, this.OK, newActions);
		this.OKS = newAC.OKS;
		this.animFrames = newAC.animFrames;
		this.activeAnimFrame?.stop();
		this.activeAnimFrame = undefined;
		this.lastState = newAC.lastState;
		this.app = newAC.app;
		this.OK = newAC.OK;
		this.actions = newAC.actions;
		this.state = this.lastState;
	}

	get maxState() { return this.actions.length; }

	isCorrectState(state: number) { return 0 <= state && state <= this.maxState; }

	set state(nowState: number) {
		this.lastState = nowState;
		if (!this.isCorrectState(nowState)) {
			throw new Error(`AnimationControl.state: state = {${
				nowState
			}} incorrect for maxState = {${this.maxState}}`);
		}
		const ind = Math.floor(nowState);
		if (this.animFrames[ind] !== this.activeAnimFrame) {
			// console.log(ind, this.animFrames[ind]);
			// console.log(this.activeAnimFrame);
			this.activeAnimFrame?.stop();
			this.activeAnimFrame = this.animFrames[ind];
			this.activeAnimFrame.start(nowState - ind); // todo: .?
			// console.log(this.activeAnimFrame);
		} else {
			this.activeAnimFrame.rerender(nowState - ind); // todo: .?
		}
		// console.log({ nowState, ind });
	}
}