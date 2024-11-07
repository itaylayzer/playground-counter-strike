import { loadedAssets } from "../store/useAssetLoader";
import setup from "./api/setup";
import { Platform } from "./meshes/Platform";
import { Updateable } from "./player/Updateable";
import { Global } from "./store/Global";
import * as THREE from "three";
import { LocalPlayer } from "./player/LocalPlayer";
import { KeyboardController } from "./controllers/KeyboardController";

export function game(
	assets: loadedAssets,
	react: { setDeltaTime: React.Dispatch<React.SetStateAction<number>> }
) {
	Global.assets = assets;
	setup();

	new Platform({ x: 0, y: 0, z: 0 }, { x: 10, y: 1, z: 50 }, "#555");
	// new Box({ x: 0, y: 10, z: 0 }, { x: 1, y: 1, z: 1 }, "#ff0000");

	new LocalPlayer(new KeyboardController());

	const clock = new THREE.Clock();

	const timestep = 1 / 60; // 60 updates per second
	let accumulator = 0;

	const animationLoop = () => {
		requestAnimationFrame(animationLoop);

		Global.deltaTime = clock.getDelta();
		Global.elapsedTime = clock.getElapsedTime();
		Global.world.timestep = Global.deltaTime * 2;

		Updateable.update();
		Global.lod.update(Global.camera);

		Global.renderer.render(Global.scene, Global.camera);

		accumulator += Global.deltaTime;

		while (accumulator >= timestep) {
			Global.world.step(); // Perform the physics update
			accumulator -= timestep;
		}

		Global.debugRenderer.update();
		react.setDeltaTime(Global.deltaTime);
	};
	animationLoop();
	// Global.renderer.setAnimationLoop(animationLoop);
}
