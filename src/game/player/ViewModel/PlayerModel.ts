import * as THREE from "three";
import { Player } from "../Player";

export abstract class PlayerModel extends THREE.Group {
	public update: () => void;
	public onGround: boolean;
	// @ts-ignore
	constructor(player: Player) {
		super();
		this.update = () => {};
		this.onGround = false;
	}

	static alignBoneToCamera(bone: THREE.Bone, camera: THREE.Camera): void {
		// Get the world position of the bone (hips position)
		const bonePosition = new THREE.Vector3();
		bone.getWorldPosition(bonePosition);

		// Get the target point by projecting the camera's forward direction from the bone position
		const cameraForward = new THREE.Vector3();
		camera.getWorldDirection(cameraForward);
		const targetPosition = bonePosition.clone().add(cameraForward);

		// Make the bone "look at" the target position, aligning it with the camera's forward direction
		bone.lookAt(targetPosition);
	}
}
