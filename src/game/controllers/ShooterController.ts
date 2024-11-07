import { Vector3 } from "three";
import { Global } from "../store/Global";
import * as RAPIER from "@dimforge/rapier3d-compat";

export class ShooterController {
	private time: number;
	constructor(
		private body: RAPIER.RigidBody,
		private shootForce: number,
		private deltaTime: number
	) {
		this.time = deltaTime;
	}

	public shoot() {
		if (this.time < this.deltaTime) return false;
		this.time = 0;

		// Get the camera direction in world space
		const cameraDirection = new Vector3();
		Global.camera.getWorldDirection(cameraDirection);

		// Convert THREE.js vectors to Cannon.js Vec3
		const from = {
			x: Global.camera.position.x,
			y: Global.camera.position.y,
			z: Global.camera.position.z,
		};

		// Perform raycast
		const ray = new RAPIER.Ray(from, cameraDirection);
		const hit = Global.world.castRay(ray, 1000, true, 1, ~1);

		// Check if the ray hit something
		if (hit) {
			const hitBody = hit.collider;

			// Ensure the hit body has mass (i.e., is not static)
			if (
				!!hitBody &&
				this.body.handle !== hitBody.handle &&
				hitBody.mass() > 0
			) {
				// Calculate the direction of the impulse
				const impulseDirection = new Vector3(
					cameraDirection.x * this.shootForce,
					cameraDirection.y * this.shootForce,
					cameraDirection.z * this.shootForce
				);

				// Apply the impulse to the hit body at the hit point
				hitBody.parent()!.applyImpulse(impulseDirection, true);
			}
		}
		return true;
	}
	public update() {
		this.time += Global.deltaTime * 1000;
	}
}
