import { AnimationMixer } from "three";
import { A_Vertex } from "./A_Vertex";
import { A_V_Params } from "./A_Vertex_Params";
import { A_Conditions } from "./types";

export class A_V_Combined extends A_Vertex {
	private vertecies: A_Vertex[];
	constructor(mixer: AnimationMixer, clips: A_V_Params[]) {
		super();

		this.vertecies = clips.map((clip) => clip.build(mixer));
	}
	public override update(
		values: Record<string, any>,
		conditions: A_Conditions,
		weight: number
	) {
		super.update(values, conditions, weight);

		for (let i = 0; i < this.vertecies.length; i++) {
			this.vertecies[i].update(values, conditions, weight);
		}
	}

	// @ts-ignore
	protected anim_setEffectiveWeight(weight: number): void {}
}
