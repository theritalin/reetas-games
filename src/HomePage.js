import React, { useState, Suspense } from "react";
import "./Homepage.css";

const games = [
  {
    id: 1,
    name: "Dice",
    logo: "https://game-icons.net/icons/ffffff/000000/1x1/delapouite/dice-six-faces-one.svg",
    component: () => import("./dice/App"),
  }, // Assuming you have separate component files for each game
  {
    id: 2,
    name: "Math",
    logo: "https://game-icons.net/icons/ffffff/000000/1x1/delapouite/dice-six-faces-two.svg",
    component: () => import("./math/App"),
  },
  {
    id: 3,
    name: "Slot",
    logo: "https://game-icons.net/icons/ffffff/000000/1x1/delapouite/dice-six-faces-three.svg",
    component: () => import("./slot/App"),
  },
];

function HomePage() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameComponent, setGameComponent] = useState(null);

  const handleGameSelect = (gameId) => {
    setSelectedGame(gameId);
    const game = games.find((game) => game.id === gameId);
    if (game) {
      const GameComponent = React.lazy(game.component);
      setGameComponent(<GameComponent />);
    }
  };

  return (
    <div className="content">
      <Sidebar games={games} onSelect={handleGameSelect} />
      <div className="divider"></div>
      <div className="game-container">
        <Suspense fallback={<div>Loading...</div>}>{gameComponent}</Suspense>
      </div>
    </div>
  );
}

const Sidebar = ({ games, onSelect }) => {
  return (
    <div className="sidebar">
      <h3>Games</h3>
      <div className="game-list">
        {games.map((game) => (
          <SideItems
            key={game.id}
            logo={game.logo}
            text={game.name}
            onClick={() => onSelect(game.id)}
          />
        ))}
      </div>
    </div>
  );
};

const SideItems = ({ logo, text, onClick }) => {
  return (
    <div className="logo-row" onClick={onClick}>
      <img className="logo-image" src={logo} alt="Logo" />
      <span className="logo-text">{text}</span>
    </div>
  );
};

export default HomePage;


///Home page tamam dice kontratına bakıyordsun en son