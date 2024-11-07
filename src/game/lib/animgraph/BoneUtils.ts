import { SkinnedMesh } from "three";

export class BoneUtils {
	static not(skinnedMesh: SkinnedMesh, higherBones: string[]) {
		return skinnedMesh.skeleton.bones
			.map((v) => v.name)
			.filter((v) => !higherBones.includes(v));
	}
	static getAllChildrenNames(
		skinnedMesh: SkinnedMesh,
		boneName: string,
		addBoneName: boolean
	) {
		const list = addBoneName ? [boneName] : [];
		const bone = skinnedMesh.skeleton.getBoneByName(boneName)!;

		bone.traverse((b) => {
			list.push(b.name);
		});
		return list;
	}
}
