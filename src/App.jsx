import { useState, useEffect } from 'react';
import SpiritCard from './components/SpiritCard';
import GameSetupCard from './components/GameSetupCard';
import spirits from './data/spirits.json';
import boards from './data/boards.json';
import adversaries from './data/adversaries.json';
import scenarios from './data/scenarios.json';
import './App.css';

const ALL_EXPANSIONS = [
  ...new Set([
    ...spirits.map((s) => s.expansion),
    ...boards.map((b) => b.expansion),
    ...adversaries.map((a) => a.expansion),
    ...scenarios.map((s) => s.expansion),
  ]),
]
  .filter(Boolean)
  .sort();

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
  const [enabledExpansions, setEnabledExpansions] = useState(
    () => new Set(ALL_EXPANSIONS)
  );

  const filteredSpirits = spirits.filter((s) =>
    enabledExpansions.has(s.expansion)
  );
  const filteredBoards = boards.filter((b) =>
    enabledExpansions.has(b.expansion)
  );
  const filteredAdversaries = adversaries.filter((a) =>
    enabledExpansions.has(a.expansion)
  );
  const filteredScenarios = scenarios.filter(
    (s) => s.expansion === null || enabledExpansions.has(s.expansion)
  );

  const maxPlayers = Math.min(6, filteredSpirits.length, filteredBoards.length);

  useEffect(() => {
    if (playerCount > maxPlayers && maxPlayers > 0) {
      setPlayerCount(maxPlayers);
    }
  }, [maxPlayers, playerCount]);

  function toggleExpansion(name) {
    setEnabledExpansions((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
    clearAll();
  }

  function randomize() {
    const shuffledSpirits = shuffleArray(filteredSpirits);
    setAssignments(shuffledSpirits.slice(0, playerCount));

    const shuffledBoards = shuffleArray(filteredBoards);
    setBoardAssignments(shuffledBoards.slice(0, playerCount));

    const randomAdversary =
      filteredAdversaries[
        Math.floor(Math.random() * filteredAdversaries.length)
      ];
    const randomLevel =
      randomAdversary.levels[
        Math.floor(Math.random() * randomAdversary.levels.length)
      ];
    setAdversary({ ...randomAdversary, selectedLevel: randomLevel });

    const randomScenario =
      filteredScenarios[
        Math.floor(Math.random() * filteredScenarios.length)
      ];
    setScenario(randomScenario);
  }

  function clearAll() {
    setAssignments([]);
    setBoardAssignments([]);
    setAdversary(null);
    setScenario(null);
  }

  const canRandomize =
    filteredSpirits.length >= playerCount &&
    filteredBoards.length >= playerCount &&
    filteredAdversaries.length > 0;

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

        <button
          className="randomize-btn"
          onClick={randomize}
          disabled={!canRandomize}
        >
          {assignments.length ? 'Re-roll' : 'Randomize'}
        </button>
      </div>

      <div className="expansion-filters">
        {ALL_EXPANSIONS.map((exp) => (
          <label
            key={exp}
            className={`expansion-toggle${enabledExpansions.has(exp) ? ' active' : ''}`}
          >
            <input
              type="checkbox"
              checked={enabledExpansions.has(exp)}
              onChange={() => toggleExpansion(exp)}
            />
            {exp}
          </label>
        ))}
      </div>

      <p className="spirit-count">
        {filteredSpirits.length} spirits · {filteredBoards.length} boards ·{' '}
        {filteredAdversaries.length} adversaries ·{' '}
        {filteredScenarios.length} scenarios
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
                  detail={
                    scenario.difficulty > 0
                      ? `Difficulty ${scenario.difficulty}`
                      : null
                  }
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
