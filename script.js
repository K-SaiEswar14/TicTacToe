
const board = document.querySelector('.board');
const output = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]
];

let arr = new Array(9).fill("E");
let input = "O";
let count = 0;

function checkResult() {
    for (let [index1, index2, index3] of output) {
        if (arr[index1] !== "E" && arr[index1] === arr[index2] && arr[index1] === arr[index3]) {
            return arr[index1]; // Return winner symbol
        }
    }
    return null;
}

function boardResult(event) {
    let id = event.target.id;
    if (arr[id] !== "E") return;

    count++;
    arr[id] = input;
    event.target.innerHTML = input;

    let winner = checkResult();
    let resultDisplay = document.querySelector('#resultIs');

    if (winner) {
        resultDisplay.innerHTML = `Winner is ${winner}`;
        board.classList.add('disabled');
        return;
    }

    if (count === arr.length) {
        resultDisplay.innerHTML = "Match is Draw";
    } else {
        input = (input === "O") ? "X" : "O";
    }
}

board.addEventListener('click', boardResult);

document.querySelector("#restart").addEventListener('click', () => {
    arr.fill("E");
    document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = "");
    input = "O";
    count = 0;
    document.querySelector('#resultIs').innerHTML = "";
    board.classList.remove('disabled'); // Enable board again
});
