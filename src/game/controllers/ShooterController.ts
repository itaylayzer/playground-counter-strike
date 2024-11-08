import * as THREE from "three";
import { Global } from "../store/Global";
import * as RAPIER from "@dimforge/rapier3d-compat";
import { Player } from "../player/Player";
import { clamp } from "three/src/math/MathUtils.js";
import AK47_RECOIL from "../data/ak47.json";
import { Dummy } from "../player/Dummy";
export class ShooterController {
	shoot: (x: number, y: number, debug?: boolean) => boolean;
	update: () => void;
	constructor(player: Player, shootForce: number, deltaTime: number) {
		let time = deltaTime;
		let relativeTime = time;
		let recoilNum = 0;
		const MAX_AMMO = 30;
		let ammo = MAX_AMMO;

		let isReloading: boolean = false;

		const getRecoil = () => {
			const [x, y] = AK47_RECOIL[recoilNum];
			return { x: (y + Math.sin(-y)) / 80, y: x / 80 };
		};

		const buildSprite = (
			body: RAPIER.Collider,
			pos: THREE.Vector3,
			normal: THREE.Vector3Like,
			debug = false
		) => {
			if (
				body.parent()!.bodyType() !== RAPIER.RigidBodyType.Dynamic &&
				!((body.collisionGroups() >> 16) & 0x02)
			) {
				const sprite = new THREE.Mesh(
					new THREE.PlaneGeometry(0.02, 0.02),
					new THREE.MeshBasicMaterial({
						transparent: true,
						map: Global.assets.textures.txt_circle.clone(),
						color: "black",
					})
				);
				sprite.position.copy(pos);
				const targetPosition = pos
					.clone()
					.add(new THREE.Vector3().copy(normal).multiplyScalar(0.01)); // Small offset along normal
				sprite.lookAt(targetPosition);
				sprite.position.copy(targetPosition);

				Global.scene.add(sprite);
				setTimeout(() => {
					Global.scene.remove(sprite);
				}, 1000);
			}

			if (debug) {
				const mesh = new THREE.Mesh(
					new THREE.BoxGeometry(0.1, 0.1, 0.1),
					new THREE.MeshStandardMaterial({
						wireframe: true,
						color: "black",
					})
				);
				mesh.position.copy(pos);
				Global.scene.add(mesh);
				setTimeout(() => {
					Global.scene.remove(mesh);
				}, 1000);
			}
		};

		this.shoot = (x: number, y: number, debug: boolean = false) => {
			if (time < deltaTime || ammo === 0 || isReloading) return false;
			time = 0;
			relativeTime = 0;
			ammo--;

			const rec = getRecoil();
			x -= rec.x;
			y -= rec.y;
			// Get the camera direction in world space
			const cameraDirection = new THREE.Vector3(
				-x,
				-y,
				-1
			).applyQuaternion(Global.camera.quaternion);

			// Convert THREE.js vectors to Cannon.js Vec3
			const from = Global.camera.position.clone();

			// Perform raycast
			const ray = new RAPIER.Ray(from, cameraDirection);
			const MAX_DISTANCE = 10000;
			const hit = Global.world.castRay(
				ray,
				MAX_DISTANCE,
				true,
				undefined,
				~1
			);

			// Check if the ray hit something
			if (hit) {
				const hitBody = hit.collider;

				const intersection = hit.timeOfImpact;
				const hitPoint = from
					.clone()
					.add(cameraDirection.clone().multiplyScalar(intersection));

				const info = hitBody.castRayAndGetNormal(
					ray,
					MAX_DISTANCE,
					true
				);
				if (info) buildSprite(hitBody, hitPoint, info.normal, debug);

				// Ensure the hit body has mass (i.e., is not static)
				if (
					!!hitBody &&
					player.body.handle !== hitBody.handle &&
					hitBody.mass() > 0
				) {
					const dummy = Dummy.map.get(hitBody.handle);
					dummy && dummy.dummy.damage(dummy.isHead);

					hitBody.handle;
					// Calculate the direction of the impulse
					const impulseDirection = new THREE.Vector3(
						cameraDirection.x * shootForce,
						cameraDirection.y * shootForce,
						cameraDirection.z * shootForce
					);

					// Apply the impulse to the hit body at the hit point
					hitBody.parent()!.applyImpulse(impulseDirection, true);
				}
			}

			recoilNum++;
			if (recoilNum > 30) {
				recoilNum = 29;
			}

			return true;
		};

		let cursorPoint = new THREE.Vector2();
		const multiplier = 300;
		const cursor = document.getElementById("cursor")!;

		this.update = () => {
			const dt = Global.deltaTime * 1000;
			time += dt;
			relativeTime += dt;
			if (relativeTime > deltaTime * 1.5) {
				recoilNum -= 2;
				if (recoilNum <= 0) relativeTime = 0;
			}
			if (player.keyboard.isKeyDown(82) && !isReloading) {
				isReloading = true;
				setTimeout(() => {
					ammo = MAX_AMMO;
					isReloading = false;
				}, 3000);
			}
			recoilNum = clamp(recoilNum, 0, 30);
			Global.renderCursor = () => {
				const rec = getRecoil();
				const x = -rec.x;
				const y = -rec.y;
				// Get the camera direction in world space
				const cameraDirection = new THREE.Vector3(
					-x,
					-y,
					-1
				).applyQuaternion(Global.camera.quaternion);

				const point = Global.camera.position
					.clone()
					.add(cameraDirection);
				const screenPosition = point.project(Global.camera);

				const halfWidth = Global.renderer.domElement.width / 2;
				const halfHeight = Global.renderer.domElement.height / 2;

				const pixelX = screenPosition.x * halfWidth + halfWidth;
				const pixelY = -(screenPosition.y * halfHeight) + halfHeight;

				cursorPoint.lerp(
					{ x: pixelX - halfWidth, y: pixelY - halfHeight },
					Global.deltaTime * 12
				);
				cursor.style.translate = `${cursorPoint.x}px ${cursorPoint.y}px`;
			};
		};
	}
}
