function SpiritCard({ playerNumber, spirit }) {
  const complexityClass = spirit.complexity.toLowerCase().replace(' ', '-');

  return (
    <div className="spirit-card">
      <div className="player-label">Player {playerNumber}</div>
      <div className="spirit-name">{spirit.name}</div>
      <div className="spirit-details">
        <span className="spirit-expansion">{spirit.expansion}</span>
        <span className={`spirit-complexity ${complexityClass}`}>
          {spirit.complexity}
        </span>
      </div>
    </div>
  );
}

export default SpiritCard;
