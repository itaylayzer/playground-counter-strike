import { useEffect, useState } from "react";
import { game } from "../game/game";
import { useAssetStore } from "../store/useAssetLoader";

export const useIndexScreen = () => {
	const assets = useAssetStore();

	const [deltaTime, setDeltaTime] = useState<number>(0);

	useEffect(() => {
		if (assets.progress === 2) game(assets, { setDeltaTime });
	}, [assets.progress]);

	return { deltaTime };
};
