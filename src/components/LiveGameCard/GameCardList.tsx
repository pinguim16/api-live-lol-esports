import {LiveGameCard} from "./LiveGameCard";
import {ScheduleGameCard} from "./ScheduleGameCard";

import {Event as LiveEvent} from "./types/liveGameTypes";
import {Event as TodayEvent} from "./types/scheduleType";
import {Event as FutureEvent} from "./types/scheduleType";

import Bedge from "../../assets/images/bedge.png"

type Props = {
    liveGames: LiveEvent[];
    todayGames: TodayEvent[];
    futureGames: FutureEvent[];
}

export function GameCardList({ liveGames, todayGames, futureGames }: Props) {
    return (
        <div>
            <LiveGames liveGames={liveGames}/>

            <div className="games-separator"/>

            <TodayGames todayGames={todayGames}/>

            <div className="games-separator"/>

            <FutureGames futureGames={futureGames}/>
        </div>
    );
}

type PropsLive = {
    liveGames: LiveEvent[];
}

function LiveGames({liveGames}: PropsLive) {
    if (liveGames !== undefined && liveGames.length !== 0) {
        return (
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

type PropsToday = {
    todayGames: TodayEvent[];
}

function TodayGames({todayGames}: PropsToday) {
    if (todayGames !== undefined && todayGames.length !== 0) {

        let date = new Date();

        return (
            <div>
                <h2 className="games-of-day">TODAY'S FINISHED MATCHES</h2>
                <div className="games-list-container">
                    <div className="games-list-items">
                        {todayGames.map(game => (
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

type PropsFuture = {
    futureGames: FutureEvent[];
}

function FutureGames({futureGames}: PropsFuture) {
    if (futureGames !== undefined && futureGames.length !== 0) {

        let date = new Date();

        return (
            <div>
                <h2 className="games-of-day">NEXT 7 DAYS</h2>
                <div className="games-list-container">
                    <div className="games-list-items">
                        {futureGames.map(game => (
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