import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const GRID = 20;
const CELL = 20;
const SPEED = 130;

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
];

const DIRECTIONS = {
  ArrowUp: "UP",
  ArrowDown: "DOWN",
  ArrowLeft: "LEFT",
  ArrowRight: "RIGHT",
};

const VECTORS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const ANGLES = {
  RIGHT: 0,
  DOWN: 90,
  LEFT: 180,
  UP: -90,
};


// RANDOM FOOD
function createFood(snake) {
  let food;

  do {
    food = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
  } while (
    snake.some(
      (part) =>
        part.x === food.x &&
        part.y === food.y
    )
  );

  return food;
}


// SVG CARTOON SNAKE
function CartoonSnake({ snake, direction }) {
  const head = snake[0];

  if (!head) return null;

  return (
    <svg
      className="snake-svg"
      viewBox="0 0 400 400"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >

      <defs>

        {/* BODY GRADIENT */}
        <linearGradient
          id="bodyGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor="#baff45" />
          <stop offset="35%" stopColor="#42d900" />
          <stop offset="75%" stopColor="#159c16" />
          <stop offset="100%" stopColor="#075c12" />
        </linearGradient>

        {/* HEAD GRADIENT */}
        <radialGradient id="headGradient">
          <stop offset="0%" stopColor="#caff58" />
          <stop offset="65%" stopColor="#48df13" />
          <stop offset="100%" stopColor="#087b19" />
        </radialGradient>

        {/* BELLY GRADIENT */}
        <linearGradient
          id="bellyGradient"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#fff1a8" />
          <stop offset="100%" stopColor="#e5a94b" />
        </linearGradient>

        {/* GLOW */}
        <filter id="greenGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

      </defs>


      {/* BODY SEGMENTS */}
      {snake.slice(1).map((part, index) => {
        const x = part.x * CELL + 10;
        const y = part.y * CELL + 10;

        const radius = Math.max(
          4,
          9 - index * 0.15
        );

        return (
          <g key={`${part.x}-${part.y}-${index}`}>

            {/* Main body */}
            <circle
              cx={x}
              cy={y}
              r={radius}
              fill="url(#bodyGradient)"
              stroke="#075e20"
              strokeWidth="1.5"
              filter="url(#greenGlow)"
            />

            {/* Belly */}
            <path
              d={`
                M ${x - radius * 0.7} ${y + 2}
                Q ${x} ${y + radius}
                  ${x + radius * 0.7} ${y + 2}
                Q ${x} ${y + 5}
                  ${x - radius * 0.7} ${y + 2}
              `}
              fill="url(#bellyGradient)"
              opacity="0.9"
            />

            {/* Green scale spot */}
            {index % 2 === 0 && (
              <ellipse
                cx={x - 2}
                cy={y - 3}
                rx="3.5"
                ry="2.5"
                fill="#087a19"
                stroke="#b6ff48"
                strokeWidth="0.6"
              />
            )}

            {/* Highlight */}
            <ellipse
              cx={x - 3}
              cy={y - 5}
              rx="3"
              ry="1.5"
              fill="#d5ff83"
              opacity="0.7"
            />

          </g>
        );
      })}


      {/* TAIL */}
      {snake.length > 1 && (() => {
        const tail = snake[snake.length - 1];
        const previous = snake[snake.length - 2];

        const tx = tail.x * CELL + 10;
        const ty = tail.y * CELL + 10;

        const angle = Math.atan2(
          ty - (previous.y * CELL + 10),
          tx - (previous.x * CELL + 10)
        ) * 180 / Math.PI;

        return (
          <g transform={`translate(${tx} ${ty}) rotate(${angle})`}>
            <path
              d="M -7 -7 Q 4 0 12 0 Q 4 7 -7 7 Z"
              fill="url(#bodyGradient)"
              stroke="#075e20"
              strokeWidth="1.5"
            />
          </g>
        );
      })()}


      {/* CARTOON HEAD */}
      <g
        transform={`
          translate(${head.x * CELL + 10} ${head.y * CELL + 10})
          rotate(${ANGLES[direction]})
        `}
      >

        {/* Head shadow */}
        <ellipse
          cx="0"
          cy="2"
          rx="12"
          ry="10"
          fill="#063c10"
          opacity="0.5"
        />

        {/* Head */}
        <ellipse
          cx="0"
          cy="0"
          rx="12"
          ry="10"
          fill="url(#headGradient)"
          stroke="#075e20"
          strokeWidth="1.5"
          filter="url(#greenGlow)"
        />

        {/* Snout */}
        <ellipse
          cx="8"
          cy="3"
          rx="7"
          ry="6"
          fill="#a9ef42"
          stroke="#176c19"
          strokeWidth="1"
        />

        {/* Left eye */}
        <ellipse
          cx="-3"
          cy="-5"
          rx="3.5"
          ry="4.5"
          fill="white"
          stroke="#075e20"
          strokeWidth="0.8"
        />

        <ellipse
          cx="-2"
          cy="-5"
          rx="1.8"
          ry="2.8"
          fill="#092f39"
        />

        <circle
          cx="-2.5"
          cy="-6.5"
          r="1"
          fill="white"
        />

        {/* Right eye */}
        <ellipse
          cx="6"
          cy="-5"
          rx="3.5"
          ry="4.5"
          fill="white"
          stroke="#075e20"
          strokeWidth="0.8"
        />

        <ellipse
          cx="7"
          cy="-5"
          rx="1.8"
          ry="2.8"
          fill="#092f39"
        />

        <circle
          cx="6.5"
          cy="-6.5"
          r="1"
          fill="white"
        />

        {/* Nostrils */}
        <circle cx="10" cy="1" r="0.8" fill="#15551b" />
        <circle cx="5" cy="1" r="0.8" fill="#15551b" />

        {/* Smile */}
        <path
          d="M 3 7 Q 8 11 12 6"
          fill="none"
          stroke="#15551b"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Tongue */}
        <path
          d="M 11 8 Q 16 10 17 14 M 17 14 L 20 12 M 17 14 L 16 17"
          fill="none"
          stroke="#f22f51"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </g>

    </svg>
  );
}


