function updateArrayBasedOnPrevious(array) {
    let totals = Array(array[0].length).fill(0);

    array.forEach((row, index) => {
        if (index === 0) {
            totals = [...row.map((item) => item === 0 ? -1 : item)];
            return;
        }
        // console.log(row);
        row.forEach((value, colIndex) => {
            // อันเดิมได้ 0 อันใหม่ได้ 1 ยังต้องอยู่ 1
            if (totals[colIndex] < 0 && value === 1) {
                totals[colIndex] = (totals[colIndex] * -1) + 1;
            }
            // อันเดิมได้ 0 อันใหม่ได้ 0 ยังต้องอยู่ --
            else if (totals[colIndex] < 0 && value === 0) {
                totals[colIndex] = totals[colIndex] - 1;
            }
            // อันเดิมได้น้อยกว่า 0 อันใหม่ได้ 1 ต้องได้ ((อันเดิมได้น้อยกว่า 0) * -1) + 1
            else if (totals[colIndex] > 0 && value === 1) {
                totals[colIndex] = 1;
            }

            else if (totals[colIndex] > 0 && value === 0) {
                totals[colIndex] = -1;
            }
            // อันเดิมได้น้อยกว่า 0 อันใหม่ได้ 1 ต้องได้ ((อันเดิมได้น้อยกว่า 0) * -1) + 1
        });
    });

    return { array, totals };
}

function getArrayBetweenIndexes(array, index) {
    return array.slice(0, index);
}

const inputArray = [
    [1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 1, 0],
    [1, 1, 0, 0, 1, 0]
];

const board = [0, 0, 35, 85, 185, 365, 735, 1495, 3065, 6285, 12835]

function getDataByMappingArray(array) {
    return array.map((_, index) => {
        const updatedArray = updateArrayBasedOnPrevious(getArrayBetweenIndexes(array, index + 1));
        return updatedArray.totals
    })
}

function getTotalPrice(array, board) {
    return array.map((item) => {
        const totalPrices = item.map((rawItem) => {
            if (rawItem > 0) {
                return board[rawItem - 1]
            }

            const currentIndex = (rawItem * -1) - 1
            return board[currentIndex] * -1
        })

        return totalPrices
    })
}

module.exports = { getTotalPrice, getDataByMappingArray, updateArrayBasedOnPrevious };