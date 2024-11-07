import AssetLoader from "../components/AssetLoader";
import { useIndexScreen } from "../viewmodels/useIndexScreen";
import Assets from "../api/assetsLits";
function App() {
	const { deltaTime } = useIndexScreen();
	return (
		<>
			<AssetLoader items={Assets} />
			<div className="gameContainer" />
			<p style={{ position: "absolute", top: 0, left: 0 }}>{deltaTime}</p>
		</>
	);
}

export default App;
