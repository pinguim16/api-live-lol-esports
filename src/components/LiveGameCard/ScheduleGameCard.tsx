import {Link} from "react-router-dom";
import {Event} from "./types/scheduleType";
import {ReactComponent as TeamTBDSVG} from '../../assets/images/team-tbd.svg';

type Props = {
    game: Event;
}

export function ScheduleGameCard({ game }: Props) {
    return (
        <Link to={`live/${game.match.id}`}>
            <div className="live-game-card">
                <h3>{game.league.name} - {game.blockName}</h3>
                <h4>
                    <span>
                        {new Date(game.startTime).toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit'})}
                    </span>
                </h4>
                <div className="live-game-card-content">
                    <div className="live-game-card-team">
                        {game.match.teams[0].code == "TBD" ? (<TeamTBDSVG className="live-game-card-team-image"/>) : (<img className="live-game-card-team-image" src={game.match.teams[0].image} alt={game.match.teams[0].name}/>) }
                        <span className="outcome">
                            <p className={game.match.teams[0].result ? game.match.teams[0].result.outcome : ''}>
                                {game.match.teams[0].result ? game.match.teams[0].result.outcome : null}
                            </p>
                        </span>
                        <span>
                            <h4>
                                {game.match.teams[0].name}
                            </h4>
                        </span>
                        <span>
                            <p>
                                {game.match.teams[0].record ? `${game.match.teams[0].record.wins} - ${game.match.teams[0].record.losses}` : null}
                            </p>
                        </span>
                    </div>

                    <div className="game-card-versus">
                        <span>BEST OF {game.match.strategy.count}</span>
                        <span>
                            <p>
                                {game.match.teams[0].result && game.match.teams[1].result ? `${game.match.teams[0].result.gameWins} - ${game.match.teams[1].result.gameWins}` : null}
                            </p>
                        </span>
                        <h1>VS</h1>
                    </div>

                    <div className="live-game-card-team">
                        {game.match.teams[1].code == "TBD" ? (<TeamTBDSVG className="live-game-card-team-image"/>) : (<img className="live-game-card-team-image" src={game.match.teams[1].image} alt={game.match.teams[1].name}/>) }
                        <span className="outcome">
                            <p className={game.match.teams[1].result ? game.match.teams[1].result.outcome : ''}>
                                {game.match.teams[1].result ? game.match.teams[1].result.outcome : null}
                            </p>
                        </span>
                        <span>
                            <h4>
                                {game.match.teams[1].name}
                            </h4>
                        </span>
                        <span>
                            <p>
                                {game.match.teams[1].record ? `${game.match.teams[1].record.wins} - ${game.match.teams[1].record.losses}` : null}
                            </p>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}