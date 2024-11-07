import RAPIER from "@dimforge/rapier3d-compat";
import { KeyboardController } from "../controllers/KeyboardController";
import { Global } from "../store/Global";
import { Updateable } from "./Updateable";
import { MovementController } from "../controllers/MovementController";
import { PlayerModel } from "./PlayerModel";
export class LocalPlayer extends Updateable {
	public body: RAPIER.RigidBody;
	public model: PlayerModel;
	constructor(public keyboard: KeyboardController) {
		super();

		const position = { x: 0, y: 3, z: 0.95 };

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

		this.body = body;

		const movement = new MovementController(this);
		this.model = new PlayerModel(this);

		this.update = () => {
			keyboard.isLocked = false;
			keyboard.firstUpdate();

			Global.cameraController.update();
			movement.update();

			this.model.update();

			keyboard.lastUpdate();
		};
		Global.lod.add(this.model);
	}
}
