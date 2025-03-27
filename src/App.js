import { useState, useEffect } from "react";
import "./App.css";

// Letter point values from the screenshot
const LETTER_POINTS = {
  Q: 0,
  W: 20,
  E: 21,
  R: 11,
  T: 2,
  Y: 4,
  U: 9,
  I: 17,
  O: 22,
  P: 7,
  A: 20,
  S: 18,
  D: 15,
  F: 26,
  G: 25,
  H: 8,
  J: 19,
  K: 13,
  L: 12,
  Z: 3,
  X: 8,
  C: 14,
  V: 24,
  B: 5,
  N: 10,
  M: 1,
};

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

// Function to check if a word exists in the dictionary
const checkDictionary = async (word) => {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    return response.ok;
  } catch {
    return false;
  }
};

function Game() {
  const [currentWord, setCurrentWord] = useState("");
  const [enteredWords, setEnteredWords] = useState([]);
  const [usedPositions, setUsedPositions] = useState(
    Array(5)
      .fill()
      .map(() => new Set())
  );
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [error, setError] = useState("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleLetterClick = (letter) => {
    if (currentWord.length < 5) {
      setCurrentWord((prev) => prev + letter);
    }
  };

  const handleDelete = () => {
    setCurrentWord((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (currentWord.length !== 5) return;

    // Check if word exists in dictionary
    const isValid = await checkDictionary(currentWord);

    if (!isValid) {
      setError("Invalid word. Please enter a valid English word.");
      return;
    }

    // Check position constraints
    const newUsed = [...usedPositions];
    let valid = true;

    for (let i = 0; i < 5; i++) {
      if (newUsed[i].has(currentWord[i])) {
        valid = false;
        break;
      }
    }

    if (valid) {
      setError("");
      // Update used positions
      const updatedUsed = newUsed.map(
        (set, i) => new Set([...set, currentWord[i]])
      );

      // Calculate points
      const wordScore = currentWord
        .split("")
        .reduce((sum, letter) => sum + (LETTER_POINTS[letter] || 0), 0);

      setEnteredWords((prev) => [...prev, currentWord]);
      setUsedPositions(updatedUsed);
      setScore((prev) => prev + wordScore);
      setCurrentWord("");

      if (enteredWords.length === 4) {
        setGameOver(true);
      }
    } else {
      setError("Letter already used in this position");
    }
  };

  const handlePlayAgain = () => {
    setGameOver(false);
    resetGame();
  };

  const resetGame = () => {
    setCurrentWord("");
    setEnteredWords([]);
    setUsedPositions(
      Array(5)
        .fill()
        .map(() => new Set())
    );
    setScore(0);
    setGameOver(false);
    setError("");
  };

  const toggleHowToPlay = () => {
    setShowHowToPlay(!showHowToPlay);
  };

  return (
    <div className="game-container">
      <h1 className="game-title">LetterLock</h1>
      <div className="score">Score: {score}</div>

      <div className="word-display">
        {enteredWords.map((word, i) => (
          <div key={i}>{word}</div>
        ))}
        <div className="current-word">{currentWord}</div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="keyboard">
        {KEYBOARD_ROWS.map((row, i) => (
          <div key={i} className="keyboard-row">
            {row.map((letter) => (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                disabled={usedPositions.some(
                  (set, i) => currentWord.length === i && set.has(letter)
                )}
              >
                <div>{letter}</div>
                <div className="points">{LETTER_POINTS[letter]}</div>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="controls">
        <button onClick={handleDelete}>Delete</button>
        <button onClick={handleSubmit} disabled={currentWord.length !== 5}>
          Submit
        </button>
        <button onClick={resetGame} className="restart-button">
          Restart
        </button>
        <button onClick={toggleHowToPlay} className="how-to-play-button">
          {showHowToPlay ? "Hide Instructions" : "How to Play"}
        </button>
      </div>

      {gameOver && (
        <div className="game-over-popup">
          <div className="popup-content">
            <h2>Game Over!</h2>
            <p>Total Score: {score}</p>
            <div className="popup-buttons">
              <button onClick={handlePlayAgain} className="play-again-button">
                Play Again
              </button>
              <button onClick={resetGame} className="restart-button">
                New Game
              </button>
            </div>
          </div>
        </div>
      )}

      {showHowToPlay && (
        <div className="how-to-play">
          <h3>How to Play</h3>
          <p>Try to get the highest total of points possible in 5 words!</p>
          <p>
            Each letter on the board is assigned a point value and may only be
            used in the same position once.
          </p>
          <p>
            If you need to remove a word, click "Delete". Click submit after
            creating your 5 letter word.
          </p>
        </div>
      )}
    </div>
  );
}

export default Game;
