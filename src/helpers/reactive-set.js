function emitUpdate() {
    for (let cb of this.updates) cb(...arguments)
}

module.exports =
    class ReactiveSet extends Set {
        constructor() {
            super();
            // this.emitter = new EventEmitter();
            this.updates = new Set();
        }

        observe(cb){
            if (typeof cb === 'function') {
                this.updates.add(cb);
                cb(this);
            }
            return function disconnect(){
                this.updates.remove(cb);
            }
        }

        add(v) {
            if(super.has(v)) return this;
            super.add(v);
            emitUpdate.call(this,'add',v)
            return this;
        }

        delete(v) {
            if(!super.has(v)) return this
            super.delete(v);
            emitUpdate.call(this,'delete',v)
        }

        clear() {
            super.clear();
            emitUpdate.call(this,'clear')
        }


    }
