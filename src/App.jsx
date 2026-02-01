import { useState } from 'react';
import SpiritCard from './components/SpiritCard';
import spirits from './data/spirits.json';
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

  const maxPlayers = Math.min(6, spirits.length);

  function randomize() {
    const shuffled = shuffleArray(spirits);
    setAssignments(shuffled.slice(0, playerCount));
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
            setAssignments([]);
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

      <p className="spirit-count">{spirits.length} spirits available</p>

      {assignments.length > 0 && (
        <div className="results">
          {assignments.map((spirit, i) => (
            <SpiritCard key={spirit.name} playerNumber={i + 1} spirit={spirit} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
