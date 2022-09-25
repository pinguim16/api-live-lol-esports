import './styles/livegameStyle.css'

import {getLiveGames, getSchedule} from "../../utils/LoLEsportsAPI";
import {GameCardList} from "./GameCardList";
import {useEffect, useState} from "react";

import {Event as LiveEvents} from "./types/liveGameTypes";
import {Event as TodayEvent} from "./types/scheduleType";
import {Event as FutureEvent} from "./types/scheduleType";

export function LiveGames() {
    const [liveEvents, setLiveEvents] = useState<LiveEvents[]>([])
    const [todayEvents, setTodayEvents] = useState<TodayEvent[]>([])
    const [futureEvents, setFutureEvents] = useState<FutureEvent[]>([])

    useEffect(() => {
        getLiveGames().then(response => {
            setLiveEvents(response.data.data.schedule.events.filter(filterByTeams))
        }).catch(error =>
            console.error(error)
        )

        getSchedule().then(response => {
            setTodayEvents(response.data.data.schedule.events.filter(filterByTodayDate));
            setFutureEvents(response.data.data.schedule.events.filter(filterByNextWeek))
        }).catch(error =>
            console.error(error)
        )
    }, [])

    document.title = "LoL Live Esports";

    return (
        <div className="orders-container">
            <GameCardList
                liveGames={liveEvents} todayGames={todayEvents} futureGames={futureEvents}
            />
        </div>
    );
}

function filterByTeams(event: LiveEvents) {
    return event.match !== undefined;
}

let date = new Date(Date.now());
function filterByTodayDate(event: TodayEvent) {
    let eventDate = event.startTime.toString().split("T")[0].split("-");

    if(parseInt(eventDate[0]) === date.getFullYear() &&
        parseInt(eventDate[1]) === (date.getUTCMonth() + 1) &&
        parseInt(eventDate[2]) === date.getDate()){

        if(event.match === undefined) return false
        if(event.match.id === undefined) return false

        return true;
    }else{
        return false;
    }
}

function filterByNextWeek(event: TodayEvent) {
    let minDate = new Date();
    let maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 7)
    let eventDate = new Date(event.startTime)

    if(eventDate.valueOf() > minDate.valueOf() && eventDate.valueOf() < maxDate.valueOf()){

        if(event.match === undefined) return false
        if(event.match.id === undefined) return false

        return true;
    }else{
        return false;
    }
}