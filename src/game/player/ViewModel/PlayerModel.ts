import * as THREE from "three";
import { Player } from "../Player";
import { Global } from "../../store/Global";

export abstract class PlayerModel extends THREE.Group {
	public update: () => void;
	public shoot: (x: number, y: number) => void;

	public onGround: boolean;

	// @ts-ignore
	constructor(player: Player) {
		super();
		this.update = () => {};
		this.shoot = () => {};
		this.onGround = false;
	}
	static {}
	static alignBoneToCameraPitch(
		skinned: THREE.SkinnedMesh,
		x: number,
		y: number,
		z: number
	): void {
		const bone = skinned.skeleton.getBoneByName("mixamorigSpine2")!;
		const bonePosition = new THREE.Vector3();
		bone.getWorldPosition(bonePosition);

		const cameraForward = new THREE.Vector3();
		Global.camera.getWorldDirection(cameraForward);
		const targetPosition = bonePosition.clone().add(cameraForward);

		bone.lookAt(targetPosition);
		bone.rotateX(x);
		bone.rotateY(y);
		bone.rotateZ(z);
	}
}
