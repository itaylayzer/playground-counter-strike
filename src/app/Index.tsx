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
					<GoDotFill id="cursor" color="#6e0c20" size={15} />
				</div>
			</div>
			<p style={styles.header}>
				playground | counter strike -{" "}
				<a style={styles.href} href="http://itaylayzer.github.io/">
					itay layzer
				</a>
				<br />
				move with A,S,D,W. throw with F
				<br />
				shoot with mouse 0. unlock with Escape
				<br />
				[fullscreen]: silent movement with Shift. crouch with Ctrl.
				<br />
				[numpad]: move camera with 124578.
				<br />
				for collision debug mode add "/?debug" in url.
			</p>
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
	header: {
		zIndex: 2,
		color: "white",
		fontSize: 16,
		position: "absolute",
		boxSizing: "border-box",
		display: "block",
		bottom: 0,
		left: "10px",
		fontFamily: "monospace",
		textAlign: "left",
		width: "fit-content",
	},
	href: {
		color: "rgb(41, 131, 255)",
	},
});

export default App;
