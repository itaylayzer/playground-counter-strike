import { lerp } from "three/src/math/MathUtils.js";

let interval;

const target = 0;
const start = 1;
let val = start;



function int() {
	val = linear_interpolation(val, target, 0.1);
	console.log(val.toFixed(2));
}

interval = setInterval(int, 1000 / 10);
