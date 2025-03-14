import RAPIER from "@dimforge/rapier3d-compat";
import { Global } from "../store/Global";
import { Updateable } from "./Updateable";
import { MovementController } from "../controllers/MovementController";
import { IKeyboardController } from "../controllers/IKeyboardController";
import { PlayerModel } from "./ViewModel/PlayerModel";
import { ShooterController } from "../controllers/ShooterController";
import { BoneController } from "../controllers/BoneController";
import { ThrowController } from "../controllers/ThrowController";
// import { BoneController } from "../controllers/BoneController";
export class Player extends Updateable {
	public body: RAPIER.RigidBody;
	public model: PlayerModel;
	public throwController: ThrowController;
	constructor(
		public keyboard: IKeyboardController,
		ModelClass: new (player: Player) => PlayerModel
	) {
		super();

		const position = { x: 0, y: 3, z: 0 };

		const desc = RAPIER.RigidBodyDesc.dynamic();
		this.body = Global.world.createRigidBody(desc);

		this.body.setEnabledRotations(false, false, false, true);
		this.body.setTranslation(position, true);
		const fullShape = RAPIER.ColliderDesc.cylinder(0.6, 0.3);
		fullShape.mass = 1;

		const halfShape = RAPIER.ColliderDesc.cylinder(0.3, 0.3);
		halfShape.setTranslation(0, 0, 0);
		fullShape.mass = 1;

		const crouchShape = RAPIER.ColliderDesc.cylinder(0.4, 0.3);
		crouchShape.setTranslation(0, 0, 0);
		crouchShape.mass = 1;

		const fullCollider = Global.world.createCollider(fullShape, this.body);
		fullCollider.setCollisionGroups((0x1 << 16) | 0xffff);

		const halfCollider = Global.world.createCollider(halfShape, this.body);
		halfCollider.setCollisionGroups((0x1 << 16) | 0xffff);
		halfCollider.setEnabled(false);

		const crouchCollider = Global.world.createCollider(
			crouchShape,
			this.body
		);
		crouchCollider.setCollisionGroups((0x1 << 16) | 0xffff);
		crouchCollider.setEnabled(false);

		Global.debugMode && Global.debugRenderer.update();

		this.model = new ModelClass(this);
		this.throwController = new ThrowController();
		const movement = new MovementController(this);
		const shooter = new ShooterController(this, 10, 100);
		const boneController = new BoneController(this);

		const switchCollider = (num: number) => {
			for (let i = 0; i < 3; i++) {
				this.body.collider(i).setEnabled(num === i);
			}
		};

		const isColliderEnabled = (num: number) => {
			return this.body.collider(num).isEnabled();
		};

		this.update = () => {
			keyboard.isLocked = false;
			keyboard.firstUpdate();

			Global.cameraController.update();

			if (Global.lockController.isLocked && keyboard.isMousePressed(0)) {
				const { x, y } = movement.shootRange();
				if (shooter.shoot(x, y, Global.debugMode)) {
					this.model.shoot(x, y);
				}
			}

			if (keyboard.isKeyPressed(17) || keyboard.isKeyDown(17)) {
				if (!this.model.onGround && !isColliderEnabled(1)) {
					switchCollider(1);
				}
				if (this.model.onGround && !isColliderEnabled(2)) {
					switchCollider(2);
				}
			}

			if (keyboard.isKeyUp(17) && !isColliderEnabled(0)) {
				switchCollider(0);
			}

			shooter.update();
			movement.update();

			this.model.update();

			keyboard.lastUpdate();
			boneController.update();
		};
		Global.lod.add(this.model);
	}
}
