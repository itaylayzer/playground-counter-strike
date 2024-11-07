export class EventTarget<T extends Record<string, any> = Record<string, any>> {
    private listeners: Record<keyof T, Array<(event: any) => void>>;
    constructor() {
        this.listeners = {} as Record<keyof T, Array<(event: any) => void>>;
    }
    addEventListener<K extends keyof T>(
        key: K,
        listener: (event: T[K]) => void
    ): void {
        const list = this.listeners[key] ?? [];
        list.push(listener);
        this.listeners[key] = list;
    }
    removeEventListener<K extends keyof T>(key: K, listener: T[K]): void {
        let list = this.listeners[key] ?? [];
        list = list.filter(v=>v!==listener);
        this.listeners[key] = list;
    }

    protected callEvents<K extends keyof T>(key: K, arg: T[K]) {
        const list = this.listeners[key]??[];
        for (const l of list){
            l(arg);
        }
    }
}
