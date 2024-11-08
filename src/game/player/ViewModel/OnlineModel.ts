import * as THREE from "three";
import { Global } from "../../store/Global";
import {
	A_Conditions,
	A_P_Blender,
	A_P_Single,
	AnimationGraph,
} from "../../lib/animgraph";
import { Player } from "../Player";
import { AnimationUtils } from "../../lib/animgraph/AnimationUtils";
import { PlayerModel } from "./PlayerModel";
	
export class OnlineModel extends PlayerModel {
	constructor(player: Player) {
		super(player);
		const model = this.skeleton();

		const skinnedMesh = model.getObjectByName(
			"Soldat"
		) as THREE.SkinnedMesh;
		const nose = skinnedMesh.skeleton.getBoneByName("Nose")!;
		this.onGround = false;
		model.scale.multiplyScalar(0.0035);
		super.add(model);

		const lgraph = new AnimationGraph(skinnedMesh);

		const nomral_movementBlender = new A_P_Blender(
			[
				Global.assets.fbx.idle.animations[0],
				AnimationUtils.adjustClipSpeed(
					Global.assets.fbx.walk.animations[0].clone(),
					0.5
				),
				Global.assets.fbx.walk.animations[0],
			],
			"movement"
		);
		const crouching_movementBlender = new A_P_Blender(
			[
				Global.assets.fbx.anim_crouch_idle.animations[0], //Global.assets.fbx.idle.animations[0],
				Global.assets.fbx.anim_crouch_walk.animations[0],
				Global.assets.fbx.anim_crouch_walk.animations[0], //Global.assets.fbx.walk.animations[0],
			],
			"movement"
		);
		// 0
		lgraph.addVertex(nomral_movementBlender);
		// 1
		lgraph.addVertex(
			new A_P_Single(Global.assets.fbx.anim_jump_start.animations[0])
		);
		// 2
		lgraph.addVertex(
			new A_P_Single(Global.assets.fbx.anim_jump_loop.animations[0])
		);

		// 3
		lgraph.addVertex(
			new A_P_Single(
				Global.assets.fbx.anim_jump_end.animations[0],
				true,
				0.8
			)
		);
		// 4
		lgraph.addVertex(crouching_movementBlender);

		lgraph.join(0, 1, "normal_to_jump_start");
		lgraph.join(4, 1, "crouch_to_jump_start");

		lgraph.join(1, 2, "jump_start_loopend");
		lgraph.join(2, 0, "mj2_end_to_normal");
		lgraph.join(2, 4, "mj2_end_to_crounch");
		lgraph.join(0, 4, "normal_to_crouch");
		lgraph.join(4, 0, "crouch_to_normal");

		lgraph.start(0);

		this.update = () => {
			const isWalking = [87, 83, 68, 65]
				.map((v) => player.keyboard.isKeyPressed(v))
				.reduce((a, b) => a || b);
			const isShifting = player.keyboard.isKeyPressed(16);
			const isCrouching = player.keyboard.isKeyPressed(17);
			const onJump = player.keyboard.isKeyDown(32);

			const lowerConditions: A_Conditions = {
				normal_to_jump_start: onJump && !isCrouching,
				crouch_to_jump_start: onJump && isCrouching,
				mj2_end_to_normal: this.onGround && !isCrouching,
				mj2_end_to_crounch: this.onGround && isCrouching,

				jump_start_loopend: (clip) =>
					clip.getTime() >= clip.getDuration() - Global.deltaTime * 5,

				crouch_to_normal: player.keyboard.isKeyUp(17),
				normal_to_crouch: player.keyboard.isKeyDown(17),
			};

			const movement =
				(2 * +isWalking - +(isShifting && isWalking && !isCrouching)) *
				+Global.lockController.isLocked;

			lgraph.update(
				{
					movement,
				},
				lowerConditions
			);

			// Update position
			this.position.copy(player.body.translation());

			// Update spine rotation
			// PlayerModel.alignBoneToCameraPitch(spine);
			// spine.rotateX(-Global.camera.rotation.x);

			// Update camera position
			Global.camera.position
				.copy(nose.getWorldPosition(new THREE.Vector3()))
				.add(
					new THREE.Vector3(0, -0.1, -0.05).applyQuaternion(
						Global.camera.quaternion
					)
				)
				.add(
					new THREE.Vector3(0, 0, -0.1).applyQuaternion(
						player.body.rotation()
					)
				);
		};
	}
}
