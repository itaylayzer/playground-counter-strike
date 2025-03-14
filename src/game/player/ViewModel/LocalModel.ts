import * as THREE from "three";
import { Global } from "../../store/Global";
import {
	A_P_Blender,
	A_P_Combined,
	A_P_Single,
	A_P_State,
	AnimationGraph,
} from "../../lib/animgraph";
import { Player } from "../Player";
import { AnimationUtils } from "../../lib/animgraph/AnimationUtils";
import { PlayerModel } from "./PlayerModel";
import {
	Alpha,
	ease,
	Emitter,
	Life,
	Position,
	RadialVelocity,
	Radius,
	Rate,
	Scale,
	Span,
	Vector3D,
	SphereZone,
	Texture,
	Color,
	ColorSpan,
	VectorVelocity,
} from "three-nebula";
export class LocalModel extends PlayerModel {
	constructor(player: Player) {
		super(player);
		const model = this.skeleton(true);
		const rifle = Global.assets.fbx.rifle.clone();
		{
			const rmesh = rifle.children[0] as THREE.Mesh;
			rmesh.material = new THREE.MeshPhongMaterial({ color: "#111" });
			// @ts-ignore
			rmesh.children[0].material = new THREE.MeshPhongMaterial({
				color: "#111",
			});
		}

		rifle.scale.multiplyScalar(0.0035);
		const skinned = model.getObjectByName("Soldat") as THREE.SkinnedMesh<
			THREE.BufferGeometry,
			THREE.Material[]
		>;

		const nose = skinned.skeleton.getBoneByName("Nose")!;

		this.onGround = false;
		model.position.y -= 0.6;
		model.scale.multiplyScalar(0.0035);

		// model.scale.x *= -1;;

		super.add(model);
		const gunA = skinned.skeleton.getBoneByName("GunA")!;
		gunA.attach(rifle);
		rifle.position.set(0, -0.2, 0);
		rifle.rotation.set(0, Math.PI / 2, 0);
		// super.add(rifle);
		const graph = new AnimationGraph(skinned);

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
		let LookingFromOutside = false;
		[5, 6].forEach((matPos) => {
			skinned.material[matPos].visible = LookingFromOutside;
		});

		let x: number = 0;
		let y: number = 0;
		let z: number = 0;
		graph.addVertex(
			new A_P_Combined([
				new A_P_State(
					[
						nomral_movementBlender,
						new A_P_Single(
							Global.assets.fbx.anim_jump_start.animations[0]
						),
						new A_P_Single(
							Global.assets.fbx.anim_jump_loop.animations[0]
						),
						new A_P_Single(
							Global.assets.fbx.anim_jump_end.animations[0],
							true,
							0.8
						),
						crouching_movementBlender,
					],
					[
						[0, 1, "normal_to_jump_start"],
						[4, 1, "crouch_to_jump_start"],
						[1, 2, "jump_start_loopend"],
						[2, 0, "end_to_normal"],
						[2, 4, "end_to_crounch"],
						[0, 4, "normal_to_crouch"],
						[4, 0, "crouch_to_normal"],
					]
				),

				new A_P_State(
					[
						new A_P_Single(Global.assets.fbx.h_idle.animations[0]),
						new A_P_Single(Global.assets.fbx.h_shoot.animations[0]),
						new A_P_Single(
							Global.assets.fbx.h_reload.animations[0]
						),
						new A_P_Single(
							Global.assets.fbx.h_grande.animations[0]
						),
					],

					[
						[0, 1, "aim_to_shoot"],
						[1, 1, "shoot_to_shoot"],
						[1, 2, "shoot_to_reload"],
						[1, 0, "shoot_to_aim"],
						[0, 2, "aim_to_reload"],
						[2, 0, "reload_to_aim"],
						[0, 3, "aim_to_toss"],
						[0, 3, "aim_to_toss"],
						[3, 0, "toss_to_aim"],
					]
				),
			])
		);
		graph.start(0);

		let isShooting = false,
			isThrowing = false,
			isReloading = false,
			justTrowhed = false;

		const bombMesh = Global.assets.fbx.bomb.clone();
		bombMesh.scale.multiplyScalar(0.00035 * 0.33);
		gunA.attach(bombMesh);
		bombMesh.position.set(0, 0, 0);
		const ammoMesh = rifle.children[0].children[0];
		const ammoData = [
			ammoMesh.position.clone(),
			ammoMesh.quaternion.clone(),
		];
		const CAMERA_ROT_MODES = [
			{ x: 0, y: 0.5, z: 0 },
			{ x: 0.9, y: -1.1, z: 0.7 },
		];

		const cameraRot = new THREE.Vector3(0, 0, 0);

		this.shoot = (x, y) => {
			isShooting = true;
			const explotion = new Emitter();
			const bullet = new Emitter();
			const quat = rifle.getWorldQuaternion(new THREE.Quaternion());
			const rifleDirection = new THREE.Vector3(-1, 0, 0).applyQuaternion(
				quat
			);
			const shootingDirection = new THREE.Vector3(
				-1,
				x * 10,
				y * 10
			).applyQuaternion(quat);

			const riflePosition = rifle.getWorldPosition(new THREE.Vector3());
			riflePosition.add(rifleDirection.clone().multiplyScalar(0.8));

			explotion
				.setLife(1)
				.setRate(new Rate(new Span(3, 3), new Span(0.1)))
				.setPosition(riflePosition)
				.setInitializers([
					new Position(new SphereZone(0, 0, 0, 0.1)),
					new Radius(0.05, 0.2),
					new Life(
						// @ts-ignore
						new Span(0.1)
					),
					new RadialVelocity(
						1,
						new Vector3D(
							shootingDirection.x,
							shootingDirection.y,
							shootingDirection.z
						),
						10
					),
					new Texture(THREE, Global.assets.textures.txt_circle, {
						blending: THREE.NormalBlending,
					}),
				])
				.setBehaviours([
					new Alpha(1, 0.1, undefined, ease.easeInExpo),
					new Scale(1, 0.1, undefined, ease.easeInCubic),
					// @ts-ignore

					new Color(
						// @ts-ignore
						new ColorSpan(["#ffffff", "#db611f", "#d9760d"])
					),
				])
				.emit(1);

			bullet
				.setLife(1)
				.setRate(new Rate(new Span(1, 1), new Span(0.2)))
				.setPosition(riflePosition)
				.setInitializers([
					new Position(new SphereZone(0, 0, 0, 0)),
					new Radius(0.02, 0.02),
					new Life(
						// @ts-ignore
						new Span(0.1)
					),
					new VectorVelocity(
						new Vector3D(
							shootingDirection.x,
							shootingDirection.y,
							shootingDirection.z
						),
						10
					),
					new Texture(THREE, Global.assets.textures.txt_circle),
				])
				.setBehaviours([
					new Alpha(1, 0.1, undefined, ease.easeInExpo),
					new Scale(1, 0.1, undefined, ease.easeInCubic),
					// @ts-ignore

					new Color(
						// @ts-ignore
						new ColorSpan("#ffffff")
					),
				])
				.emit(1);

			// add the emitter and a renderer to your particle system
			Global.system.addEmitter(explotion);
			// Global.system.addEmitter(bullet);
		};
		this.update = () => {
			const isWalking = [87, 83, 68, 65]
				.map((v) => player.keyboard.isKeyPressed(v))
				.reduce((a, b) => a || b);
			const isShifting = player.keyboard.isKeyPressed(16);
			const isCrouching = player.keyboard.isKeyPressed(17);
			const onJump = player.keyboard.isKeyDown(32);

			const movement =
				(2 * +isWalking - +(isShifting && isWalking && !isCrouching)) *
				+Global.lockController.isLocked;

			graph.update(
				{ movement },
				{
					normal_to_jump_start: onJump && !isCrouching,
					crouch_to_jump_start: onJump && isCrouching,
					end_to_crounch: this.onGround && isCrouching,
					end_to_normal: this.onGround && !isCrouching,
					jump_start_loopend: (clip) =>
						clip.getTime() >=
						clip.getDuration() - Global.deltaTime * 5,

					crouch_to_normal: player.keyboard.isKeyUp(17),
					normal_to_crouch: player.keyboard.isKeyDown(17),
					aim_to_shoot: isShooting,
					shoot_to_shoot: isShooting,
					shoot_to_aim: (clip) =>
						clip.getTime() >=
							clip.getDuration() - Global.deltaTime * 2 &&
						!isShooting,
					reload_to_aim: (clip) => {
						const b =
							clip.getTime() >=
							clip.getDuration() - Global.deltaTime * 20;

						if (
							clip.getTime() > 0.5 &&
							clip.getTime() < 1 &&
							!isReloading
						) {
							isReloading = true;

							const gunB =
								skinned.skeleton.getBoneByName("GunB")!;
							gunB.add(ammoMesh);
							ammoMesh.position.copy({
								x: 0.4,
								y: -0.1,
								z: 0.1,
							});
						}

						if (clip.getTime() > 1.6 && isReloading) {
							isReloading = false;
							rifle.children[0]?.add(ammoMesh);
							ammoMesh.position.copy(
								ammoData[0] as THREE.Vector3Like
							);
							ammoMesh.quaternion.copy(
								ammoData[1] as THREE.QuaternionLike
							);
						}

						return b;
					},
					aim_to_reload: player.keyboard.isKeyDown(82),
					aim_to_toss: () => {
						const r = player.keyboard.isKeyDown(70);

						r && ((isThrowing = true), (justTrowhed = false));
						return r;
					},
					toss_to_aim: (clip) => {
						const r =
							clip.getTime() >=
							clip.getDuration() - Global.deltaTime;

						if (isThrowing) {
							rifle.visible =
								clip.getTime() < 0.5 || clip.getTime() > 2;
							bombMesh.visible = !rifle.visible;

							if (clip.getTime() > 1.75 && !justTrowhed) {
								console.log("now");
								player.throwController.throw(gunA);
								justTrowhed = true;
							}
						}

						r && (isThrowing = false);

						return r;
					},
					shoot_to_reload: player.keyboard.isKeyDown(82),
				}
			);

			// Update position
			this.position.copy(player.body.translation());

			// Update spine rotation
			cameraRot.lerp(
				CAMERA_ROT_MODES[+rifle.visible],
				Global.deltaTime * 10
			);
			PlayerModel.alignBoneToCameraPitch(skinned, cameraRot);

			// spine.rotateX(-Global.camera.rotation.x);
			if (player.keyboard.isKeyDown(86)) {
				LookingFromOutside = !LookingFromOutside;

				[5, 6].forEach((matPos) => {
					skinned.material[matPos].visible = LookingFromOutside;
				});
			}

			model.position.y =
				-0.6 + 0.3 * +player.body.collider(2).isEnabled();

			x +=
				0.025 *
				(+player.keyboard.isKeyDown(97) +
					-+player.keyboard.isKeyDown(98));
			y +=
				0.025 *
				(+player.keyboard.isKeyDown(100) +
					-+player.keyboard.isKeyDown(101));
			z +=
				0.025 *
				(+player.keyboard.isKeyDown(103) +
					-+player.keyboard.isKeyDown(104));
			if (player.keyboard.isKeyDown(105)) {
				console.log([x, y, z]);
			}

			// Update camera position
			Global.camera.position
				.copy(nose.getWorldPosition(new THREE.Vector3()))
				.add(
					new THREE.Vector3(
						x - 0.15 + -0.2 * +LookingFromOutside,
						y + 0.15,
						z + 0.1 + 0.5 * +LookingFromOutside
					).applyQuaternion(Global.camera.quaternion)
				)
				.add(
					new THREE.Vector3(0, 0, 0).applyQuaternion(
						player.body.rotation()
					)
				);

			isShooting = false;
		};
	}
}
