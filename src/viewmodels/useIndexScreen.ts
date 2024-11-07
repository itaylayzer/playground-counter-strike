import { useEffect, useState } from "react";
import { game } from "../game/game";
import { useAssetStore } from "../store/useAssetLoader";

export const useIndexScreen = () => {
	const assets = useAssetStore();

	const [done, setDone] = useState<boolean>(false);
	const [deltaTime, setDeltaTime] = useState<number>(0);

	useEffect(() => {
		if (assets.progress === 2 && !done) {
			game(assets, { setDeltaTime });
			setDone(true);
		}
	}, [assets.progress, done]);

	return { deltaTime };
};
