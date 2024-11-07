import { AnimationClip, VectorKeyframeTrack, SkinnedMesh } from "three";

export class AnimationUtils {
	static adjustClipSpeed(clip: AnimationClip, x: number) {
		for (let track of clip.tracks) {
			// Adjust the times array of the track
			for (let i = 0; i < track.times.length; i++) {
				track.times[i] /= x; // Scale each time by 1 / X
			}
		}

		// Optionally, adjust the clip's duration
		clip.duration /= x;
		return clip;
	}
	static resetHips(
		clip: AnimationClip,
		hipsName: string = "Hips"
	): AnimationClip {
		// Find the Hips position track in the clip
		const hipsTrack = clip.tracks.find(
			(track) =>
				track.name.endsWith(".position") &&
				track.name.includes(hipsName)
		) as VectorKeyframeTrack | undefined;

		if (!hipsTrack) {
			console.warn("No Hips position track found in the animation clip.");
			return clip;
		}

		// Extract the default Y position (usually the first frame's Y position)
		const values = hipsTrack.values;
		const yOffset = values[1]; // The second value in the array (0: x, 1: y, 2: z for each keyframe)

		// Loop through each keyframe in the Hips position track and set X and Z to 0, keep Y constant
		for (let i = 0; i < values.length; i += 3) {
			values[i] = 0; // X component
			values[i + 1] = yOffset; // Y component (default height)
			values[i + 2] = 0; // Z component
		}

		return clip;
	}

	static cutBonesA() {
		// Filter the tracks to keep only those affecting the specified bones
	}
	static cutBones: {
		(
			clip: AnimationClip,
			bones: string[] | ((bone: string) => boolean),
			furtherBonesNames?: string[]
		): void;
		AncestorOf(
			ancestorNames: string[],
			skinnedMesh: SkinnedMesh
		): (boneName: string) => boolean;
		OppositeOf(
			func: (boneName: string) => boolean
		): (boneName: string) => boolean;
	};

	static {
		const AncestorOf = (
			ancestorNames: string[],
			skinnedMesh: SkinnedMesh
		) => {
			return (boneName: string) => {
				const bone = skinnedMesh.skeleton.getBoneByName(
					boneName.includes(".") ? boneName.split(".")[0] : boneName
				)!;
				if (bone === undefined) {
					return true;
				}
				let allow = true;
				bone.traverseAncestors((v) => {
					if (ancestorNames.includes(v.name)) allow = false;
				});

				return allow;
			};
		};

		const OppositeOf = (func: (boneName: string) => boolean) => {
			return (boneName: string) => {
				return !func(boneName);
			};
		};

		const cutBones = (
			clip: AnimationClip,
			bones: string[] | ((bone: string) => boolean),
			furtherBonesNames: string[] = []
		) => {
			clip.tracks = clip.tracks.filter((track) => {
				// Extract the bone name from the track's name
				const trackName = track.name;
				const boneName = trackName.split(".")[0];

				if (furtherBonesNames.includes(boneName)) return true;
				// Check if the bone name is in the list of bones to keep
				if (Array.isArray(bones)) return bones.includes(boneName);
				else {
					return bones(boneName);
				}
			});
		};

		const helper = cutBones;
		// @ts-ignore
		helper.AncestorOf = AncestorOf;
		// @ts-ignore
		helper.OppositeOf = OppositeOf;
		// @ts-ignore
		this.cutBones = helper;
	}
}
