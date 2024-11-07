import { clamp, lerp } from "three/src/math/MathUtils.js";
import { Global } from "../store/Global";

const HORIZONTAL = 0;
const VERTICAL = 1;
const RAW_AXIS = 0;
const LERPED_AXIS = 1;

export class IKeyboardController {
	public keysDown: Set<number>;
	public keysUp: Set<number>;
	public keysPressed: Set<number>;
	public mouseDown: Set<number>;
	public mouseUp: Set<number>;
	public mousePressed: Set<number>;
	public keysAxis: [[number, number], [number, number]];
	public beforeFirstUpdate: () => void;
	public isLocked: boolean;

	constructor() {
		this.isLocked = false;
		this.keysDown = new Set();
		this.keysUp = new Set();
		this.keysPressed = new Set();
		this.mouseDown = new Set();
		this.mouseUp = new Set();
		this.mousePressed = new Set();
		this.keysAxis = [
			[0, 0],
			[0, 0],
		];
		this.beforeFirstUpdate = () => {};
	}

	public isKeyPressed(code: number): boolean {
		return this.keysPressed.has(code);
	}

	public isKeyUp(code: number): boolean {
		return this.keysUp.has(code);
	}

	public isMouseDown(code: number): boolean {
		return this.mouseDown.has(code);
	}

	public isMousePressed(code: number): boolean {
		return this.mousePressed.has(code);
	}

	public isMouseUp(code: number): boolean {
		return this.mouseUp.has(code);
	}

	public isKeyDown(code: number): boolean {
		return this.keysDown.has(code);
	}
	public firstUpdate() {
		this.beforeFirstUpdate();

		// Input axis processing
		this.keysAxis[RAW_AXIS][VERTICAL] = clamp(
			+this.isKeyPressed(87) +
				-this.isKeyPressed(83) +
				+this.isKeyPressed(-1) +
				-this.isKeyPressed(-2),
			-1,
			1
		);
		this.keysAxis[RAW_AXIS][HORIZONTAL] = clamp(
			+this.isKeyPressed(65) +
				-this.isKeyPressed(68) +
				+this.isKeyPressed(-15) +
				-this.isKeyPressed(-16),
			-1,
			1
		);
		for (let index = 0; index < 2; index++) {
			// Smoothing inputs
			this.keysAxis[LERPED_AXIS][index] = lerp(
				this.keysAxis[LERPED_AXIS][index],
				this.keysAxis[RAW_AXIS][index],
				Global.deltaTime * 7
			);

			// Ignore small axis values (dead zone)
			if (Math.abs(this.keysAxis[LERPED_AXIS][index]) < 0.05) {
				this.keysAxis[LERPED_AXIS][index] = 0;
			}
		}

		if (this.isLocked) {
			for (let index = 0; index < 2; index++)
				this.keysAxis[RAW_AXIS][index] = 0;

			this.keysDown.clear();
			this.keysUp.clear();
			this.keysPressed.clear();
		}
	}

	public lastUpdate() {
		for (const down of this.keysDown) {
			this.keysPressed.add(down);
		}
		for (const down of this.mouseDown) {
			this.mousePressed.add(down);
		}
		this.keysDown.clear();
		this.keysUp.clear();
		this.mouseDown.clear();
		this.mouseUp.clear();
	}

	public get vertical() {
		return this.keysAxis[LERPED_AXIS][VERTICAL];
	}
	public get horizontal() {
		return this.keysAxis[LERPED_AXIS][HORIZONTAL];
	}

	public get verticalRaw() {
		return this.keysAxis[RAW_AXIS][VERTICAL];
	}
	public get horizontalRaw() {
		return this.keysAxis[RAW_AXIS][HORIZONTAL];
	}
}
