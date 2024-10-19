import RAPIER from "@dimforge/rapier3d-compat";
import { KeyboardController } from "../controllers/KeyboardController";
import { Global } from "../store/Global";
import { Updateable } from "./Updateable";
import { MovementController } from "../controllers/MovementController";
import * as THREE from "three";
export class LocalPlayer extends Updateable {
	public body: RAPIER.RigidBody;
	public mesh: THREE.Object3D;
	constructor(public keyboard: KeyboardController) {
		super();

		const position = { x: 0, y: 2, z: 0.95 };

		const body = Global.world.createRigidBody(
			RAPIER.RigidBodyDesc.dynamic()
		);
		body.setEnabledRotations(false, false, false, true);
		body.setTranslation(
			new RAPIER.Vector3(position.x, position.y, position.z),
			true
		);
		const shape = RAPIER.ColliderDesc.cylinder(1.5, 1);
		shape.mass = 1;

		Global.world.createCollider(shape, body);
		Global.debugRenderer.update();

		this.mesh = new THREE.Object3D();
		this.body = body;

		const movement = new MovementController(this);

		this.update = () => {
			keyboard.isLocked = false;
			keyboard.firstUpdate();

			Global.cameraController.update();
			movement.update();

			Global.camera.position
				.copy(body.translation())
				.add(new THREE.Vector3(0, 1, 0));

			keyboard.lastUpdate();
		};
	}
}
