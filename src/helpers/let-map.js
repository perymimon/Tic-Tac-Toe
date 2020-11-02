export default class LetMap extends Map {
    constructor(struct) {
        super();
        this.initStruct(struct);
    }

    initStruct(struct) {
        this.struct = struct;
    }

    get(k) {
        if (!super.has(k)) {
            const {struct} = this;
            const s = typeof struct == 'function' ?
                struct(k) :
                new struct.constructor(struct)
            super.set(k, s)
        }
        return super.get(k);
    }
}
