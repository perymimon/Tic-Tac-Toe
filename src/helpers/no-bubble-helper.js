export function noBubble(callback){
    return function (event){
        if(event.currentTarget === event.target){
            callback(event)
        }
    }
}

export function noAnimBubble(animename,callback){
    return noBubble((event)=>{
        if(event.animationName === animename){
            callback(event)
        }
    })
}