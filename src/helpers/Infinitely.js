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

    /**
     * 
     * @param {string} eventName 
     * @param {(event:CustomEvent)=>void} callback 
     */
    on(eventName, callback) {
        this.#eventTarget.addEventListener(eventName, callback); 
    }

     /**
     * 
     * @param {string} eventName 
     * @param {(event:CustomEvent)=>void} callback 
     */
    off(eventName, callback) {
        this.#eventTarget.removeEventListener(eventName, callback); 
    }
}

