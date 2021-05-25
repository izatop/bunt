import {StateType} from "../interfaces";

const weakState = new WeakMap<any, unknown>();

export class ShadowState {
    public static get<SS>(state: StateType): SS {
        return weakState.get(state) as SS;
    }

    public static set<SS>(state: StateType, shadowState: SS): void {
        weakState.set(state, shadowState);
    }
}
