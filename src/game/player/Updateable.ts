export class Updateable {
	public static children: Updateable[];

	static {
		this.children = [];
	}
	static update() {
		this.children.forEach((v) => v.update());
	}

	public update: () => void;
	constructor() {
		Updateable.children.push(this);
		this.update = () => {};
	}
}
