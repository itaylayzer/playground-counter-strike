import { TextureLoader, Vector3 } from "three";
import * as Nebula from "three-nebula";
import * as THREE from "three";
import { Global } from "../../store/Global";
export function bombEmitter(): Nebula.Emitter {
	// const textureLoader = new TextureLoader();
	// const explosionTexture = textureLoader.load(
	// 	"https://www.textures.com/download/Explosions/92521"
	// ); // Update with actual explosion texture URL

	const emitter = new Nebula.Emitter()
		.setRate(
			new Nebula.Rate(
				new Nebula.Span(100, 200),
				new Nebula.Span(0.1, 0.2)
			)
		)
		.addInitializers([
			new Nebula.Mass(1),
			new Nebula.Life(2, 4),
			new Nebula.Texture(THREE, Global.assets.textures.txt_circle, {
				blending: THREE.NormalBlending,
			}),
			new Nebula.Radius(10, 20),
			new Nebula.VectorVelocity(
				new Nebula.Vector3D(0, 5, 0),
				// @ts-ignore
				new Nebula.Span(60, 120)
			),
		])
		.addBehaviours([
			// @ts-ignore

			new Nebula.Color("rgba(255, 150, 0, 1)", "rgba(150, 50, 0, 0)"),
			new Nebula.Scale(1, 5),
			new Nebula.Gravity(0),
		]);

	return emitter;
}

export function molotovEmitter(): Nebula.Emitter {
	// const textureLoader = new TextureLoader();
	// const fireTexture = textureLoader.load(
	// 	"https://www.textures.com/download/Fire/101449"
	// ); // Update with fire texture URL

	const emitter = new Nebula.Emitter()
		.setRate(
			new Nebula.Rate(new Nebula.Span(30, 40), new Nebula.Span(0.2, 0.5))
		)
		.addInitializers([
			new Nebula.Mass(1),
			new Nebula.Life(5, 10),
			// new Nebula.Body(fireTexture),
			new Nebula.Texture(THREE, Global.assets.textures.txt_circle, {
				blending: THREE.NormalBlending,
			}),
			new Nebula.Radius(5, 15),
			new Nebula.VectorVelocity(
				new Nebula.Vector3D(0, 10, 0),
				// @ts-ignore

				new Nebula.Span(10, 20)
			),
		])
		.addBehaviours([
			// @ts-ignore

			new Nebula.Color("rgba(255, 140, 0, 1)", "rgba(255, 69, 0, 0)"),
			new Nebula.Alpha(1, 0),
			new Nebula.Scale(1, 3),
			new Nebula.Gravity(-0.2),
		]);

	return emitter;
}

export function smokeEmitter(): Nebula.Emitter {
	// const textureLoader = new TextureLoader();
	// const smokeTexture = textureLoader.load(
	// 	"https://www.textures.com/download/3DObjects/123016"
	// ); // Update with a valid smoke texture URL

	const emitter = new Nebula.Emitter()
		.setRate(
			new Nebula.Rate(new Nebula.Span(20, 30), new Nebula.Span(0.5, 1))
		)
		.addInitializers([
			new Nebula.Mass(1),
			new Nebula.Life(30, 40),
			// new Nebula.Body(smokeTexture),
			new Nebula.Texture(THREE, Global.assets.textures.txt_circle, {
				blending: THREE.NormalBlending,
			}),
			new Nebula.Radius(10, 30),
			new Nebula.VectorVelocity(
				new Nebula.Vector3D(0, 10, 0),
				// @ts-ignore

				new Nebula.Span(20, 40)
			),
		])
		.addBehaviours([
			new Nebula.Alpha(1, 0),
			new Nebula.Scale(1, 10),
			new Nebula.Gravity(0),
		]);

	return emitter;
}
