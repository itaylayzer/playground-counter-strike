import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { Global } from "../store/Global";
import {
	A_Conditions,
	A_P_Blender,
	A_P_Single,
	AnimationGraph,
} from "../lib/animgraph";
import { LocalPlayer } from "./LocalPlayer";
import { AnimationUtils } from "../lib/animgraph/AnimationUtils";
export class PlayerModel extends THREE.Group {
	public update: () => void;
	public onGround: boolean;
	constructor(player: LocalPlayer) {
		super();
		const model = clone(Global.assets.fbx.t_model);

		const skinnedMesh = model.children[1] as THREE.SkinnedMesh;

		const nose = skinnedMesh.skeleton.getBoneByName("Eyes")!;
		const spine = skinnedMesh.skeleton.getBoneByName("mixamorigSpine")!;
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
			const isC = player.keyboard.isKeyPressed(67);
			const onJump = player.keyboard.isKeyDown(32);

			const lowerConditions: A_Conditions = {
				normal_to_jump_start: onJump && !isC,
				crouch_to_jump_start: onJump && isC,
				mj2_end_to_normal: this.onGround && !isC,
				mj2_end_to_crounch: this.onGround && isC,

				jump_start_loopend: (clip) =>
					clip.getTime() >= clip.getDuration() - Global.deltaTime * 5,

				crouch_to_normal: player.keyboard.isKeyUp(67),
				normal_to_crouch: player.keyboard.isKeyDown(67),
			};

			const movement =
				(2 * +isWalking - +(isShifting && isWalking)) *
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
			alignBoneToCamera(spine, Global.camera);
			// spine.rotateX(-Global.camera.rotation.x);

			// Update camera position
			Global.camera.position
				.copy(nose.getWorldPosition(new THREE.Vector3()))
				.add(
					new THREE.Vector3(0, 0, 0).applyQuaternion(
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

	static buildAnimations() {
		//
	}
}
function alignBoneToCamera(bone: THREE.Bone, camera: THREE.Camera): void {
	// Get the world position of the bone (hips position)
	const bonePosition = new THREE.Vector3();
	bone.getWorldPosition(bonePosition);

	// Get the target point by projecting the camera's forward direction from the bone position
	const cameraForward = new THREE.Vector3();
	camera.getWorldDirection(cameraForward);
	const targetPosition = bonePosition.clone().add(cameraForward);

	// Make the bone "look at" the target position, aligning it with the camera's forward direction
	bone.lookAt(targetPosition);

	// Adjust rotation to only affect the Y axis (if required to limit rotation to yaw only)
	// bone.rotation.x = 0;
	// bone.rotation.z = 0;
}
