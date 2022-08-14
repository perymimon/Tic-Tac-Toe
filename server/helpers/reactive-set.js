function emitUpdate(action, value) {
    for (let cb of this.updates) cb(action, value, /*dis*/_ => this.unobserve(cb))
}

module.exports =
    class ReactiveSet extends Set {
        constructor() {
            super(...arguments);
            // this.emitter = new EventEmitter();
            this.updates = new Set();
        }

        observe(cb) {
            if (typeof cb === 'function') {
                this.updates.add(cb);
                cb(this);
            }

        }

        unobserve(cb) {
            if (!cb) this.updates.clear();
            else this.updates.delete(cb);
        }

        add(v) {
            if (super.has(v)) return this;
            super.add(v);
            emitUpdate.call(this, 'ADD', v)
            return this;
        }

        delete(v) {
            if (!super.has(v)) return this
            super.delete(v);
            emitUpdate.call(this, 'DELETE', v)
        }

        clear() {
            super.clear();
            emitUpdate.call(this, 'CLEAR')
        }


    }
