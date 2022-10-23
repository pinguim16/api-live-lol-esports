import {Link} from "react-router-dom";
import {Event} from "./types/liveGameTypes";
import {ReactComponent as TeamTBDSVG} from '../../assets/images/team-tbd.svg';

type Props = {
    event: Event;
}

export function EventCard({ event }: Props) {
    return (
        <Link to={`live/${event.match.id}`}>
            <div className="live-game-card">
                <h3>{event.league.name} - {event.blockName}</h3>
                <h4>
                    <span>
                        {new Date(event.startTime).toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit'})}
                    </span>
                </h4>
                <div className="live-game-card-content">
                    <div className="live-game-card-team">
                        {event.match.teams[0].code === "TBD" ? (<TeamTBDSVG className="live-game-card-team-image"/>) : (<img className="live-game-card-team-image" src={event.match.teams[0].image} alt={event.match.teams[0].name}/>) }
                        <span className="outcome">
                            <p className={event.match.teams[0].result ? event.match.teams[0].result.outcome : ''}>
                                {event.match.teams[0].result ? event.match.teams[0].result.outcome : null}
                            </p>
                        </span>
                        <span>
                            <h4>
                                {event.match.teams[0].name}
                            </h4>
                        </span>
                        <span>
                            <p>
                                {event.match.teams[0].record ? `${event.match.teams[0].record.wins} - ${event.match.teams[0].record.losses}` : null}
                            </p>
                        </span>
                    </div>

                    <div className="game-card-versus">
                        <span>BEST OF {event.match.strategy.count}</span>
                        <span>
                            <p>
                                {event.match.teams[0].result && event.match.teams[1].result ? `${event.match.teams[0].result.gameWins} - ${event.match.teams[1].result.gameWins}` : null}
                            </p>
                        </span>
                        <h1>VS</h1>
                    </div>

                    <div className="live-game-card-team">
                        {event.match.teams[1].code === "TBD" ? (<TeamTBDSVG className="live-game-card-team-image"/>) : (<img className="live-game-card-team-image" src={event.match.teams[1].image} alt={event.match.teams[1].name}/>) }
                        <span className="outcome">
                            <p className={event.match.teams[1].result ? event.match.teams[1].result.outcome : ''}>
                                {event.match.teams[1].result ? event.match.teams[1].result.outcome : null}
                            </p>
                        </span>
                        <span>
                            <h4>
                                {event.match.teams[1].name}
                            </h4>
                        </span>
                        <span>
                            <p>
                                {event.match.teams[1].record ? `${event.match.teams[1].record.wins} - ${event.match.teams[1].record.losses}` : null}
                            </p>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}