import {
    AnimationAction,
    AnimationClip,
    AnimationMixer,
    LoopOnce,
    LoopRepeat
} from "three";
import { A_Vertex } from "./A_Vertex";

export class A_V_Single extends A_Vertex {
    private action: AnimationAction;
    constructor(
        mixer: AnimationMixer,
        clip: AnimationClip,
        startOverOnFadeIn: boolean = true,
        private start: number = 0,
        private end: number | undefined = undefined,
        loop: boolean = true
    ) {
        super();
        this.action = mixer.clipAction(clip);
        this.action.play();
        this.action.loop = loop ? LoopRepeat : LoopOnce;
        this.onFadeIn = () => {
            if (startOverOnFadeIn) {
                this.action.time = this.start;
                if (!loop) {
                    this.action.play();
                }
            }
        };

        this.innerUpdate = () => {
            if (this.end && this.action.time > this.end) {
                if (loop) this.action.time = this.start;
                else this.action.stop();
            }
        };
    }
    protected anim_setEffectiveWeight(weight: number): void {
        this.action.setEffectiveWeight(weight);
    }

    public getDuration(): number {
        return this.end === undefined
            ? this.action.getClip().duration - this.start
            : this.end - this.start;
    }
    public getTime(): number {
        return this.action.time - this.start;
    }

    public getAction(): AnimationAction {
        return this.action;
    }
}