// FOOD COMPONENT
function Food({ food }) {
  return (
    <svg
      viewBox="0 0 20 20"
      style={{
        position: "absolute",
        left: `${food.x * 5}%`,
        top: `${food.y * 5}%`,
        width: "5%",
        height: "5%",
        zIndex: 1,
      }}
    >
      <defs>
        <radialGradient id="foodGradient">
          <stop offset="0%" stopColor="#ffaaaa" />
          <stop offset="60%" stopColor="#ff3030" />
          <stop offset="100%" stopColor="#a90000" />
        </radialGradient>
      </defs>

      <circle
        cx="10"
        cy="10"
        r="7"
        fill="url(#foodGradient)"
        filter="url(#greenGlow)"
      />

      <path
        d="M 10 3 Q 13 -1 16 2"
        fill="none"
        stroke="#69e329"
        strokeWidth="2"
      />

    </svg>
  );
}


// MAIN APP
export default function App() {

  const [snake, setSnake] = useState(INITIAL_SNAKE);

  const [food, setFood] = useState(() =>
    createFood(INITIAL_SNAKE)
  );

  const [direction, setDirection] = useState("RIGHT");

  const [score, setScore] = useState(0);

  const [gameOver, setGameOver] = useState(false);

  const [started, setStarted] = useState(false);

  const directionRef = useRef("RIGHT");
  const nextDirectionRef = useRef("RIGHT");


  // RESET GAME
  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(createFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setStarted(false);

    directionRef.current = "RIGHT";
    nextDirectionRef.current = "RIGHT";

    setDirection("RIGHT");
  };


  // KEYBOARD CONTROLS
  useEffect(() => {

    const handleKeyDown = (e) => {

      const newDirection = DIRECTIONS[e.key];

      if (!newDirection || gameOver) return;

      e.preventDefault();

      const current = nextDirectionRef.current;

      const opposite = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };

      if (opposite[current] === newDirection) return;

      nextDirectionRef.current = newDirection;

      setDirection(newDirection);

      setStarted(true);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };

  }, [gameOver]);


  // GAME ENGINE
  useEffect(() => {

    if (!started || gameOver) return;

    const timer = setInterval(() => {

      const moveDirection = nextDirectionRef.current;

      directionRef.current = moveDirection;

      setSnake((previousSnake) => {

        const vector = VECTORS[moveDirection];

        const head = {
          x: previousSnake[0].x + vector.x,
          y: previousSnake[0].y + vector.y,
        };

        // WALL COLLISION
        if (
          head.x < 0 ||
          head.y < 0 ||
          head.x >= GRID ||
          head.y >= GRID
        ) {
          setGameOver(true);
          return previousSnake;
        }

        // FOOD CHECK
        const eating =
          head.x === food.x &&
          head.y === food.y;

        const body = eating
          ? previousSnake
          : previousSnake.slice(0, -1);

        // SELF COLLISION
        const collision = body.some(
          (part) =>
            part.x === head.x &&
            part.y === head.y
        );

        if (collision) {
          setGameOver(true);
          return previousSnake;
        }

        const newSnake = [head, ...body];

        // FOOD EATEN
        if (eating) {
          setScore((oldScore) => oldScore + 1);
          setFood(createFood(newSnake));
        }

        return newSnake;
      });

    }, SPEED);

    return () => clearInterval(timer);

  }, [started, gameOver, food]);


  return (
    <div className="game-container">

      <div className="game-card">

        {/* TITLE */}
        <h1 className="game-title">
          <span className="title-icon">〰</span>
          SNAKE GAME
        </h1>


        {/* GAME BOARD */}
        <div
          className="game-board"
          tabIndex="0"
          aria-label="Snake game board"
        >

          {/* SVG SNAKE */}
          <CartoonSnake
            snake={snake}
            direction={direction}
          />

          {/* FOOD */}
          <Food food={food} />

          {/* START MESSAGE */}
          {!started && !gameOver && (
            <div className="start-message">
              PRESS ARROW KEYS
            </div>
          )}

          {/* GAME OVER */}
          {gameOver && (
            <div className="game-over-overlay">
              <div className="game-over">
                GAME OVER!
              </div>
              <p>Final Score: {score}</p>
            </div>
          )}

        </div>


        {/* SCORE */}
        <div className="game-controls">

          <h3>
            Score: <span>{score}</span>
          </h3>

          <button onClick={restartGame}>
            Restart
          </button>

        </div>

      </div>

    </div>
  );
}
