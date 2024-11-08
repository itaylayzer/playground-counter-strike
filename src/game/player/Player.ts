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

		const position = { x: 0, y: 4, z: 0 };

		this.body = Global.world.createRigidBody(
			RAPIER.RigidBodyDesc.dynamic()
		);

		this.body.setEnabledRotations(false, false, false, true);
		this.body.setTranslation(position, true);
		this.body.setDominanceGroup(1);
		const fullShape = RAPIER.ColliderDesc.cylinder(0.6, 0.3);
		fullShape.mass = 1;
		const halfShape = RAPIER.ColliderDesc.cylinder(0.3, 0.3);
		fullShape.mass = 1;

		const fullCollider = Global.world.createCollider(fullShape, this.body);
		fullCollider.setCollisionGroups((0x1 << 16) | 0xffff);

		const halfCollider = Global.world.createCollider(halfShape, this.body);
		halfCollider.setCollisionGroups((0x1 << 16) | 0xffff);
		halfCollider.setEnabled(false);
		Global.debugRenderer.update();

		const movement = new MovementController(this);
		const shooter = new ShooterController(this, 10, 100);
		this.model = new ModelClass(this);

		this.update = () => {
			keyboard.isLocked = false;
			keyboard.firstUpdate();

			Global.cameraController.update();

			if (Global.lockController.isLocked && keyboard.isMousePressed(0)) {
				const { x, y } = movement.shootRange();
				if (shooter.shoot(x, y, true)) {
					this.model.shoot(x, y);
				}
			}

			if (keyboard.isKeyDown(17)) {
				fullCollider.setEnabled(false);
				halfCollider.setEnabled(true);
			}

			if (keyboard.isKeyUp(17)) {
				fullCollider.setEnabled(true);
				halfCollider.setEnabled(false);
			}

			shooter.update();
			movement.update();
			this.model.update();

			keyboard.lastUpdate();
		};
		Global.lod.add(this.model);
	}
}
