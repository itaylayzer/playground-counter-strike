import { PointerLockControls } from "three/examples/jsm/Addons.js";
import { Global } from "../store/Global";
import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { RapierDebugRenderer } from "./RapierDebugRenderer";
import { CameraController } from "../controllers/CameraController";

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
	Global.scene.background = new THREE.Color("#fff");
	// Global.scene.fog = new THREE.Fog(Global.scene.background, 10, 20);

	Global.lod = new THREE.LOD();
	Global.scene.add(Global.lod);
}

function setupPhysicsWorld() {
	Global.world = new RAPIER.World(new RAPIER.Vector3(0, -9.81, 0));
	Global.world.numSolverIterations = 16;

	Global.debugRenderer = new RapierDebugRenderer(Global.scene, Global.world);
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

export default () => {
	setupScene();
	setupPhysicsWorld();

	setupControllers();
	setupWindowEvents();

	setupLights();
};
