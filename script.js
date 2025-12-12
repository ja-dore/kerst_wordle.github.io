
//constanten

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let solution = ['goed','doel','game','grof','geld','geluk']
let solutionCounter = 0;
let rightGuessString = solution[solutionCounter];



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

// deze functie maakt het toetsenbord.
/*function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === 'green') {
                return
            } 

            if (oldColor === 'yellow' && color !== 'green') {
                return
            }

            elem.style.backgroundColor = color
            break
        }
    }
}*/

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

    for (const val of currentGuess) {
        guessString += val
    }

    if (guessString.length != rightGuessString.length) {
        alert("te weinig letters");
        return
    }

   // if (!WORDS.includes(guessString)) {
    if (!(await bestaat(guessString))) {
        console.log("hier ben je geraakt");
        alert("dit woord bestaat niet");
        return
    }

    //dit deel kijkt na of u woord bestaat. 
    for (let i = 0; i < rightGuessString.length; i++) {
        let letterColor = ''
        let box = row.children[i]
        let letter = currentGuess[i]
        
        let letterPosition = rightGuess.indexOf(currentGuess[i])
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = '#979898ff'
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position 
            if (currentGuess[i] === rightGuess[i]) {
                // shade green 
                letterColor = '#60b758ff'
            } else {
                // shade box yellow
                letterColor = '#ffdd45ff'
            }

            rightGuess[letterPosition] = "#"
        }

        let delay = 250 * i
        setTimeout(()=> {
            //flip box
            animateCSS(box, 'flipInX')
            //shade box
            box.style.backgroundColor = letterColor
            //shadeKeyBoard(letter, letterColor)
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
          showPopup(`Helaas! <br><br> Geen pakjes meer voor jou! <br><br> Het woord was: ${rightGuessString.toUpperCase()}<!`);  
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
    if (nextLetter === 5) {
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