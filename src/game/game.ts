import { loadedAssets } from "../store/useAssetLoader";
import setup from "./api/setup";
import { Platform } from "./meshes/Platform";
import { Updateable } from "./player/Updateable";
import { Global } from "./store/Global";
import * as THREE from "three";
import { LocalPlayer } from "./player/LocalPlayer";
import { Box } from "./meshes/Box";
import { Dummy } from "./player/Dummy";

export function game(
	assets: loadedAssets,
	debug: boolean,
	react: { setDeltaTime: React.Dispatch<React.SetStateAction<number>> }
) {
	Global.assets = assets;
	Global.debugMode = debug;
	setup();

	new Platform({ x: 0, y: 0, z: 0 }, { x: 50, y: 3, z: 50 }, "#444");
	new Platform({ x: 0, y: 1.5, z: 5 }, { x: 2, y: 1, z: 2 }, "#333");
	new Platform({ x: 2, y: 1.5, z: 5 }, { x: 2, y: 1.5, z: 2 }, "#555");
	new Platform({ x: 4, y: 1.95, z: 5 }, { x: 2, y: 1.95, z: 2 }, "#666");

	new Box({ x: 10, y: 4, z: 0 }, { x: 1, y: 1, z: 1 }, "#ff0000");
	new Box({ x: 10, y: 4, z: 10 }, { x: 1, y: 1, z: 1 }, "#ff0000");
	new Box({ x: 10, y: 4, z: -10 }, { x: 1, y: 1, z: 1 }, "#ff0000");

	new Box({ x: 0, y: 4, z: -10 }, { x: 1, y: 1, z: 1 }, "#ff0000");

	new Box({ x: -10, y: 4, z: 0 }, { x: 1, y: 1, z: 1 }, "#ff0000");
	new Box({ x: -10, y: 4, z: 10 }, { x: 1, y: 1, z: 1 }, "#ff0000");
	new Box({ x: -10, y: 4, z: -10 }, { x: 1, y: 1, z: 1 }, "#ff0000");

	new LocalPlayer();
	new Dummy({ x: 2, y: 1.5, z: 15 }, { x: 0, y: Math.PI, z: 0 });
	new Dummy({ x: 0, y: 1.5, z: 15 }, { x: 0, y: Math.PI, z: 0 });
	new Dummy({ x: -2, y: 1.5, z: 15 }, { x: 0, y: Math.PI, z: 0 });

	const clock = new THREE.Clock();

	let accumulator = 0;

	const animationLoop = () => {
		requestAnimationFrame(animationLoop);

		Global.deltaTime = clock.getDelta();
		Global.elapsedTime = clock.getElapsedTime();
		Global.world.timestep = Global.deltaTime * 1;

		Updateable.update();
		Global.lod.update(Global.camera);

		Global.system.update();
		Global.renderer.render(Global.scene, Global.camera);

		accumulator += Global.deltaTime;
		Global.world.step();
		Global.debugMode && Global.debugRenderer.update();

		Global.renderCursor();
		react.setDeltaTime(1 / Global.deltaTime);
	};
	animationLoop();
	// Global.renderer.setAnimationLoop(animationLoop);
}
