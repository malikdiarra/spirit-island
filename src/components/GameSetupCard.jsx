function GameSetupCard({ label, name, detail, expansion }) {
  return (
    <div className="game-setup-card">
      <div className="setup-label">{label}</div>
      <div className="setup-name">{name}</div>
      <div className="setup-details">
        {detail && <span className="setup-detail">{detail}</span>}
        {expansion && <span className="setup-expansion">{expansion}</span>}
      </div>
    </div>
  );
}

export default GameSetupCard;
