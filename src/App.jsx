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

function parseUrlState() {
  const params = new URLSearchParams(window.location.search);
  const spiritNames = params.get('spirits')?.split(',').filter(Boolean) || [];
  const boardNames = params.get('boards')?.split(',').filter(Boolean) || [];
  const adversaryName = params.get('adversary');
  const adversaryLevel = params.get('level') ? Number(params.get('level')) : null;
  const scenarioName = params.get('scenario');

  const foundSpirits = spiritNames
    .map((name) => spirits.find((s) => s.name === name))
    .filter(Boolean);
  const foundBoards = boardNames
    .map((name) => boards.find((b) => b.name === name))
    .filter(Boolean);
  const foundAdversary = adversaries.find((a) => a.name === adversaryName);
  const foundLevel = foundAdversary?.levels.find((l) => l.level === adversaryLevel);
  const foundScenario = scenarios.find((s) => s.name === scenarioName);

  if (
    foundSpirits.length > 0 &&
    foundSpirits.length === spiritNames.length &&
    foundBoards.length === foundSpirits.length &&
    foundAdversary &&
    foundLevel &&
    foundScenario
  ) {
    return {
      assignments: foundSpirits,
      boardAssignments: foundBoards,
      adversary: { ...foundAdversary, selectedLevel: foundLevel },
      scenario: foundScenario,
      playerCount: foundSpirits.length,
    };
  }
  return null;
}

function updateUrl(assignments, boardAssignments, adversary, scenario) {
  if (assignments.length === 0) {
    window.history.replaceState({}, '', window.location.pathname);
    return;
  }
  const params = new URLSearchParams();
  params.set('spirits', assignments.map((s) => s.name).join(','));
  params.set('boards', boardAssignments.map((b) => b.name).join(','));
  if (adversary) {
    params.set('adversary', adversary.name);
    params.set('level', String(adversary.selectedLevel.level));
  }
  if (scenario) {
    params.set('scenario', scenario.name);
  }
  window.history.replaceState({}, '', `?${params.toString()}`);
}

