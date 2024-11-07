import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { Global } from "../../store/Global";
import {
	A_P_Blender,
	A_P_Combined,
	A_P_Single,
	A_P_State,
	AnimationGraph,
} from "../../lib/animgraph";
import { Player } from "../Player";
import { AnimationUtils } from "../../lib/animgraph/AnimationUtils";
import { PlayerModel } from "./PlayerModel";

export class LocalModel extends PlayerModel {
	constructor(player: Player) {
		super(player);
		const model = clone(Global.assets.fbx.t_model);
		const skinned = model.getObjectByName("Soldat") as THREE.SkinnedMesh;

		const nose = skinned.skeleton.getBoneByName("Nose")!;
		const spine = skinned.skeleton.getBoneByName("mixamorigSpine")!;

		this.onGround = false;
		model.scale.multiplyScalar(0.0035);
		// model.scale.x *= -1;;

		super.add(model);

		const graph = new AnimationGraph(skinned);

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
		let LookingFromOutside = true;
		graph.addVertex(
			new A_P_Combined([
				new A_P_State(
					[
						nomral_movementBlender,
						new A_P_Single(
							Global.assets.fbx.anim_jump_start.animations[0]
						),
						new A_P_Single(
							Global.assets.fbx.anim_jump_loop.animations[0]
						),
						new A_P_Single(
							Global.assets.fbx.anim_jump_end.animations[0],
							true,
							0.8
						),
						crouching_movementBlender,
					],
					[
						[0, 1, "normal_to_jump_start"],
						[4, 1, "crouch_to_jump_start"],
						[1, 2, "jump_start_loopend"],
						[2, 0, "mj2_end_to_normal"],
						[2, 4, "mj2_end_to_crounch"],
						[0, 4, "normal_to_crouch"],
						[4, 0, "crouch_to_normal"],
					]
				),

				new A_P_State(
					[
						new A_P_Single(Global.assets.fbx.h_idle.animations[0]),
						new A_P_Single(Global.assets.fbx.h_shoot.animations[0]),
					],

					[
						[0, 1, "aim_to_shoot"],
						[1, 1, "shoot_to_shoot"],
						[1, 0, "shoot_to_aim"],
					]
				),
			])
		);
		graph.start(0);

		this.update = () => {
			const isWalking = [87, 83, 68, 65]
				.map((v) => player.keyboard.isKeyPressed(v))
				.reduce((a, b) => a || b);
			const isShifting = player.keyboard.isKeyPressed(16);
			const isCrouching = player.keyboard.isKeyPressed(17);
			const onJump = player.keyboard.isKeyDown(32);

			const movement =
				(2 * +isWalking - +(isShifting && isWalking && !isCrouching)) *
				+Global.lockController.isLocked;

			const isShooting =
				player.keyboard.isMouseDown(0) ||
				player.keyboard.isMousePressed(0);

			graph.update(
				{ movement },
				{
					normal_to_jump_start: onJump && !isCrouching,
					crouch_to_jump_start: onJump && isCrouching,
					mj2_end_to_normal: this.onGround && !isCrouching,
					mj2_end_to_crounch: this.onGround && isCrouching,

					jump_start_loopend: (clip) =>
						clip.getTime() >=
						clip.getDuration() - Global.deltaTime * 5,

					crouch_to_normal: player.keyboard.isKeyUp(17),
					normal_to_crouch: player.keyboard.isKeyDown(17),
					aim_to_shoot: isShooting,
					shoot_to_shoot: isShooting,
					shoot_to_aim: !isShooting,
				}
			);

			// Update position
			this.position.copy(player.body.translation());

			// Update spine rotation
			PlayerModel.alignBoneToCamera(spine, Global.camera);
			spine.rotateOnAxis(Global.camera.up, -0.4);
			// spine.rotateX(-Global.camera.rotation.x);
			if (player.keyboard.isKeyDown(86))
				LookingFromOutside = !LookingFromOutside;

			// Update camera position
			Global.camera.position
				.copy(nose.getWorldPosition(new THREE.Vector3()))
				.add(
					new THREE.Vector3(
						-0.15 + -0.3 * +LookingFromOutside,
						0.05,
						0.1 + +LookingFromOutside
					).applyQuaternion(Global.camera.quaternion)
				)
				.add(
					new THREE.Vector3(0, 0, 0).applyQuaternion(
						player.body.rotation()
					)
				);
		};
	}
}
