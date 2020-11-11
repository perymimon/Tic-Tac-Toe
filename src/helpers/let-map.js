const EventEmitter = require('events');
module.exports =
  class LetMap extends Map {
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
    emit(k){
        this.emitter.emit(k);
        this.emitter.emit('update');
    }
    set(k,nv){
        let ov = super.get(k);
        super.set(k,nv);
        this.emitter.emit(k,nv,ov);
        this.emitter.emit('update');

        return nv;
    }
    for(k){
        const {struct} = this;
        if (struct && !super.has(k)) {
            const s = typeof struct == 'function' ?
                struct(k) :
                new struct.constructor(struct)
            super.set(k, s)
        }
        return super.get(k);
    }
    get(k) {
       return this.for(...arguments)
    }
}
