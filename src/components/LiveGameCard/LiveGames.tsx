import './styles/livegameStyle.css'

import {getLiveGames, getSchedule} from "../../utils/LoLEsportsAPI";
import {GameCardList} from "./GameCardList";
import {useEffect, useState} from "react";

import {Event as LiveEvents} from "./types/liveGameTypes";
import {Event as Last24HoursEvent} from "./types/scheduleType";
import {Event as Next24HoursEvent} from "./types/scheduleType";
import {Event as Next7DaysEvent} from "./types/scheduleType";

export function LiveGames() {
    const [liveEvents, setLiveEvents] = useState<LiveEvents[]>([])
    const [last24HoursEvents, setLast24HoursEvents] = useState<Last24HoursEvent[]>([])
    const [next24HoursEvents, setNext24HoursEvents] = useState<Next24HoursEvent[]>([])
    const [next7DaysEvents, setNext7DaysEvents] = useState<Next7DaysEvent[]>([])

    useEffect(() => {
        getLiveGames().then(response => {
            setLiveEvents(response.data.data.schedule.events.filter(filterByTeams))
        }).catch(error =>
            console.error(error)
        )

        getSchedule().then(response => {
            setLast24HoursEvents(response.data.data.schedule.events.filter(filterByLast24Hours))
            setNext24HoursEvents(response.data.data.schedule.events.filter(filterByNext24Hours))
            setNext7DaysEvents(response.data.data.schedule.events.filter(filterByNext7Days))
        }).catch(error =>
            console.error(error)
        )
    }, [])

    document.title = "LoL Live Esports";

    return (
        <div className="orders-container">
            <GameCardList
                liveGames={liveEvents} last24HoursGames={last24HoursEvents} next24HoursGames={next24HoursEvents} next7DaysGames={next7DaysEvents}
            />
        </div>
    );
}

function filterByTeams(event: LiveEvents) {
    return event.match !== undefined;
}

let date = new Date(Date.now());
function filterByLast24Hours(event: Last24HoursEvent) {
    let minDate = new Date();
    let maxDate = new Date()
    minDate.setDate(minDate.getDate() - 1)
    let eventDate = new Date(event.startTime)

    if(eventDate.valueOf() > minDate.valueOf() && eventDate.valueOf() < maxDate.valueOf()){

        if(event.match === undefined) return false
        if(event.match.id === undefined) return false

        return true;
    }else{
        return false;
    }
}

function filterByNext24Hours(event: Next24HoursEvent) {
    let minDate = new Date();
    let maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 1)
    let eventDate = new Date(event.startTime)

    if(eventDate.valueOf() > minDate.valueOf() && eventDate.valueOf() < maxDate.valueOf()){

        if(event.match === undefined) return false
        if(event.match.id === undefined) return false

        return true;
    }else{
        return false;
    }
}

function filterByNext7Days(event: Next7DaysEvent) {
    let minDate = new Date();
    let maxDate = new Date()
    minDate.setDate(minDate.getDate() + 1)
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