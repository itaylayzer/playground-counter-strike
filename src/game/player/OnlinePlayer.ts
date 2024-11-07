import { IKeyboardController } from "../controllers/IKeyboardController";
import { Player } from "./Player";
import { OnlineModel } from "./ViewModel/OnlineModel";

export class LocalPlayer extends Player {
	constructor() {
		super(new IKeyboardController(), OnlineModel);
	}
}
