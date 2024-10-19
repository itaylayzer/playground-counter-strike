import AssetLoader from "../components/AssetLoader";
import { useIndexScreen } from "../viewmodels/useIndexScreen";

function App() {
	const { deltaTime } = useIndexScreen();
	return (
		<>
			<AssetLoader />
			<div className="gameContainer" />
			<p style={{ position: "absolute", top: 0, left: 0 }}>{deltaTime}</p>
		</>
	);
}

export default App;