function App() {
  const [urlState] = useState(() => parseUrlState());
  const [playerCount, setPlayerCount] = useState(urlState?.playerCount ?? 2);
  const [assignments, setAssignments] = useState(urlState?.assignments ?? []);
  const [boardAssignments, setBoardAssignments] = useState(urlState?.boardAssignments ?? []);
  const [adversary, setAdversary] = useState(urlState?.adversary ?? null);
  const [scenario, setScenario] = useState(urlState?.scenario ?? null);
  const [enabledExpansions, setEnabledExpansions] = useState(
    () => new Set(ALL_EXPANSIONS)
  );
  const [targetDifficulty, setTargetDifficulty] = useState(null);

  const filteredSpirits = spirits.filter((s) =>
    enabledExpansions.has(s.expansion)
  );
  const filteredBoards = boards.filter((b) =>
    enabledExpansions.has(b.expansion)
  );
  const filteredAdversaries = adversaries.filter(
    (a) => a.expansion === null || enabledExpansions.has(a.expansion)
  );
  const filteredScenarios = scenarios.filter(
    (s) => s.expansion === null || enabledExpansions.has(s.expansion)
  );

  const allCombos = [];
  for (const adv of filteredAdversaries) {
    for (const level of adv.levels) {
      for (const scen of filteredScenarios) {
        allCombos.push({ adversary: adv, level, scenario: scen });
      }
    }
  }

  const maxDifficulty = allCombos.reduce(
    (max, c) => Math.max(max, c.level.difficulty + c.scenario.difficulty),
    0
  );

  const matchingCombos =
    targetDifficulty === null
      ? allCombos
      : allCombos.filter(
          (c) => c.level.difficulty + c.scenario.difficulty === targetDifficulty
        );

  const maxPlayers = Math.min(6, filteredSpirits.length, filteredBoards.length);

  useEffect(() => {
    if (playerCount > maxPlayers && maxPlayers > 0) {
      setPlayerCount(maxPlayers);
    }
  }, [maxPlayers, playerCount]);

  useEffect(() => {
    if (targetDifficulty !== null && targetDifficulty > maxDifficulty) {
      setTargetDifficulty(null);
    }
  }, [targetDifficulty, maxDifficulty]);

  useEffect(() => {
    updateUrl(assignments, boardAssignments, adversary, scenario);
  }, [assignments, boardAssignments, adversary, scenario]);

  function toggleExpansion(name) {
    const nextExpansions = new Set(enabledExpansions);
    if (nextExpansions.has(name)) {
      nextExpansions.delete(name);
    } else {
      nextExpansions.add(name);
    }
    setEnabledExpansions(nextExpansions);
    setTargetDifficulty(null);

    const newSpirits = spirits.filter((s) => nextExpansions.has(s.expansion));
    const newBoards = boards.filter((b) => nextExpansions.has(b.expansion));
    const newAdversaries = adversaries.filter(
      (a) => a.expansion === null || nextExpansions.has(a.expansion)
    );
    const newScenarios = scenarios.filter(
      (s) => s.expansion === null || nextExpansions.has(s.expansion)
    );
    const newCombos = [];
    for (const adv of newAdversaries) {
      for (const level of adv.levels) {
        for (const scen of newScenarios) {
          newCombos.push({ adversary: adv, level, scenario: scen });
        }
      }
    }
    rerollIfNeeded(
      playerCount,
      newSpirits,
      newBoards,
      newCombos,
      newAdversaries,
      newScenarios,
      null
    );
  }

  function randomize(
    count = playerCount,
    spiritPool = filteredSpirits,
    boardPool = filteredBoards,
    comboPool = matchingCombos,
    advPool = filteredAdversaries,
    scenPool = filteredScenarios,
    difficulty = targetDifficulty
  ) {
    const shuffledSpirits = shuffleArray(spiritPool);
    setAssignments(shuffledSpirits.slice(0, count));

    const shuffledBoards = shuffleArray(boardPool);
    setBoardAssignments(shuffledBoards.slice(0, count));

    if (difficulty !== null) {
      const combo = comboPool[Math.floor(Math.random() * comboPool.length)];
      setAdversary({ ...combo.adversary, selectedLevel: combo.level });
      setScenario(combo.scenario);
    } else {
      const randomAdversary =
        advPool[Math.floor(Math.random() * advPool.length)];
      const randomLevel =
        randomAdversary.levels[
          Math.floor(Math.random() * randomAdversary.levels.length)
        ];
      setAdversary({ ...randomAdversary, selectedLevel: randomLevel });

      const randomScenario =
        scenPool[Math.floor(Math.random() * scenPool.length)];
      setScenario(randomScenario);
    }
  }

  function clearAll() {
    setAssignments([]);
    setBoardAssignments([]);
    setAdversary(null);
    setScenario(null);
  }

  function rerollIfNeeded(
    count,
    spiritPool,
    boardPool,
    comboPool,
    advPool,
    scenPool,
    difficulty
  ) {
    if (assignments.length === 0) return;
    if (spiritPool.length >= count && boardPool.length >= count && comboPool.length > 0) {
      randomize(count, spiritPool, boardPool, comboPool, advPool, scenPool, difficulty);
    } else {
      clearAll();
    }
  }

  const canRandomize =
    filteredSpirits.length >= playerCount &&
    filteredBoards.length >= playerCount &&
    (targetDifficulty === null || matchingCombos.length > 0);

  return (
    <div className="app">
      <h1>Spirit Island Randomizer</h1>

      <div className="controls">
        <label htmlFor="player-count">Players:</label>
        <select
          id="player-count"
          value={playerCount}
          onChange={(e) => {
            const newCount = Number(e.target.value);
            setPlayerCount(newCount);
            rerollIfNeeded(
              newCount,
              filteredSpirits,
              filteredBoards,
              matchingCombos,
              filteredAdversaries,
              filteredScenarios,
              targetDifficulty
            );
          }}
        >
          {Array.from({ length: maxPlayers }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <label htmlFor="difficulty">Difficulty:</label>
        <select
          id="difficulty"
          value={targetDifficulty ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            const newDifficulty = val === '' ? null : Number(val);
            setTargetDifficulty(newDifficulty);
            const newMatchingCombos =
              newDifficulty === null
                ? allCombos
                : allCombos.filter(
                    (c) => c.level.difficulty + c.scenario.difficulty === newDifficulty
                  );
            rerollIfNeeded(
              playerCount,
              filteredSpirits,
              filteredBoards,
              newMatchingCombos,
              filteredAdversaries,
              filteredScenarios,
              newDifficulty
            );
          }}
        >
          <option value="">Any</option>
          {Array.from({ length: maxDifficulty + 1 }, (_, i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>

        <button
          className="randomize-btn"
          onClick={() => randomize()}
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

          {adversary && scenario && (adversary.expansion !== null || scenario.expansion !== null) && (
            <div className="game-setup">
              <h2 className="game-setup-heading">
                Game Setup
                {adversary && scenario && (
                  <span className="combined-difficulty">
                    {' '}(Difficulty{' '}
                    {adversary.selectedLevel.difficulty + scenario.difficulty})
                  </span>
                )}
              </h2>
              <div className="game-setup-cards">
                {adversary.expansion !== null && (
                  <GameSetupCard
                    label="Adversary"
                    name={adversary.name}
                    detail={`Level ${adversary.selectedLevel.level} (Difficulty ${adversary.selectedLevel.difficulty})`}
                    expansion={adversary.expansion}
                  />
                )}
                {scenario.expansion !== null && (
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
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
