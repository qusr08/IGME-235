function contains2DArrayValue(array, value) {
    return indexOf2DArrayValue(array, value) != -1;
}

function indexOf2DArrayValue(array, value) {
    for (let i = 0; i < array.length; i++) {
        if (array[i][0] == value[0] && array[i][1] == value[1]) {
            return i;
        }
    }

    return -1;
}

function add2DArray(array1, array2) {
    return [array1[0] + array2[0], array1[1] + array2[1]];
}

function equal2DArray(array1, array2) {
    return (array1[0] == array2[0] && array1[1] == array2[1]);
}

function randRange(min, max) {
    return (Math.random() * (max - min)) + min;
}

function inRange(value, min, max) {
    return (value >= min && value <= max);
}