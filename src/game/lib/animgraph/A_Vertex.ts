import { A_Edge } from "./A_Edge";
import { AnimationAction } from "three";

export abstract class A_Vertex {
	public edges: Map<number, A_Edge>;
	protected innerUpdate: ((obj: Record<string, any>) => void) | undefined =
		undefined;

	protected onFadeIn: (() => void) | undefined = undefined;
	protected onFadeOut: (() => void) | undefined = undefined;
	constructor(protected weight: number = 0) {
		this.edges = new Map();
	}
	public fadeOut() {
		this.onFadeOut && this.onFadeOut();

		this.weight = 0;
	}
	public fadeIn() {
		this.onFadeIn && this.onFadeIn();
		this.weight = 1;
	}
	public setWeight(w: number) {
		this.weight = w;
	}
	public update(
		values: Record<string, any>,

		weight: number
	) {
		this.anim_setEffectiveWeight((this.weight = weight));
		this.innerUpdate && this.innerUpdate(values);
	}

	public getDuration(): number {
		throw new Error("Method not implemented.");
	}
	public getTime(): number {
		throw new Error("Method not implemented.");
	}

	protected abstract anim_setEffectiveWeight(weight: number): void;
	public abstract getAction(): AnimationAction;
}
