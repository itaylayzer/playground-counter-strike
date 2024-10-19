import { LocalPlayer } from "../player/LocalPlayer";
import * as THREE from "three";
import { Global } from "../store/Global";
export class MovementController {
	public update: () => void;
	constructor(player: LocalPlayer) {
		this.update = () => {
			const yRotation =
				Global.cameraController.rotation.x * THREE.MathUtils.DEG2RAD;

			player.mesh.rotation.set(0, 0, 0);
			player.mesh.rotateOnWorldAxis(
				new THREE.Vector3(0, 1, 0),
				yRotation
			);

			const forwardVec = new THREE.Vector3(0, 0, 1).applyQuaternion(
				player.mesh.quaternion
			);
			const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(
				player.mesh.quaternion
			);

			player.body.setRotation(player.mesh.quaternion, true);
			const velocity = new THREE.Vector3();

			if (player.keyboard.isKeyDown(32)) {
				const vel = player.body.linvel();
				vel.y = 10;
				player.body.setLinvel(vel, true);
			}
			velocity.add(
				forwardVec.clone().multiplyScalar(player.keyboard.vertical)
			);
			velocity.add(
				rightVec.clone().multiplyScalar(player.keyboard.horizontal)
			);

			velocity.multiplyScalar(10);

			const vel = player.body.linvel();
			vel.x = velocity.x;
			vel.z = velocity.z;
			player.body.setLinvel(vel, true);
		};
	}
}
