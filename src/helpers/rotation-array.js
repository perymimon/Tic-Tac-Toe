export function rotateArray(array, k) {
    let rev = k > 0;
    k += array.length;
    k %= array.length;
    array = [...array];
    // remove the rotation part
    const splice = array.splice(0, k); //... for make a clone;
    // add reversed version of the what left
    return array.concat(rev ? splice.reverse() : splice);
}