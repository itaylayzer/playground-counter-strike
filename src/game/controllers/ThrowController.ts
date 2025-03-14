import * as RAPIER from "@dimforge/rapier3d-compat";
import { Global } from "../store/Global";
import * as THREE from "three";

import {
	Emitter,
	Rate,
	Span,
	Position,
	Radius,
	Life,
	PointZone,
	Vector3D,
	Alpha,
	Scale,
	Color,
	RadialVelocity,
	ease,
	ColorSpan,
	Force,
	Texture,
} from "three-nebula";
import { Updateable } from "../player/Updateable";
import { LocalPlayer } from "../player/LocalPlayer";

class ThrowBomb extends Updateable {
	constructor(position: THREE.Vector3, direction: THREE.Vector3) {
		super();

		direction.multiplyScalar(30);
		const shpere = Global.assets.fbx.bomb.clone();
		shpere.scale.multiplyScalar(0.0001);

		const rigidBody = Global.world.createRigidBody(
			RAPIER.RigidBodyDesc.dynamic()
				.setAngularDamping(0.999)
				.setLinearDamping(0.9)
		);

		const collider = Global.world.createCollider(
			RAPIER.ColliderDesc.ball(0.25).setMass(100),
			rigidBody
		);

		collider.setCollisionGroups((0x04 << 16) | (0xffff ^ 0x1));
		rigidBody.setLinvel(direction, false);
		rigidBody.setAngvel(
			{
				x: Math.random() * Math.PI * 2,
				y: Math.random() * Math.PI * 2,
				z: Math.random() * Math.PI * 2,
			},
			false
		);
		rigidBody.setTranslation(position, true);

		shpere.position.copy(position);
		Global.scene.add(shpere);
		let exploded = false;
		let hasExploded = false;

		const explode = () => {
			hasExploded = true;

			Global.scene.remove(shpere);

			// let playerDistance = 0;
			let num = 0;
			Global.world.bodies.forEach((other) => {
				// add force here
				num++;
				if (other.handle == rigidBody.handle) return;

				const explosionForce = 30; // Adjust the force magnitude as needed
				if (other === null) return;
				const directionToBody = new THREE.Vector3().copy(
					other.translation()
				);
				directionToBody.sub(rigidBody.translation());
				directionToBody.normalize();
				const distance = new THREE.Vector3()
					.copy(other.translation())
					.distanceTo(rigidBody.translation());

				if (distance > 0) {
					let forceMagnitude = explosionForce / distance; // Decrease force with distance

					if (other.handle === LocalPlayer.instance.body.handle) {
						return;
						// 	playerDistance = distance;
						// 	if (!LocalPlayer.getInstance().forceMovement) return;
						// 	forceMagnitude *= 0.05;
					}
					directionToBody.multiplyScalar(forceMagnitude);
					other.applyImpulse(directionToBody, true);
				}
			});

			console.log("num", num);

			// if (playerDistance > 0) {
			// 	Global.cameraController.shake(playerDistance);
			// }

			// Global.world.removeRigidBody(rigidBody);

			const emitter = new Emitter();
			emitter
				.setLife(1)
				.setRate(new Rate(new Span(150, 150), new Span(0.4, 0.6)))
				.setPosition(shpere.position)
				.setInitializers([
					new Position(new PointZone(0, 0, 0)),
					new Radius(0.5, 0.8),
					new Life(
						// @ts-ignore
						new Span(1, 2)
					),

					new RadialVelocity(
						// @ts-ignore
						new Span(0.3, 0.8),
						new Vector3D(0, 0.4, 0),
						90
					),

					new Texture(THREE, Global.assets.textures.txt_circle, {
						blending: THREE.NormalBlending,
					}),
				])
				.setBehaviours([
					new Alpha(1, 0.1, undefined, ease.easeInExpo),
					new Scale(1, 0.1, undefined, ease.easeInExpo),
					// @ts-ignore
					new Color(
						// @ts-ignore
						new ColorSpan([
							"#d61e1e",
							"#db1f12",
							"#e06a09",
							"#d61e1e",
							"#db1f12",
							"#e06a09",
							"#d61e1e",
							"#db1f12",
							"#e06a09",
							"#ffffff",
							"#ffffff",
						])
					),
					new Force(0, 0.0004, 0),
				])
				.emit(1);

			Global.system.addEmitter(emitter);
		};

		this.update = () => {
			if (hasExploded) return;

			shpere.position.copy(rigidBody.translation());
			shpere.quaternion.copy(rigidBody.rotation());

			if (exploded) return;

			Global.world.contactPairsWith(collider, () => {
				setTimeout(() => {
					explode.bind(this)();
				}, 1000);
				exploded = true;
			});
		};
	}
}

export class ThrowController {
	public throw: (bone: THREE.Bone) => void;
	constructor() {
		this.throw = (bone: THREE.Bone) => {
			new ThrowBomb(
				bone.getWorldPosition(new THREE.Vector3()),
				Global.camera.getWorldDirection(new THREE.Vector3())
			);
		};
	}
}
