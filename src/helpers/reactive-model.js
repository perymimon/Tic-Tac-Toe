module.exports =
    function ReactiveModel(model = {}) {
        const updates = [];
        let timerUpdate = null;

        function emitUpdate() {
            clearTimeout(timerUpdate);
            timerUpdate = setTimeout(() => {
                for (let cb of updates) cb(model)
            })
        }

        function observe(cb) {
            if (typeof cb === 'function') {
                updates.push(cb);
                cb(model);
            }
        }

        return new Proxy(model, {
            set: function (model, prop, val) {
                var indicate = Reflect.set(model, prop, val, model);
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
