import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import { Global } from "../store/Global";

export class Platform {
	public body: RAPIER.RigidBody;
	constructor(
		position: THREE.Vector3Like,
		size: THREE.Vector3Like,
		color: THREE.ColorRepresentation
	) {
		const mesh = new THREE.Mesh(
			new THREE.BoxGeometry(size.x, size.y, size.z),
			new THREE.MeshPhongMaterial({ color })
		);

		const body = Global.world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
		const shape = RAPIER.ColliderDesc.cuboid(
			size.x / 2,
			size.y / 2,
			size.z / 2
		);
		this.body = body;
		// copy position
		mesh.position.copy(position);
		shape.setTranslation(position.x, position.y, position.z);

		Global.world.createCollider(shape, body);
		Global.lod.add(mesh);
		Global.debugRenderer.update();
	}
}
