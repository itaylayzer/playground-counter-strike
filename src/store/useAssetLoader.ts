import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { create } from "zustand";
import RAPIER from "@dimforge/rapier3d-compat";

// https://gero3.github.io/facetype.js/

export type loadedAssets = {
	gltf: { [key: string]: GLTF };
	fbx: { [key: string]: THREE.Group };
	textures: { [key: string]: THREE.Texture };
	fonts: { [key: string]: Font };
	sfx: { [key: string]: AudioBuffer };
	progress: number;
	buffer: { [key: string]: ArrayBuffer };
};

const defualtValue: loadedAssets = {
	fbx: {},
	fonts: {},
	gltf: {},
	textures: {},
	sfx: {},
	buffer: {},
	progress: 0,
};

type AssetStore = loadedAssets & {
	loadMeshes(items: Record<string, string>): Promise<void>;
	skipAssets: () => void;
};

class FetchLoader extends THREE.Loader<ArrayBuffer> {
	constructor(manager = THREE.DefaultLoadingManager) {
		super(manager);
	}

	public override load(
		url: string,
		onLoad: (data: ArrayBuffer) => void,
		onProgress?: (event: ProgressEvent) => void,
		onError?: (err: unknown) => void
	) {
		// Mark the beginning of the load
		const scope = this;
		this.manager.itemStart(url);

		fetch(url, {
			method: "GET",
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						`Fetch failed with status: ${response.status}`
					);
				}
				return response.arrayBuffer();
			})
			.then((buffer) => {
				onLoad && onLoad(buffer);
				onProgress &&
					onProgress(
						new ProgressEvent("finish", { loaded: 1, total: 1 })
					);
				scope.manager.itemEnd(url); // Mark the end of the load
			})
			.catch((error) => {
				onError && onError(error);
				scope.manager.itemError(url);
			});
	}
}

export const useAssetStore = create<AssetStore>((set) => ({
	...defualtValue,
	loadMeshes(items) {
		return new Promise<void>((resolve, reject) => {
			const loadingManager = new THREE.LoadingManager();

			const _assets = {
				gltf: {},
				fbx: {},
				textures: {},
				fonts: {},
				sfx: {},
				buffer: {},
			} as loadedAssets;

			const loaders = [
				new GLTFLoader(loadingManager),
				new FBXLoader(loadingManager),
				new THREE.TextureLoader(loadingManager),
				new FontLoader(loadingManager),
				new THREE.AudioLoader(loadingManager),
				new FetchLoader(loadingManager),
			] as THREE.Loader[];

			const itemsLength = Object.keys(items).length;
			let itemProgress = 0;
			let minerProgress = 0;

			const keys: Array<keyof loadedAssets> = [
				"gltf",
				"fbx",
				"textures",
				"fonts",
				"sfx",
				"buffer",
			];

			const exts = [
				[".gltf", ".glb"],
				[".fbx"],
				[".png", ".jpg"],
				[".typeface.json"],
				[".mp3", ".wav"],
				[".buff"],
			];

			for (const itemEntry of Object.entries(items)) {
				const [itemName, itemSrc] = itemEntry;

				const index = exts.findIndex((formats) => {
					for (const format of formats) {
						if (itemSrc.endsWith(format)) return true;
					}
					return false;
				});

				if (index < 0) continue;

				const selectedLoader = loaders[index];
				const selectedKey = keys[index];

				selectedLoader.load(
					itemSrc,
					(mesh1) => {
						// @ts-ignore
						_assets[selectedKey][itemName] = mesh1;

						itemProgress += 1 / itemsLength;
						minerProgress = 0;
						set({ progress: itemProgress });
					},
					(progres) => {
						minerProgress = progres.loaded / progres.total;
						set({
							progress:
								itemProgress + minerProgress / itemsLength,
						});
					},
					(error) => {
						reject(error);
					}
				);
			}

			loadingManager.onLoad = () => {
				set({ ..._assets });
				RAPIER.init().then(() => {
					set({ progress: 2 });
					resolve();
				});
			};
		});
	},
	skipAssets() {
		RAPIER.init().then(() => {
			set({ progress: 2 });
		});
	},
}));
