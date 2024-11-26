import React, { useState, useEffect, useMemo } from "react";

import { load, actions } from "./manage";
import './game.css';

const WordleGame = () => {


    const [data, setGameData] = useState(load());
   
    const [currentGuess, setCurrentGuess] = useState(
      data.guesses[data.answers.length] || ""
    );
    const won = data.answers.at(-1) === "xxxxx";
    const i = won ? -1 : data.answers.length;
  
    const submittable = currentGuess.length === 5;
  
    // Memoize derived data for classnames and descriptions
    const { classnames, description } = useMemo(() => {
      const classnames: Record<string, "exact" | "close" | "missing"> = {};
      const description: Record<string, string> = {};
  
      data.answers.forEach((answer, index) => {
        const guess = data.guesses[index];
        for (let j = 0; j < 5; j++) {
          const letter = guess[j];
          if (answer[j] === "x") {
            classnames[letter] = "exact";
            description[letter] = "correct";
          } else if (!classnames[letter]) {
            classnames[letter] = answer[j] === "c" ? "close" : "missing";
            description[letter] = answer[j] === "c" ? "present" : "absent";
          }
        }
      });
  
      return { classnames, description };
    }, [data.answers, data.guesses]);
  
    const update = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const key = event.currentTarget.getAttribute("data-key");
  
      if (key === "backspace") {
        setCurrentGuess(currentGuess.slice(0, -1));
      } else if (currentGuess.length < 5) {
        setCurrentGuess(currentGuess + key);
      }
      actions.update(key)
  
    };
  
    const handleRestart = () => {
      actions.restart();
      setGameData(load());
      setCurrentGuess("");
    };
  
    function enterAnswer () {
      let goodGuess = false
  
      if (submittable) {
        goodGuess = actions.enter(currentGuess);
    
        if (goodGuess) setCurrentGuess("");
  
      }
      setGameData(load());
  
    }
   
    const keydown = (event: React.KeyboardEvent) => {
      event.preventDefault()
      if (event.metaKey) return;
      if (event.key === "Enter" && !submittable) return;
      const button = document.querySelector<HTMLButtonElement>(
        `[data-key="${event.key}" i]`
      );
      button?.click();
  
    };
  
  
  
    useEffect(() => {
      document.addEventListener("keydown", keydown);
      return () => document.removeEventListener("keydown", keydown);
    }, [currentGuess, submittable]);
  
    return (
      <div>
        <h1 className="">Wordle</h1>
     
        <section>
          <div
            className={`grid ${!won ? "playing" : ""} ${
              data.answers.length >= 6 ? "bad-guess" : ""
            }`}
          >
            {Array.from({ length: 6 }).map((_, row) => {
              const current = row === i;
              return (
                <div key={row} className={`row ${current ? "current" : ""}`}>
                  {Array.from({ length: 5 }).map((_, column) => {
                    const guess = current ? currentGuess : data.guesses[row] || "";
                    const answer = data.answers[row]?.[column];
                    const value = guess[column] ?? "";
                    const exact = answer === "x";
                    const close = answer === "c";
                    const missing = answer === "_";
  
                    return (
                      <div
                        key={column}
                        className={`letter ${
                          exact ? "exact" : close ? "close" : missing ? "missing" : ""
                        }`}
                      >
                        {value}
                        <span className="visually-hidden">
                          {exact
                            ? "(correct)"
                            : close
                            ? "(present)"
                            : missing
                            ? "(absent)"
                            : "empty"}
                        </span>
                        <input
                          name="guess"
                          disabled={!current}
                          type="hidden"
                          value={value}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
  
          <div className="controls">
            {won || data.answers.length >= 6 ? (
              <>
                {!won && data.answer && <p>The answer was "{data.answer}"</p>}
                <button
                    data-key="restart"
                    className="restart selected"
                    onClick={handleRestart}
                  >
                    {won ? "You won :)" : "Game over :("} Play again?
                  </button>
             
              </>
            ) : (
              <div className="keyboard">
                <button
                  data-key="enter"
  
                  className={submittable ? "selected" : ""}
                  disabled={!submittable}
                  onClick={enterAnswer}
                >
                  Enter
                </button>
                <button
                  onClick={update}
                  data-key="backspace"
                  name="key"
                  value="backspace"
                >
                  Back
                </button>
                {["qwertyuiop", "asdfghjkl", "zxcvbnm"].map((row, rowIndex) => (
                  <div key={rowIndex} className="row">
                    {row.split("").map((letter) => (
                      <button
                        key={letter}
                        onClick={update}
                        data-key={letter}
                        className={classnames[letter]}
                        disabled={submittable}
                        name="key"
                        value={letter}
                        aria-label={`${letter} ${description[letter] || ""}`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
  
        </section>
      </div>
    );
  };
  
  export default WordleGame;