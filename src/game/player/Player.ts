import RAPIER from "@dimforge/rapier3d-compat";
import { Global } from "../store/Global";
import { Updateable } from "./Updateable";
import { MovementController } from "../controllers/MovementController";
import { IKeyboardController } from "../controllers/IKeyboardController";
import { PlayerModel } from "./ViewModel/PlayerModel";
export class Player extends Updateable {
	public body: RAPIER.RigidBody;
	public model: PlayerModel;
	constructor(
		public keyboard: IKeyboardController,
		ModelClass: new (player: Player) => PlayerModel
	) {
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
		const shape = RAPIER.ColliderDesc.cylinder(1, 0.3);
		shape.mass = 1;

		Global.world.createCollider(shape, body);
		Global.debugRenderer.update();

		this.body = body;

		const movement = new MovementController(this);
		this.model = new ModelClass(this);

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
