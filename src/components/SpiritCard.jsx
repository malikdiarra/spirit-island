function SpiritCard({ playerNumber, spirit, board, aspect }) {
  const complexityClass = spirit.complexity.toLowerCase().replace(' ', '-');

  return (
    <div className="spirit-card">
      <div className="spirit-card-header">
        <div className="player-label">Player {playerNumber}</div>
        {board && <span className="board-badge">Board {board.name}</span>}
      </div>
      <div className="spirit-name">{spirit.name}</div>
      {aspect && (
        <div className="spirit-aspect">
          <span className="aspect-name">{aspect.name}</span>
          <span className="aspect-expansion">{aspect.expansion}</span>
        </div>
      )}
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
