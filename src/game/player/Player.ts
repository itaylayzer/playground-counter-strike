import RAPIER from "@dimforge/rapier3d-compat";
import { Global } from "../store/Global";
import { Updateable } from "./Updateable";
import { MovementController } from "../controllers/MovementController";
import { IKeyboardController } from "../controllers/IKeyboardController";
import { PlayerModel } from "./ViewModel/PlayerModel";
import { ShooterController } from "../controllers/ShooterController";
export class Player extends Updateable {
	public body: RAPIER.RigidBody;
	public model: PlayerModel;
	constructor(
		public keyboard: IKeyboardController,
		ModelClass: new (player: Player) => PlayerModel
	) {
		super();

		const position = { x: 0, y: 20, z: 0 };

		this.body = Global.world.createRigidBody(
			RAPIER.RigidBodyDesc.dynamic()
		);

		this.body.setEnabledRotations(false, false, false, true);
		this.body.setTranslation(position, true);
		this.body.setDominanceGroup(1);
		const shape = RAPIER.ColliderDesc.cylinder(0.6, 0.3);
		shape.mass = 1;

		Global.world
			.createCollider(shape, this.body)
			.setCollisionGroups((0x1 << 16) | 0xffff);
		Global.debugRenderer.update();

		const movement = new MovementController(this);
		const shooter = new ShooterController(this.body, 10, 125);
		this.model = new ModelClass(this);

		this.update = () => {
			let isShooting = false;
			keyboard.isLocked = false;
			keyboard.firstUpdate();

			Global.cameraController.update();

			if (Global.lockController.isLocked && keyboard.isMousePressed(0))
				isShooting = shooter.shoot();

			shooter.update();
			movement.update();
			this.model.update(isShooting);

			keyboard.lastUpdate();
		};
		Global.lod.add(this.model);
	}
}
