import { KeyboardController } from "../controllers/KeyboardController";
import { Player } from "./Player";
import { LocalModel } from "./ViewModel/LocalModel";

export class LocalPlayer extends Player {
	constructor() {
		super(new KeyboardController(), LocalModel);
	}
}
