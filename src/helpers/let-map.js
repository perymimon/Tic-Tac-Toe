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

        emit(k, nv, ov,...rest) {
            this.emitter.emit(k, nv, ov,...rest);
            this.emitter.emit('update');
        }

        set(k, nv) {
            let ov = super.get(k);
            super.set(k, nv);
            if(ov === void 0)
                this.emitter.emit('new', nv);
            this.emit(k, nv, ov);
            return nv;
        }

        delete(k) {
            let ov = super.get(k);
            super.delete(k);
            this.emit('delete', ov);
        }

        for(k) {
            const {struct} = this;
            if (struct && !super.has(k)) {
                const s = typeof struct == 'function' ? struct(k) :
                        struct.constructor? new struct.constructor(struct):
                        struct

                this.set(k, s)
            }
            return super.get(k);
        }
    }
