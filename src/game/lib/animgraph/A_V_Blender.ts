import { AnimationAction, AnimationClip, AnimationMixer } from "three";
import { A_Vertex } from "./A_Vertex";
import { lerp } from "three/src/math/MathUtils.js";
import { Global } from "../../store/Global";

export class A_V_Blender extends A_Vertex {
	private masterWeight: number;
	private index: number;
	private actions: AnimationAction[];
	constructor(mixer: AnimationMixer, clips: AnimationClip[], key: string) {
		super();
		this.masterWeight = 0;

		this.actions = clips.map((clip) => mixer.clipAction(clip));
		const weights = this.actions.map((_) => 0);
		for (const [actionIndex, action] of this.actions.entries()) {
			action.play();
			action.setEffectiveWeight(+(actionIndex == 0));
		}
		this.index = 0;

		this.innerUpdate = (values) => {
			this.index = values[key] as number;

			for (const [actionIndex, action] of this.actions.entries()) {
				weights[actionIndex] = lerp(
					weights[actionIndex],
					+(actionIndex == this.index),
					Global.deltaTime * 7
				);
				action.setEffectiveWeight(
					weights[actionIndex] * this.masterWeight
				);
			}
		};
	}

	protected anim_setEffectiveWeight(weight: number): void {
		this.masterWeight = weight;
	}
	public getAction(): AnimationAction {
		return this.actions[this.index];
	}
}
