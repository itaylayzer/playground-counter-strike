import { A_Edge } from "./A_Edge";
import { A_Vertex } from "./A_Vertex";
import { A_V_Params } from "./A_Vertex_Params";
import * as THREE from "three";
import { A_Conditions } from "./types";

function weightDistance(x: number, target: number) {
	return Math.max(-Math.abs(x - target) + 1, 0);
}
export class A_V_State extends A_Vertex {
	public vertecies: A_Vertex[];
	public current: number;

	constructor(
		mixer: THREE.AnimationMixer,
		build_vertecies: A_V_Params[],
		edges: [number, number, string][]
	) {
		super();
		this.current = 0;
		this.vertecies = build_vertecies.map((v) => v.build(mixer));
		for (const edge of edges) {
			const [from, to, key] = edge;
			const v = this.vertecies[from];
			v.edges.set(to, new A_Edge(v, to, key as string));
		}
		this.weight = 1;
		for (const vertex of this.vertecies) {
			vertex.setWeight(0);
		}
		this.vertecies[this.current].setWeight(this.weight);
	}

	public override update(
		values: Record<string, any>,
		conditions: A_Conditions,
		weight: number
	) {
		super.update(values, conditions, weight);

		const currV = this.vertecies[this.current];
		for (const e of currV.edges.values()) {
			e.travarseable(conditions) && this.setCurrent(e.to);
		}

		for (let i = 0; i < this.vertecies.length; i++) {
			const distance = weightDistance(i, this.current) * this.weight;

			this.vertecies[i].update(values, conditions, distance);
		}
	}

	public setCurrent(curr: number) {
		// this.vertecies[this.current].fadeOut();
		// this.vertecies[(this.current = curr)].fadeIn();
		this.current = curr;
	}
	protected anim_setEffectiveWeight(weight: number): void {
		this.setWeight(weight);
	}
}
