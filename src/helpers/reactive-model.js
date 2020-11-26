module.exports =
    function ReactiveModel(model = {}) {
        const updates = new Set();
        let timerUpdate = null;

        function emitUpdate() {
            clearTimeout(timerUpdate);
            timerUpdate = setTimeout(() => {
                for (let cb of updates) cb(model)
            })
        }

        function observe(cb) {
            if (typeof cb === 'function') {
                updates.add(cb);
                cb(model);
            }
            return function disconnect(){
                this.updates.remove(cb);
            }
        }

        return new Proxy(model, {
            set: function (model, prop, val) {
                if(prop === observe.name) return true /*saved keyword*/;
                var oldValue = Reflect.get(model, prop);
                var indicate = Reflect.set(model, prop, val, model);
                if(oldValue != val)
                    emitUpdate(model);
                return indicate;
            },
            get: function (model, prop) {
                if (prop === observe.name) {
                    return observe
                }
                if(Symbol.toStringTag === prop){
                    return 'Reactive';
                }

                var propValue =  Reflect.get(model, prop);
                const skipProxyer =
                    Object(propValue) !== propValue ||
                    typeof propValue === 'function' ;

                if (skipProxyer) {
                    return propValue
                }

                const rm = propValue[Symbol.toStringTag] == 'Reactive' ?
                    propValue:
                    ReactiveModel(propValue);

                rm.observe(emitUpdate)
                return rm;

            }
        })
    }
