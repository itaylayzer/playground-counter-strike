import { AnimationClip, AnimationMixer } from "three";
import { A_Vertex } from "./A_Vertex";
import { A_V_Blender } from "./A_V_Blender";
import { A_V_Single } from "./A_V_Single";
import { A_V_State } from "./A_V_State";
import { A_V_Combined } from "./A_V_Combined";

export abstract class A_V_Params {
	constructor() {}

	abstract build(mixer: AnimationMixer): A_Vertex;
}

export class A_P_Blender extends A_V_Params {
	constructor(private clips: AnimationClip[], private key: string) {
		super();
	}

	build(mixer: AnimationMixer): A_Vertex {
		return new A_V_Blender(mixer, this.clips, this.key);
	}
}

export class A_P_Single extends A_V_Params {
	constructor(
		private clip: AnimationClip,
		private startOverOnFadeIn: boolean = true,
		private start: number = 0,
		private end: number | undefined = undefined,
		private loop: boolean = true
	) {
		super();
	}

	build(mixer: AnimationMixer): A_Vertex {
		return new A_V_Single(
			mixer,
			this.clip,
			this.startOverOnFadeIn,
			this.start,
			this.end,
			this.loop
		);
	}
}

export class A_P_State extends A_V_Params {
	constructor(
		private vertecies: A_V_Params[],
		private edges: [number, number, string][]
	) {
		super();
	}

	build(mixer: AnimationMixer): A_Vertex {
		return new A_V_State(mixer, this.vertecies, this.edges);
	}
}

export class A_P_Combined extends A_V_Params {
	constructor(private clips: A_V_Params[]) {
		super();
	}

	build(mixer: AnimationMixer): A_Vertex {
		return new A_V_Combined(mixer, this.clips);
	}
}
