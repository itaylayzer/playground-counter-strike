import RAPIER from "@dimforge/rapier3d-compat";
import { Player } from "../player/Player";
import * as THREE from "three";
import { Global } from "../store/Global";

// Only works on Fixed objects

export class BoneController {
	public update: () => void;
	constructor(player: Player) {
		const scaleDown: number = 0.1;
		console.log(player.model);
		const skinnedMesh = player.model.getObjectByName(
			"Soldat"
		) as THREE.SkinnedMesh;
		console.log(skinnedMesh.skeleton.bones.map((v) => v.name));

		const createBoneColliders = () => {
			// Get the bones from the skinned mesh's skeleton
			const bones = skinnedMesh.skeleton.bones;

			const list: THREE.Object3D[] = [bones[0]];
			const connection: [THREE.Object3D, THREE.Object3D][] = [];

			// Iterate through each bone and create a collider for it
			while (list.length) {
				const bone = list.pop();
				if (
					!bone ||
					bone.name.includes("end") ||
					bone.name.includes("End") ||
					bone.name.includes("hand") ||
					bone.name.includes("Nose") ||
					bone.name.includes("Eyes") ||
					(bone.name.includes("tHand") &&
						!bone.name.endsWith("tHand"))
				) {
					continue;
				}
				for (const child of bone.children) {
					connection.push([bone, child]);
					list.push(child);
				}
			}

			const dummyObj = new THREE.Object3D();

			// Get the world positions of the current bone and the next bone

			const collidersUpdate: (() => void)[] = [];

			const rigidBody = Global.world.createRigidBody(
				RAPIER.RigidBodyDesc.fixed()
			);

			for (const [bone, nextBone] of connection) {
				const startPosition = new THREE.Vector3();
				bone.getWorldPosition(startPosition);
				startPosition.multiplyScalar(scaleDown);

				const endPosition = new THREE.Vector3();
				nextBone.getWorldPosition(endPosition);
				endPosition.multiplyScalar(scaleDown);

				const isHead = bone.name.includes("Head");
				const length = startPosition.distanceTo(endPosition);

				const capsuleShape = RAPIER.ColliderDesc.capsule(
					length,
					0.05 * (1 + +isHead)
				); // Adjust radius as needed

				dummyObj.position.copy(startPosition);
				dummyObj.lookAt(endPosition);

				capsuleShape.setMass(0.05);

				const collider = Global.world.createCollider(
					capsuleShape,
					rigidBody
				);
				collider.setCollisionGroups(0);
				collider.setSensor(true);

				collidersUpdate.push(() => {
					const startPosition = new THREE.Vector3();
					bone.getWorldPosition(startPosition);
					startPosition.multiplyScalar(scaleDown);
					const endPosition = new THREE.Vector3();
					nextBone.getWorldPosition(endPosition);
					endPosition.multiplyScalar(scaleDown);

					const midPosition = new RAPIER.Vector3(
						(startPosition.x + endPosition.x) / 2,
						(startPosition.y + endPosition.y) / 2,
						(startPosition.z + endPosition.z) / 2
					);

					dummyObj.position.copy(startPosition);
					dummyObj.lookAt(endPosition);

					collider.setRotation(
						new RAPIER.Quaternion(
							dummyObj.quaternion.x,
							dummyObj.quaternion.y,
							dummyObj.quaternion.z,
							dummyObj.quaternion.w
						)
					);

					collider.setTranslation({
						x: midPosition.x * 10,
						y: midPosition.y * 10,
						z: midPosition.z * 10,
					});
				});
			}

			return {
				updateBones() {
					collidersUpdate.forEach((v) => v());
				},
			};
		};

		const { updateBones } = createBoneColliders();

		this.update = updateBones;
	}
}
