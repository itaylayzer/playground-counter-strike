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

	protected get skeleton() {
		return PlayerModel.skeleton;
	}
	static skeleton(ct = false) {
		const obj = Global.fbxLoader.parse(
			Global.assets.buffer.buffer_model,
			""
		);

		if (!ct) return obj;

		const skinnedMesh = obj.getObjectByName("Soldat") as THREE.SkinnedMesh<
			THREE.BufferGeometry,
			THREE.Material[]
		>;
		const lightBlue = "#2d435e";
		const hardBlue = "#223042";

		const colorOrder = [hardBlue, lightBlue, hardBlue];
		[2, 3, 6].forEach((colorIndex, index) => {
			const mat = skinnedMesh.material[
				colorIndex
			] as THREE.MeshPhongMaterial;
			mat.color = new THREE.Color(colorOrder[index]);
			mat.specular = new THREE.Color(colorOrder[index]);
		});

		return obj;
	}
}
