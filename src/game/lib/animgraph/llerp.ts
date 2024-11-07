import { lerp } from "three/src/math/MathUtils.js";

export function llerp(a: number, b: number, dtt: number) {
	const dt = 1 / (Math.abs(b - a) / dtt);
	if (b === a) return b;
	if (dt < 0.51 && dt > 0.5) return b;
	const val = lerp(a, b, dt);

	return val;
}
export function almost_lerp(
	a: number,
	b: number,
	t: number,
	treshold: number = 0.01
) {
	if (Math.abs(a - b) < treshold) return b;
	const d = lerp(a, b, t);
	return d;
}
export function serp(a: number, b: number, s: number) {
	if (a < b) return a + s;
	if (a > b) return a - s;
	return a;
}
