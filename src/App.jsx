import { useState } from 'react';
import SpiritCard from './components/SpiritCard';
import GameSetupCard from './components/GameSetupCard';
import spirits from './data/spirits.json';
import boards from './data/boards.json';
import adversaries from './data/adversaries.json';
import scenarios from './data/scenarios.json';
import './App.css';

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function App() {
  const [playerCount, setPlayerCount] = useState(2);
  const [assignments, setAssignments] = useState([]);
  const [boardAssignments, setBoardAssignments] = useState([]);
  const [adversary, setAdversary] = useState(null);
  const [scenario, setScenario] = useState(null);

  const maxPlayers = Math.min(6, spirits.length, boards.length);

  function randomize() {
    const shuffledSpirits = shuffleArray(spirits);
    setAssignments(shuffledSpirits.slice(0, playerCount));

    const shuffledBoards = shuffleArray(boards);
    setBoardAssignments(shuffledBoards.slice(0, playerCount));

    const randomAdversary = adversaries[Math.floor(Math.random() * adversaries.length)];
    const randomLevel = randomAdversary.levels[Math.floor(Math.random() * randomAdversary.levels.length)];
    setAdversary({ ...randomAdversary, selectedLevel: randomLevel });

    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setScenario(randomScenario);
  }

  function clearAll() {
    setAssignments([]);
    setBoardAssignments([]);
    setAdversary(null);
    setScenario(null);
  }

  return (
    <div className="app">
      <h1>Spirit Island Randomizer</h1>

      <div className="controls">
        <label htmlFor="player-count">Players:</label>
        <select
          id="player-count"
          value={playerCount}
          onChange={(e) => {
            setPlayerCount(Number(e.target.value));
            clearAll();
          }}
        >
          {Array.from({ length: maxPlayers }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <button className="randomize-btn" onClick={randomize}>
          {assignments.length ? 'Re-roll' : 'Randomize'}
        </button>
      </div>

      <p className="spirit-count">
        {spirits.length} spirits · {boards.length} boards · {adversaries.length} adversaries · {scenarios.length} scenarios
      </p>

      {assignments.length > 0 && (
        <>
          <div className="results">
            {assignments.map((spirit, i) => (
              <SpiritCard
                key={spirit.name}
                playerNumber={i + 1}
                spirit={spirit}
                board={boardAssignments[i]}
              />
            ))}
          </div>

          {adversary && scenario && (
            <div className="game-setup">
              <h2 className="game-setup-heading">Game Setup</h2>
              <div className="game-setup-cards">
                <GameSetupCard
                  label="Adversary"
                  name={adversary.name}
                  detail={`Level ${adversary.selectedLevel.level} (Difficulty ${adversary.selectedLevel.difficulty})`}
                  expansion={adversary.expansion}
                />
                <GameSetupCard
                  label="Scenario"
                  name={scenario.name}
                  detail={scenario.difficulty > 0 ? `Difficulty ${scenario.difficulty}` : null}
                  expansion={scenario.expansion}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
