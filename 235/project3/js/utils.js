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