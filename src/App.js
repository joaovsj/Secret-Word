// CSS
import './App.css';
// Hooks
import {useCallback, useEffect, useState} from 'react';
import {wordsList} from "./data/words"; 
// components
import StartScreen from './components/StartScreen';
import Game from './components/Game';
import GameOver from './components/GameOver';

const stages = [
    {id: 1, name: 'start'},
    {id: 2, name: 'game'},
    {id: 3, name: 'end'}
];

const guessesQty = 3;

function App() {

    const [gameStage, setGameStage] = useState(stages[0].name); // definindo o estágio
    const [words] = useState(wordsList);

    const [pickedWord, setPickedWord] = useState("");               // picked word
    const [pickedCategory, setPickedCategory] = useState("");       // picked category
    const [letters, setLetters] = useState([]);
    
    const [guessedLetters, setGuessedLetters] = useState([]);   // letras adivinhadas
    const [wrongLetters, setWrongLetters] = useState([]);       // letras erradas
    const [guesses, setGuesses] = useState(guessesQty);                  // número de tentativas
    const [score, setScore] = useState(0);                      // pontuaçao

    // escolhendo a categoria e palavra
    const pickWordAndCategory = useCallback(() => {
        // categories é um array com todas as chaves
        const categories = Object.keys(words); 
        
        // escolhendo a categoria
        const category = categories[
            // random gera um número quebrado, então usamos o floor para arrendondar
            Math.floor(Math.random() * Object.keys(categories).length)
        ];

        // escolhendo a palavra
        const word = words[category][
            Math.floor(Math.random() * words[category].length)
        ];
    
        // retornando um objeto para ser desestruturado como objeto
        return {word, category};
    }, [words]);


    // init
    const startGame = useCallback(() => {

        clearLetterStates();

        // desestruturando objeto
        const {word, category} = pickWordAndCategory();

        // create an array with letters
        /*
            split
                (" ") separa onde tem espaço
                (""), separa letra por letra
        */ 
        let wordLetters = word.split(""); 
        // trocando letras maiusculos por minusculas
        wordLetters = wordLetters.map((letter) => 
            letter.toLowerCase()
        );  


        // fill => preencher
        setPickedWord(word);
        setPickedCategory(category);
        setLetters(wordLetters);

        setGameStage(stages[1].name);

    }, [pickWordAndCategory]);

    //proccess the letter input
    const verifyLetter = (letter) => {

        const normalizedLetter = letter.toLowerCase();

        // verifica se letra já foi jogada
        if(guessedLetters.includes(normalizedLetter) || wrongLetters.includes(normalizedLetter)){
            return;
        }

        if(letters.includes(normalizedLetter)){
            // adicionando um novo item no array        
            // se não utilizarmos SPREAD(espalharmos os itens), nós vamos perder os valores já existentes no array 
            setGuessedLetters((currentGuessedLetters)=>[...currentGuessedLetters, normalizedLetter]);
        }else {
            setWrongLetters((currentWrongLetters)=>[...currentWrongLetters, normalizedLetter]);
            setGuesses((currentState) => currentState - 1); // diminuindo número de tentativas
        }
    }


    const clearLetterStates = () => {
        setGuessedLetters([]);
        setWrongLetters([]);
    }
    // pode monitorar algum dado dá nossa escolha
    useEffect(()=>{

        if(guesses <= 0){

            // reset all states
            clearLetterStates();

            setGameStage(stages[2].name);
        }
    },[guesses]);


    useEffect(()=>{

        // new Set é um forma de tirarmos valores repetidos dentro de um array
        const uniqueLetters = [...new Set(letters)];

        // [array com as letras jogadas] === [array com todas as letras da palavra ]
        if(guessedLetters.length  === uniqueLetters.length){
            
            setScore((atualScore) => atualScore += 100);
            startGame();
        }

    },[guessedLetters, letters, startGame]); // valor que está sendo monitorado

    // restarts the again
    const retry = () => {

        setScore(0);
        setGuesses(guessesQty);

        setGameStage(stages[0].name);
    }

    return (
        <div className="App">
            {gameStage === 'start' &&  <StartScreen  startGame={startGame} />  }
            {gameStage === 'game'  &&  <Game 
                verifyLetter={verifyLetter} 
                pickedWord={pickedWord} 
                pickedCategory={pickedCategory} 
                letters={letters}
                guessedLetters={guessedLetters}
                wrongLetters={wrongLetters}
                guesses={guesses}
                score={score}
            />  }
            {gameStage === 'end'   &&  <GameOver retry={retry} score={score} />  }
        </div>
    );
}

export default App;
