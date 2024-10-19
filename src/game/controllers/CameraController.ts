import * as THREE from "three";
import { Global } from "../store/Global";
import { clamp } from "three/src/math/MathUtils.js";

function explodeFn(t: number) {
	return t < Math.PI * 4
		? (100 * Math.sin(t + Math.PI)) / Math.pow(t + Math.PI, 3)
		: 0;
}
function randomSign() {
	if (Math.random() > 0.66) return -1;
	if (Math.random() < 0.33) return 1;
	return 0;
}
export class CameraController {
	public camera: THREE.PerspectiveCamera;
	public rotation: THREE.Vector2;
	public mouseMovement: THREE.Vector2;
	public mouseMovementLerped: THREE.Vector2;
	public static sensitivity: number = 50;

	private time: number;
	private forceRotation: THREE.Vector3;
	constructor(camera: THREE.PerspectiveCamera) {
		this.camera = camera;
		camera.rotation.y = Math.PI;
		this.mouseMovement = new THREE.Vector2();
		this.mouseMovementLerped = new THREE.Vector2();
		this.rotation = new THREE.Vector2();
		this.time = Math.PI * 4;
		this.forceRotation = new THREE.Vector3();
	}

	public update() {
		this.mouseMovementLerped.lerp(this.mouseMovement, 1 / 3);
		this.rotation.add(this.mouseMovementLerped);
		this.rotation.y = clamp(this.rotation.y, -90, 90);

		this.mouseMovement.set(0, 0);

		this.camera.quaternion.setFromEuler(
			new THREE.Euler(this.rotation.y * THREE.MathUtils.DEG2RAD, 0, 0)
		);
		const cameraUp = new THREE.Vector3(0, 1, 0);
		this.camera.rotateOnWorldAxis(
			cameraUp,
			this.rotation.x * THREE.MathUtils.DEG2RAD + Math.PI
		);

		this.time += Global.deltaTime * 13;
		this.camera.rotation.z += this.forceRotation.z * explodeFn(this.time);
		this.camera.rotation.x += this.forceRotation.x * explodeFn(this.time);
		this.camera.rotation.y += this.forceRotation.y * explodeFn(this.time);
	}

	public updateMouseMovement(movementX: number, movementY: number) {
		this.mouseMovement.set(movementX / 3, movementY / 3).negate();
	}
	shake(distance: number) {
		this.time = 0; //0.93656;
		this.forceRotation.z =
			(randomSign() * Math.random()) / (distance * distance);
		this.forceRotation.x = (randomSign() * Math.random()) / distance;
		this.forceRotation.y = (randomSign() * Math.random()) / distance;
	}
}
