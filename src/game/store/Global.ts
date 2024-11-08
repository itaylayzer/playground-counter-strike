import { LOD, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { loadedAssets } from "../../store/useAssetLoader";
import * as RAPIER from "@dimforge/rapier3d-compat";
import { FBXLoader, PointerLockControls } from "three/examples/jsm/Addons.js";
import { RapierDebugRenderer } from "../api/RapierDebugRenderer";
import { CameraController } from "../controllers/CameraController";
import System from "three-nebula";

export class Global {
	static scene: Scene;
	static container: HTMLDivElement;
	static renderer: WebGLRenderer;
	static camera: PerspectiveCamera;
	static cameraController: CameraController;
	static deltaTime: number = 0;
	static elapsedTime: number = 0;
	static assets: loadedAssets;
	static lockController: PointerLockControls;
	static world: RAPIER.World;
	static lod: LOD;
	static stats: Stats;
	static debugRenderer: RapierDebugRenderer;
	static system: System;
	static recoil: { x: number; y: number };
	static renderCursor: any;
	static fbxLoader: FBXLoader;
	static debugMode:boolean;
	
}
