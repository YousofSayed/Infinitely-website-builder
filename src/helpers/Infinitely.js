export class Infinitely {
    #eventTarget
    constructor() {
        // this.eventName = eventName;
        this.#eventTarget = new EventTarget();
    }

    emit(eventName , eventData) {
        const event = new CustomEvent(eventName, { detail: eventData });
        this.#eventTarget.dispatchEvent(event); 
    }

    on(eventName, callback) {
        this.#eventTarget.addEventListener(eventName, callback); 
    }

    off(eventName, callback) {
        this.#eventTarget.removeEventListener(eventName, callback); 
    }
}

