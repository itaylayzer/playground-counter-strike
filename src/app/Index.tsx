import AssetLoader from "../components/AssetLoader";
import { useIndexScreen } from "../viewmodels/useIndexScreen";
import Assets from "../api/assetsLits";
import { useStyles } from "../hooks/useStyles";
import { GoDotFill } from "react-icons/go";
function App() {
	const {} = useIndexScreen();
	return (
		<>
			<AssetLoader items={Assets} />
			<div className="gameContainer">
				<div style={styles.dot}>
					<GoDotFill color="white" size={10} />
				</div>
			</div>
		</>
	);
}

const styles = useStyles({
	dot: {
		position: "absolute",
		top: "50%",
		left: "50%",
		translate: "-50% -50%",
		zIndex: 2,
	},
});

export default App;
