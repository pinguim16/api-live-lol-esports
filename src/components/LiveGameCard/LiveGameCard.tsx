import {Link} from "react-router-dom";
import {Event} from "./types/liveGameTypes";

type Props = {
    game: Event;
}

export function LiveGameCard({ game }: Props) {
    return (
        <Link to={`live/${game.id}`}>
            <div className="live-game-card">
                <h3>{game.league.name} - {game.blockName}</h3>
                <h4>
                    <span>
                        {new Date(game.startTime).toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit'})}
                    </span>
                </h4>
                <div className="live-game-card-content">
                    <div className="live-game-card-team">
                        <img className="live-game-card-team-image" src={game.match.teams[0].image}
                             alt={game.match.teams[0].name}/>
                        {game.match.teams[1].result.outcome ?
                            (<span className="outcome">
                                <p className={game.match.teams[0].result.outcome}>
                                    {game.match.teams[0].result.outcome}
                                </p>
                            </span>)
                        : null}
                        <span>
                            <h4>
                                {game.match.teams[0].name}
                            </h4>
                        </span>
                        <span>
                            <p>
                                {game.match.teams[0].record.wins} - {game.match.teams[0].record.losses}
                            </p>
                        </span>
                    </div>

                    <div className="game-card-versus">
                        <span>BEST OF {game.match.strategy.count}</span>
                        <span>
                            <p>
                                {game.match.teams[0].result.gameWins} - {game.match.teams[1].result.gameWins}
                            </p>
                        </span>
                        <h1>VS</h1>
                    </div>

                    <div className="live-game-card-team">
                        <img className="live-game-card-team-image" src={game.match.teams[1].image}
                             alt={game.match.teams[1].name}/>
                        {game.match.teams[1].result.outcome ?
                            (<span className="outcome">
                                <p className={game.match.teams[1].result.outcome}>
                                    {game.match.teams[1].result.outcome}
                                </p>
                            </span>)
                        : null}
                        <span>
                            <h4>
                                {game.match.teams[1].name}
                            </h4>
                        </span>
                        <span>
                            <p>
                                {game.match.teams[1].record.wins} - {game.match.teams[1].record.losses}
                            </p>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}