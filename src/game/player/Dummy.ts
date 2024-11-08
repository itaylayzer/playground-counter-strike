import * as THREE from "three";
import { Global } from "../store/Global";
import * as RAPIER from "@dimforge/rapier3d-compat";
import { Updateable } from "./Updateable";
import { PlayerModel } from "./ViewModel/PlayerModel";

export class Dummy extends Updateable {
	constructor(position: THREE.Vector3Like, rotation: THREE.Vector3Like) {
		super();
		const model = PlayerModel.skeleton();
		model.scale.multiplyScalar(0.0035);
		const group = new THREE.Group();
		group.add(model);

		const skinned = model.getObjectByName("Soldat") as THREE.SkinnedMesh<
			THREE.BufferGeometry,
			THREE.Material[]
		>;
		// [5, 6].forEach((matPos) => {
		// 	skinned.material[matPos].visible = true;
		// });
		const body = createBoneColliders(skinned, 0.1);

		group.position.copy(position);
		group.rotation.copy(
			new THREE.Euler(rotation.x, rotation.y, rotation.z, "XYZ")
		);
		// position.y += ;
		body.setTranslation(position, true);
		body.setRotation(group.quaternion, true);
		Global.scene.add(group);

		this.update = () => {
			group.quaternion.copy(body.rotation());
			group.position.copy(body.translation());
		};
	}
}

// Function to create a rigid body with multiple colliders (one per bone)
function createBoneColliders(
	skinnedMesh: THREE.SkinnedMesh,
	scaleDown: number
) {
	// Get the bones from the skinned mesh's skeleton
	const bones = skinnedMesh.skeleton.bones;

	// Create a fixed rigid body (you can also choose static based on your needs)
	const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
	const rigidBody = Global.world.createRigidBody(rigidBodyDesc);

	const list: THREE.Object3D[] = [bones[0]];
	const connection: [THREE.Object3D, THREE.Object3D][] = [];

	// Iterate through each bone and create a collider for it
	while (list.length) {
		const bone = list.pop();
		if (!bone || bone.name.includes("end")) {
			continue;
		}
		for (const child of bone.children) {
			connection.push([bone, child]);
			list.push(child);
		}
	}

	const dummyObj = new THREE.Object3D();

	// Get the world positions of the current bone and the next bone
	for (const [bone, nextBone] of connection) {
		const startPosition = new THREE.Vector3();
		bone.getWorldPosition(startPosition);
		startPosition.multiplyScalar(scaleDown);
		const endPosition = new THREE.Vector3();
		nextBone.getWorldPosition(endPosition);
		endPosition.multiplyScalar(scaleDown);

		const length = startPosition.distanceTo(endPosition);

		const capsuleShape = RAPIER.ColliderDesc.capsule(length, 0.05); // Adjust radius as needed

		const midPosition = new RAPIER.Vector3(
			(startPosition.x + endPosition.x) / 2,
			(startPosition.y + endPosition.y) / 2,
			(startPosition.z + endPosition.z) / 2
		);

		dummyObj.position.copy(startPosition);
		dummyObj.lookAt(endPosition);

		capsuleShape.setRotation(
			new RAPIER.Quaternion(
				dummyObj.quaternion.x,
				dummyObj.quaternion.y,
				dummyObj.quaternion.z,
				dummyObj.quaternion.w
			)
		);

		capsuleShape.setTranslation(
			midPosition.x * 10,
			midPosition.y * 10,
			midPosition.z * 10
		);
		capsuleShape.setMass(0.05);

		const collider = Global.world.createCollider(capsuleShape, rigidBody);
		collider.setCollisionGroups((0x2 << 16) | 0xffff);
		collider.setSensor(true);
	}

	rigidBody.setEnabledRotations(false, false, false, true);
	rigidBody.setEnabledTranslations(true, true, true, true);
	const fullShape = RAPIER.ColliderDesc.cylinder(0.6, 0.3);
	fullShape.mass = 0.05;
	fullShape.setTranslation(0, 0.6, 0);
	const collider = Global.world.createCollider(fullShape, rigidBody);
	collider.setCollisionGroups((0x1 << 16) | 0xffff);

	return rigidBody;
}
