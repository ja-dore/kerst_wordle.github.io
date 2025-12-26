
//constanten

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let solution = ['gelijk','game','goed','doel','geld','geluk']
let solutionCounter = 0;
let rightGuessString = solution[solutionCounter];

console.log(rightGuessString);



//deze functie maakt de lettertjs'
function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < rightGuessString.length; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}

// even kijken of het woord bestaat
async function bestaat(word) {
    const url = `https://woorden.org/woord/${encodeURIComponent(word)}`;
    const response = await fetch(url);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const text = doc.body.textContent;
    const search = "Dit woord heeft geen uitgebreide woordinformatie.";

    if (text.includes(search)) {
        console.log("return false");
        return false;
    } else {
        console.log("return true");
        return true;
    }
}

//deze functie verwijderd een letter.
function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let box = row.children[nextLetter - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    currentGuess.pop()
    nextLetter -= 1
}


//deze functie kijk je gok na op aantal letters en of het woord klopt. 
async function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let guessString = ''
    let rightGuess = Array.from(rightGuessString)
    let green = '#60b758ff'
    let yellow = '#ffdd45ff'
    let grey = '#959491ff'
    let letterColor =  Array(rightGuessString.length).fill(grey);
   
    for (const val of currentGuess) {
        guessString += val
    }

    if (guessString.length != rightGuessString.length) {
        alert("te weinig letters");
        return
    }

   // dit deel kijkt na of het woord bestaat
    if (!(await bestaat(guessString))) {
        alert("dit woord bestaat niet");
        return
    }

 
    for (let i = 0; i < rightGuessString.length; i++) {
        // is letter in the correct guess color green
        if (currentGuess[i] === rightGuess[i]) {
            letterColor[i] = green
            rightGuess[i] = ""
        }
    }
    
    for (let i = 0; i < rightGuessString.length; i++) {
    if (letterColor[i] === grey ) {
        const index = rightGuess.indexOf(currentGuess[i]);
        if (index !== -1) {
            letterColor[i] = yellow;
            currentGuess[index] = null;
        }
        }
    }
    
    for (let i = 0; i < rightGuessString.length; i++) {
        let box = row.children[i]
        let delay = 250 * i
        setTimeout(()=> {
            //flip box
            animateCSS(box, 'flipInX')
            //shade box
            box.style.backgroundColor = letterColor[i]
            //shadeKeyBoard(letter, letterColor)
            console.log(guessesRemaining)
        }, delay)
    }


    if (guessString === rightGuessString) {
        showPopup(`Je hebt het goed geraden! <br><br> Open het pakje: <b>${rightGuessString.toUpperCase()}</b>!`);
        let popups = document.querySelectorAll("div.letter-row"); // select all divs with class "popup"
        popups.forEach(popup => popup.remove()); //removes every row
        guessesRemaining = NUMBER_OF_GUESSES; 
        solutionCounter += 1;
        currentGuess = [];
        nextLetter = 0;
        rightGuessString = solution[solutionCounter];
        initBoard()
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
          showPopup(`Helaas! <br><br> Geen pakjes meer meer <br><br> Het woord was: ${rightGuessString.toUpperCase()}<!`);  
          guessesRemaining = NUMBER_OF_GUESSES; 
            solutionCounter += 1;
            currentGuess = [];
            nextLetter = 0;
            rightGuessString = solution[solutionCounter];
            initBoard()
        }
    }
}


// dit is voor de popup boodschappen
function showPopup(boodschap) {
    // Create popup container
    document.getElementById("popup").classList.add("open-popup");
    document.getElementById("popup-text").innerHTML = boodschap
    
}

function closePopup() {
    document.getElementById("popup").classList.remove("open-popup");
  }

document.querySelector("#popup .button").addEventListener("click", closePopup);


function insertLetter (pressedKey) {
    if (nextLetter === rightGuessString.length) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let box = row.children[nextLetter]
    animateCSS(box, "pulse")
    box.textContent = pressedKey
    box.classList.add("filled-box")
    currentGuess.push(pressedKey)
    nextLetter += 1
}

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element
    node.style.setProperty('--animate-duration', '0.3s');
    
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});

document.addEventListener("keyup", (e) => {

    if (guessesRemaining === 0) {
        return
    }

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        checkGuess()
        return
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }
})

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    
    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (key === "Del") {
        key = "Backspace"
    } 

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

initBoard()