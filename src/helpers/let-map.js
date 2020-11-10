const EventEmitter = require('events');

export default class LetMap extends Map {
    constructor(struct) {
        super();
        this.initStruct(struct);
        this.emitter = new EventEmitter();
    }
    on(...args){
        return this.emitter.on(...args)
    }
    off(...args){
        return this.emitter.off(...args)
    }

    initStruct(struct) {
        this.struct = struct;
    }
    set(k,nv){
        let ov = super.get(k);
        super.set(k,nv);
        return this.emitter.emit(k,nv,ov);
    }
    get(k) {
        if (this.struct && !super.has(k)) {
            const {struct} = this;
            const s = typeof struct == 'function' ?
                struct(k) :
                new struct.constructor(struct)
            super.set(k, s)
        }
        return super.get(k);
    }
}
