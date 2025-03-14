import { FBXLoader, PointerLockControls } from "three/examples/jsm/Addons.js";
import { Global } from "../store/Global";
import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { RapierDebugRenderer } from "./RapierDebugRenderer";
import { CameraController } from "../controllers/CameraController";
import { AnimationUtils } from "../lib/animgraph/AnimationUtils";
import { BoneUtils } from "../lib/animgraph/BoneUtils";

import System, { SpriteRenderer } from "three-nebula";
import { PlayerModel } from "../player/ViewModel/PlayerModel";

function setupScene() {
	Global.container = document.querySelector("div.gameContainer")!;
	Global.renderer = new THREE.WebGLRenderer({
		antialias: true,
	});

	Global.renderer.setSize(
		Global.container.clientWidth,
		Global.container.clientHeight
	);
	Global.renderer.shadowMap.enabled = true;
	Global.container.appendChild(Global.renderer.domElement);
	Global.scene = new THREE.Scene();

	const pmremGenerator = new THREE.PMREMGenerator(Global.renderer);

	const envMap = pmremGenerator.fromEquirectangular(
		Global.assets.textures.txt_skybox
	).texture;

	// Set the environment map as the background
	Global.scene.background = envMap;

	// Optionally, set it as an environment map for reflective materials
	Global.scene.environment = envMap;

	// Global.scene.fog = new THREE.Fog(Global.scene.background, 10, 20);

	Global.lod = new THREE.LOD();
	Global.scene.add(Global.lod);
}

function setupPhysicsWorld() {
	Global.world = new RAPIER.World(new RAPIER.Vector3(0, -9.81, 0));
	Global.world.numSolverIterations = 16;
	if (Global.debugMode)
		Global.debugRenderer = new RapierDebugRenderer(
			Global.scene,
			Global.world
		);
}

function setupControllers() {
	Global.camera = new THREE.PerspectiveCamera(
		90,
		Global.container.clientWidth / Global.container.clientHeight,
		0.001,
		10000
	);
	Global.cameraController = new CameraController(Global.camera);
	Global.lockController = new PointerLockControls(
		Global.camera,
		Global.renderer.domElement
	);

	const LOCKED_KEYS = [
		"MetaLeft",
		"MetaRight",
		"Tab",
		"KeyN",
		"KeyT",
		"Escape",
		"KeyS",
		"KeyW",
	];

	if (window.self === window.top) {
		if (!("keyboard" in navigator)) {
			alert("Your browser does not support the Keyboard Lock API.");
		}
	}

	// @ts-ignore
	Global.lockController.addEventListener("lock", function () {
		// @ts-ignore
		navigator.keyboard.lock(LOCKED_KEYS);
	});

	// @ts-ignore
	Global.lockController.addEventListener("unlock", function () {
		// @ts-ignore
		navigator.keyboard.unlock(LOCKED_KEYS);
	});
}

function setupWindowEvents() {
	Global.container.addEventListener("contextmenu", (event) => {
		event.preventDefault();
	});
	Global.container.addEventListener("click", () => {
		Global.lockController.lock();
	});
	Global.container.addEventListener("mousemove", (e) => {
		Global.cameraController.updateMouseMovement(e.movementX, e.movementY);
	});
	window.addEventListener("resize", () => {
		const s = 1;
		Global.camera.aspect = window.innerWidth / window.innerHeight;
		Global.camera.updateProjectionMatrix();

		Global.renderer.setSize(s * window.innerWidth, s * window.innerHeight);
	});
}

function setupLights() {
	const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
	hemiLight.color = new THREE.Color("#ffffff");
	hemiLight.groundColor.setHSL(0.095, 1, 0.75);
	hemiLight.position.set(0, 50, 0);
	Global.scene.add(hemiLight);

	const dirLight = new THREE.DirectionalLight(0xffffff, 2);
	dirLight.color = new THREE.Color("#ffffff");
	dirLight.position.set(-1, 1.75, 1);
	dirLight.position.multiplyScalar(30);
	Global.scene.add(dirLight);

	dirLight.castShadow = true;

	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;
	dirLight.shadow.blurSamples = 1;

	const d = 50;

	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;

	dirLight.shadow.camera.far = 3500;
	dirLight.shadow.camera.near = 0;
	dirLight.shadow.bias = -0.0001;
}

function setupAssets() {
	Global.fbxLoader = new FBXLoader();

	const skinnedMesh = PlayerModel.skeleton().getObjectByName(
		"Soldat"
	) as THREE.SkinnedMesh<THREE.BufferGeometry, THREE.Material[]>;

	// -------- setup animationsq

	const animationList = [
		[
			Global.assets.fbx.anim_crouch_idle.animations[0],
			Global.assets.fbx.anim_crouch_walk.animations[0],
			Global.assets.fbx.anim_jump_start.animations[0],
			Global.assets.fbx.anim_jump_loop.animations[0],
			Global.assets.fbx.anim_jump_end.animations[0],
			Global.assets.fbx.walk.animations[0],
			Global.assets.fbx.idle.animations[0],
		],
		[
			Global.assets.fbx.h_idle.animations[0],
			Global.assets.fbx.h_shoot.animations[0],
			Global.assets.fbx.h_reload.animations[0],
			Global.assets.fbx.h_grande.animations[0],
		],
	];

	const higherBones = BoneUtils.getAllChildrenNames(
		skinnedMesh,
		"mixamorigSpine2",
		true
	);
	const lowerBones = BoneUtils.not(skinnedMesh, higherBones);
	for (const anim of animationList[0]) {
		AnimationUtils.resetHips(anim);
		AnimationUtils.cutBones(anim, lowerBones);
	}

	AnimationUtils.adjustClipSpeed(Global.assets.fbx.walk.animations[0], 1.5);
	AnimationUtils.adjustClipSpeed(
		Global.assets.fbx.anim_crouch_walk.animations[0],
		0.5
	);

	for (const anim of animationList[1]) {
		AnimationUtils.cutBones(anim, higherBones);
	}
}

function setupSystem() {
	const renderer = new SpriteRenderer(Global.scene, THREE);
	Global.system = new System();
	Global.system.addRenderer(renderer);
}

export default () => {
	setupScene();
	setupPhysicsWorld();

	setupControllers();
	setupWindowEvents();

	setupAssets();
	setupLights();

	setupSystem();
};
