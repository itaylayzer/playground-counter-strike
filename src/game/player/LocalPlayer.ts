import { KeyboardController } from "../controllers/KeyboardController";
import { Player } from "./Player";
import { LocalModel } from "./ViewModel/LocalModel";

export class LocalPlayer extends Player {
	static instance: LocalPlayer;
	constructor() {
		super(new KeyboardController(), LocalModel);
		LocalPlayer.instance = this;
	}
}
