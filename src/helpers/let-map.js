const EventEmitter = require('events');


export default class LetMap extends Map {
    constructor(struct) {
        super();
        this.initStruct(struct);
        this.emitter = new EventEmitter();
    }

    on(...args) {
        return this.emitter.on(...args)
    }

    off(...args) {
        return this.emitter.off(...args)
    }

    initStruct(struct) {
        this.struct = struct;
    }

    emit(...args) {
        this.emitter.emit(...args);
        this.emitter.emit('update', ...args);
    }

    set(k, nv) {
        let ov = super.get(k);
        super.set(k, nv);
        this.emitter.emit(k /*event name*/, 'UPDATE', nv, ov);
        if (ov === void 0)
            this.emitter.emit('new', k, nv); /*no event update for that*/
        this.emitter.emit('update', k, nv, ov);
        return nv;
    }

    delete(k) {
        let ov = super.get(k);
        super.delete(k);
        this.emitter.emit(k /*event name*/, 'DELETE', ov);
        this.emitter.emit('delete', k, ov);
        this.emitter.emit('update', 'delete', k, ov);
    }

    for(k) {
        const {struct} = this;
        if (struct && !super.has(k)) {
            const s = typeof struct == 'function' ? struct(k) :
                struct.constructor ? new struct.constructor(struct) :
                    struct

            this.set(k, s)
        }
        return super.get(k);
    }
}

