import {LiveGameCard} from "./LiveGameCard";
import {ScheduleGameCard} from "./ScheduleGameCard";

import {Event as LiveEvent} from "./types/liveGameTypes";
import {Event as Last24HoursEvent} from "./types/scheduleType";
import {Event as Next24HoursEvent} from "./types/scheduleType";
import {Event as Next7DaysEvent} from "./types/scheduleType";

import Bedge from "../../assets/images/bedge.png"

type Props = {
    liveGames: LiveEvent[];
    last24HoursGames: Last24HoursEvent[];
    next24HoursGames: Next24HoursEvent[];
    next7DaysGames: Next7DaysEvent[];
}

export function GameCardList({ liveGames, last24HoursGames, next24HoursGames, next7DaysGames }: Props) {
    return (
        <div>
            <LiveGames liveGames={liveGames}/>

            <Last24HoursGames last24HoursGames={last24HoursGames}/>

            <Next24HoursGames next24HoursGames={next24HoursGames}/>

            <Next7DaysGames next7DaysGames={next7DaysGames}/>
        </div>
    );
}

type PropsLive = {
    liveGames: LiveEvent[];
}

function LiveGames({liveGames}: PropsLive) {
    if (liveGames !== undefined && liveGames.length !== 0) {
        return (
            <div>
                <h2 className="games-of-day">LIVE</h2>
                <div className="games-list-container">
                    <div className="games-list-items">
                        {liveGames.map(game => (
                            <LiveGameCard
                                key={game.id}
                                game={game}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }else {
        return (
            <div className="empty-games-list-container">
                <img className="empty-games-galaxy" alt="NO GAMES CURRENTLY LIVE" src={Bedge}/>
                <h2 className="game-list-items-empty">NO MATCHES CURRENTLY LIVE</h2>
            </div>
        );
    }
}

type PropsLast24Hours = {
    last24HoursGames: Last24HoursEvent[];
}

function Last24HoursGames({last24HoursGames}: PropsLast24Hours) {
    if (last24HoursGames !== undefined && last24HoursGames.length !== 0) {

        return (
            <div>
                <div className="games-separator"/>
                <h2 className="games-of-day">LAST 24 HOURS</h2>
                <div className="games-list-container">
                    <div className="games-list-items">
                        {last24HoursGames.map(game => (
                            <ScheduleGameCard
                                key={game.match.id}
                                game={game}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }else{
        return (
            <div/>
        );
    }
}

type PropsNext24Hours = {
    next24HoursGames: Next24HoursEvent[];
}

function Next24HoursGames({next24HoursGames}: PropsNext24Hours) {
    if (next24HoursGames !== undefined && next24HoursGames.length !== 0) {

        return (
            <div>
                <div className="games-separator"/>
                <h2 className="games-of-day">NEXT 24 HOURS</h2>
                <div className="games-list-container">
                    <div className="games-list-items">
                        {next24HoursGames.map(game => (
                            <ScheduleGameCard
                                key={game.match.id}
                                game={game}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }else{
        return (
            <div/>
        );
    }
}

type PropsNext7Days = {
    next7DaysGames: Next24HoursEvent[];
}

function Next7DaysGames({next7DaysGames}: PropsNext7Days) {
    if (next7DaysGames !== undefined && next7DaysGames.length !== 0) {

        return (
            <div>
                <div className="games-separator"/>
                <h2 className="games-of-day">NEXT 7 DAYS</h2>
                <div className="games-list-container">
                    <div className="games-list-items">
                        {next7DaysGames.map(game => (
                            <ScheduleGameCard
                                key={game.match.id}
                                game={game}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }else{
        return (
            <div/>
        );
    }
}