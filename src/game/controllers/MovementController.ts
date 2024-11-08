import { Player } from "../player/Player";
import * as THREE from "three";
import { Global } from "../store/Global";

const UP_VECTOR = new THREE.Vector3(0, 1, 0);
export class MovementController {
	public update: () => void;
	public shootRange: () => { x: number; y: number };
	constructor(player: Player) {
		let onGround = false;

		const checkOnGrounded = () => {
			onGround = false;
			Global.world.contactPairsWith(player.body.collider(0), (other) => {
				const contact = other.contactCollider(
					player.body.collider(0),
					10
				);
				if (contact === null) {
					onGround = false;
				} else {
					const first = new THREE.Vector3()
						.copy(contact.normal1)
						.dot(UP_VECTOR);
					onGround = first > 0.8;
				}
			});
		};

		this.update = () => {
			checkOnGrounded();

			const yRotation =
				Global.cameraController.rotation.x * THREE.MathUtils.DEG2RAD;

			player.model.rotation.set(0, 0, 0);
			player.model.rotateOnWorldAxis(
				new THREE.Vector3(0, 1, 0),
				yRotation
			);

			const forwardVec = new THREE.Vector3(0, 0, 1).applyQuaternion(
				player.model.quaternion
			);
			const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(
				player.model.quaternion
			);

			player.body.setRotation(player.model.quaternion, true);

			const velocity = new THREE.Vector3();
			velocity.add(
				forwardVec.clone().multiplyScalar(player.keyboard.vertical)
			);
			velocity.add(
				rightVec.clone().multiplyScalar(player.keyboard.horizontal)
			);
			velocity.multiplyScalar(
				6 -
					4 *
						+(
							player.keyboard.isKeyPressed(16) ||
							player.keyboard.isKeyPressed(17)
						)
			);

			const kinematicUpdate = () => {
				if (player.keyboard.isKeyDown(32) && onGround) {
					const vel = player.body.linvel();
					vel.y = 5;
					player.body.setLinvel(vel, true);
				}

				const vel = player.body.linvel();
				vel.x = velocity.x;
				vel.z = velocity.z;
				player.body.setLinvel(vel, true);
			};
			player.model.onGround = onGround;
			kinematicUpdate();
		};

		this.shootRange = () => {
			const rangeLengh =
				(Math.abs(player.keyboard.vertical) +
					Math.abs(player.keyboard.horizontal) +
					Math.abs(player.body.linvel().y) * 0.33) *
				(player.keyboard.isKeyPressed(17)
					? 0.5
					: player.keyboard.isKeyPressed(16)
					? 2
					: 4);

			return randomPointInCircle(rangeLengh / 20);
		};
	}
}

function randomPointInCircle(radius: number): { x: number; y: number } {
	const angle = Math.random() * 2 * Math.PI;
	const distance = Math.sqrt(Math.random()) * radius;

	const x = distance * Math.cos(angle);
	const y = distance * Math.sin(angle);

	return { x, y };
}
