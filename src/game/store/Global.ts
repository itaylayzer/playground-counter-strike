import { LOD, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { loadedAssets } from "../../store/useAssetLoader";
import * as RAPIER from "@dimforge/rapier3d-compat";
import { PointerLockControls } from "three/examples/jsm/Addons.js";
import { RapierDebugRenderer } from "../api/RapierDebugRenderer";
import { CameraController } from "../controllers/CameraController";

export class Global {
	public static scene: Scene;
	public static container: HTMLDivElement;
	public static renderer: WebGLRenderer;
	public static camera: PerspectiveCamera;
	public static cameraController: CameraController;
	public static deltaTime: number = 0;
	public static elapsedTime: number = 0;
	public static assets: loadedAssets;
	public static lockController: PointerLockControls;
	public static world: RAPIER.World;
	public static lod: LOD;
	public static stats: Stats;
	static debugRenderer: RapierDebugRenderer;
}
