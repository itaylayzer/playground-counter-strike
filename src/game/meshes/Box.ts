import { Updateable } from "../player/Updateable";
import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import { Global } from "../store/Global";
export class Box extends Updateable {
	constructor(
		position: THREE.Vector3Like,
		size: THREE.Vector3Like,
		color: THREE.ColorRepresentation
	) {
		super();

		const mesh = new THREE.Mesh(
			new THREE.BoxGeometry(size.x, size.y, size.z),
			new THREE.MeshPhongMaterial({ color })
		);

		const body = Global.world.createRigidBody(
			RAPIER.RigidBodyDesc.dynamic()
		);

		body.setTranslation(
			new RAPIER.Vector3(position.x, position.y, position.z),
			true
		);
		const shape = RAPIER.ColliderDesc.cuboid(
			size.x / 2,
			size.y / 2,
			size.z / 2
		);
		shape.mass = 1;

		// copy position
		mesh.position.copy(position);

		const collider = Global.world.createCollider(shape, body);
		Global.scene.add(mesh);
		Global.debugRenderer.update();

		this.update = () => {
			mesh.position.copy(body.translation());
			mesh.quaternion.copy(collider.rotation());
		};
	}
}
