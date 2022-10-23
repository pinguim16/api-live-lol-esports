import './styles/scheduleStyle.css'

import {getLiveGames, getSchedule} from "../../utils/LoLEsportsAPI";
import {EventCard} from "./EventCard";
import {useEffect, useState} from "react";

import {Event} from "./types/liveGameTypes";

type ScheduledEvent = {
    emptyMessage: string,
    eventTitle: string,
    events: Event[],
}

export function EventsSchedule() {
    const [liveEvents, setLiveEvents] = useState<Event[]>([])
    const [last24HoursEvents, setLast24HoursEvents] = useState<Event[]>([])
    const [next24HoursEvents, setNext24HoursEvents] = useState<Event[]>([])
    const [next7DaysEvents, setNext7DaysEvents] = useState<Event[]>([])

    useEffect(() => {
        getLiveGames().then(response => {
            console.groupCollapsed(`Live Matches: ${response.data.data.schedule.events.length}`)
            console.table(response.data.data.schedule.events)
            console.groupEnd()
            setLiveEvents(response.data.data.schedule.events.filter(filterLiveEvents))
        }).catch(error =>
            console.error(error)
        )

        getSchedule().then(response => {
            console.groupCollapsed(`Scheduled Matches: ${response.data.data.schedule.events.length}`)
            console.table(response.data.data.schedule.events)
            console.groupEnd()
            setLast24HoursEvents(response.data.data.schedule.events.filter(filterByLast24Hours))
            setNext24HoursEvents(response.data.data.schedule.events.filter(filterByNext24Hours))
            setNext7DaysEvents(response.data.data.schedule.events.filter(filterByNext7Days))
        }).catch(error =>
            console.error(error)
        )
    }, [])

    document.title = "LoL Live Esports";

    let scheduledEvents = [
        {
            emptyMessage: 'No Live Matches',
            eventTitle: 'Live Matches',
            events: liveEvents
        },
        {
            emptyMessage: '',
            eventTitle: 'Last 24 Hours',
            events: last24HoursEvents
        },
        {

            emptyMessage: '',
            eventTitle: 'Next 24 Hours',
            events: next24HoursEvents
        },
        {
            emptyMessage: 'No Upcoming Matches',
            eventTitle: 'Next 7 Days',
            events: next7DaysEvents
        }
    ]

    return (
        <div className="orders-container">
            {scheduledEvents.map(scheduledEvent => (
                <EventCards key={scheduledEvent.eventTitle} scheduledEvent={scheduledEvent} />
            ))}
        </div>
    );
}

type EventCardProps = {
    scheduledEvent: ScheduledEvent
}

function EventCards({scheduledEvent}: EventCardProps) {
    if (scheduledEvent !== undefined && scheduledEvent.events.length !== 0) {
        return (
            <div>
                <h2 className="games-of-day">{scheduledEvent.eventTitle}</h2>
                <div className="games-list-container">
                    <div className="games-list-items">
                        {scheduledEvent.events.map(event => (
                            <EventCard
                                key={`${event.id}_${event.startTime}`}
                                event={event}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }else {
        return (
            <h2 className="games-of-day">{scheduledEvent.emptyMessage}</h2>
        );
    }
}

function filterLiveEvents(event: Event) {
    return event.match !== undefined && event.state === "inProgress";
}

function filterByLast24Hours(event: Event) {
    if (event.state !== 'completed') {
        return false
    }
    let minDate = new Date();
    let maxDate = new Date()
    minDate.setDate(minDate.getDate() - 1)
    maxDate.setHours(maxDate.getHours() - 1)
    let eventDate = new Date(event.startTime)

    if(eventDate.valueOf() > minDate.valueOf() && eventDate.valueOf() < maxDate.valueOf()){

        if(event.match === undefined) return false
        if(event.match.id === undefined) return false

        return true;
    }else{
        return false;
    }
}

function filterByNext24Hours(event: Event) {
    if (event.state !== 'unstarted') {
        return false
    }
    let minDate = new Date();
    let maxDate = new Date()
    minDate.setHours(minDate.getHours() - 1)
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

function filterByNext7Days(event: Event) {
    if (event.state !== 'unstarted') {
        return false
    }
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