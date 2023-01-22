import './styles/playerStatusStyle.css'

import {
    getEventDetailsResponse,
    getISODateMultiplyOf10,
    getGameDetailsResponse,
    getWindowResponse,
    getScheduleResponse,
    getStandingsResponse
} from "../../utils/LoLEsportsAPI";
import {useEffect, useState} from "react";
import Loading from '../../assets/images/loading.svg'
import {ReactComponent as TeamTBDSVG} from '../../assets/images/team-tbd.svg';
import {GameDetails} from "./GameDetails"
import {LiveAPIWatcher} from "./LiveAPIWatcher";
import {MatchDetails} from "./MatchDetails"
import {Game} from "./Game";
import {EventDetails, DetailsFrame, GameMetadata, Record, Result, ScheduleEvent, Standing, WindowFrame, ExtendedVod} from "../types/baseTypes"

export function Match({ match }: any) {
    const [eventDetails, setEventDetails] = useState<EventDetails>();
    const [firstWindowFrame, setFirstWindowFrame] = useState<WindowFrame>();
    const [lastDetailsFrame, setLastDetailsFrame] = useState<DetailsFrame>();
    const [lastWindowFrame, setLastWindowFrame] = useState<WindowFrame>();
    const [metadata, setMetadata] = useState<GameMetadata>();
    const [records, setRecords] = useState<Record[]>();
    const [results, setResults] = useState<Result[]>();
    const [scheduleEvent, setScheduleEvent] = useState<ScheduleEvent>();
    const [gameIndex, setGameIndex] = useState<number>();

    const matchId = match.params.gameid;
    let matchEventDetails = eventDetails
    let currentGameIndex = 1
    useEffect(() => {
        getEventDetails(getInitialGameIndex());

        const windowIntervalID = setInterval(() => {
            if (!matchEventDetails) return
            let newGameIndex = getGameIndex(matchEventDetails)
            let gameId = matchEventDetails.match.games[newGameIndex - 1].id
            if (currentGameIndex != newGameIndex) {
                getFirstWindow(gameId)
                setGameIndex(newGameIndex)
                currentGameIndex = newGameIndex
            }
            getLiveWindow(gameId);
            getLastDetailsFrame(gameId);
        }, 500);

        return () => {
            clearInterval(windowIntervalID);
        }

        function getEventDetails(gameIndex: number) {
            getEventDetailsResponse(matchId).then(response => {
                let eventDetails: EventDetails = response.data.data.event;
                if(eventDetails === undefined) return undefined;
                let newGameIndex = getGameIndex(eventDetails)
                let gameId = eventDetails.match.games[newGameIndex - 1].id
                console.log(`Current Game ID: ${gameId}`)
                console.groupCollapsed(`Event Details`)
                console.log(eventDetails)
                console.groupEnd()
                setEventDetails(eventDetails)
                setGameIndex(gameIndex)
                getFirstWindow(gameId)
                getScheduleEvent(eventDetails)
                getResults(eventDetails)
                matchEventDetails = eventDetails
            })
        }

        function getInitialGameIndex(): number {
            let gameIndexMatch = window.location.href.match(/game-index\/(\d+)/)
            let initialGameIndex = gameIndexMatch ? parseInt(gameIndexMatch[1]) : 0
            console.log(`Initial Game Index: ${initialGameIndex}`)
            setGameIndex(initialGameIndex)
            return initialGameIndex
        }

        function getGameIndex(eventDetails: EventDetails): number {
            let gameIndexMatch = window.location.href.match(/game-index\/(\d+)/)
            let newGameIndex = gameIndexMatch ? parseInt(gameIndexMatch[1]) : getNextUnstartedGameIndex(eventDetails)
            setGameIndex(newGameIndex)
            return newGameIndex
        }

        function getScheduleEvent(eventDetails: EventDetails) {
            getScheduleResponse().then(response => {
                let scheduleEvents: ScheduleEvent[] = response.data.data.schedule.events
                let scheduleEvent = scheduleEvents.find((scheduleEvent: ScheduleEvent) => {
                    return scheduleEvent.match ? (scheduleEvent.match.id === matchId) : false
                })
                if (scheduleEvent === undefined) return
                let records = scheduleEvent.match.teams[0].record && scheduleEvent.match.teams[1].record? [scheduleEvent.match.teams[0].record, scheduleEvent.match.teams[1].record] : undefined
                if (records === undefined) return

                console.groupCollapsed(`Schedule Event`)
                console.log(scheduleEvent)
                console.groupEnd()
                setRecords(records)
                setScheduleEvent(scheduleEvent);
            }).catch(error =>
                console.error(error)
            )
        }

        function getFirstWindow(gameId: string){
            getWindowResponse(gameId).then(response => {
                let frames: WindowFrame[] = response.data.frames;
                if(frames === undefined) return;
                
                console.groupCollapsed(`Meta Data`)
                console.log(response.data.gameMetadata)
                console.groupEnd()
                console.groupCollapsed(`First Frame`)
                console.log(frames[0])
                console.groupEnd()
                setFirstWindowFrame(frames[0])
            });
        }

        function getLiveWindow(gameId: string){
            let date = getISODateMultiplyOf10();
            getWindowResponse(gameId, date).then(response => {
                let frames: WindowFrame[] = response.data.frames;
                if(frames === undefined) return;

                setLastWindowFrame(frames[frames.length - 1])
                setMetadata(response.data.gameMetadata)
            });
        }

        function getLastDetailsFrame(gameId: string) {
            let date = getISODateMultiplyOf10();
            getGameDetailsResponse(gameId, date).then(response => {
                let frames: DetailsFrame[] = response.data.frames;
                if(frames === undefined) return;
                setLastDetailsFrame(frames[frames.length - 1])
            });
        }

        function getResults(eventDetails: EventDetails) {
            if(eventDetails === undefined) return;
            getStandingsResponse(eventDetails.tournament.id).then(response => {
                let standings: Standing[] = response.data.data.standings
                let stage = standings[0].stages.find((stage) => {
                    let stageSection = stage.sections.find((section) => {
                        return section.matches.find((match) => match.id === matchId)
                    })
                    return stageSection
                })
                if(stage === undefined) return;
                let section = stage.sections.find((section) => {
                    return section.matches.find((match) => match.id === matchId)
                })
                if(section === undefined) return;
                let match = section.matches.find((match) => match.id === matchId)
                if(match === undefined) return;
                let teams = match.teams
                let results = teams.map((team) => team.result)
                setResults(teams.map((team) => team.result))
                console.groupCollapsed(`Results`)
                console.log(results)
                console.groupEnd()
            });
        }
    }, [matchId]);

    if(firstWindowFrame !== undefined && lastWindowFrame !== undefined && lastDetailsFrame !== undefined && metadata !== undefined && eventDetails !== undefined && scheduleEvent !== undefined && gameIndex !== undefined) {
        return (
            <div className='match-container'>
                <MatchDetails eventDetails={eventDetails} gameMetadata={metadata} records={records} results={results} scheduleEvent={scheduleEvent} />
                <Game eventDetails={eventDetails} gameIndex={gameIndex} gameMetadata={metadata} firstWindowFrame={firstWindowFrame} lastDetailsFrame={lastDetailsFrame} lastWindowFrame={lastWindowFrame} records={records} results={results} videoLink={getStreamOrVod(eventDetails)} />
            </div>
        );
    }else if (eventDetails !== undefined) {
        return(
            <div className="loading-game-container">
                <div>
                    <img className="loading-game-image" alt="game loading" src={Loading}/>
                    {eventDetails ? (<h3>{eventDetails?.league.name}</h3>) : null}
                    <div className="live-game-card-content">
                        <div className="live-game-card-team">
                            {eventDetails.match.teams[0].code === "TBD" ? (<TeamTBDSVG className="live-game-card-team-image"/>) : (<img className="live-game-card-team-image" src={eventDetails.match.teams[0].image} alt={eventDetails.match.teams[0].name}/>) }
                            <span className="live-game-card-title">
                                {eventDetails?.match.teams[0].result ?
                                    (<span className="outcome">
                                        <p className={eventDetails.match.teams[0].result.outcome}>
                                            {eventDetails.match.teams[0].result.outcome}
                                        </p>
                                    </span>)
                                : null}
                                <span>
                                    <h4>
                                        {eventDetails?.match.teams[0].name}
                                    </h4>
                                </span>
                                {records ?
                                    (<span>
                                        <p>
                                            {records[0].wins} - {records[0].losses}
                                        </p>
                                    </span>)
                                : null}
                            </span>
                        </div>
                    <div className="game-card-versus">
                        <span>BEST OF {eventDetails.match.strategy.count}</span>
                        {eventDetails.match.teams[0].result && eventDetails.match.teams[1].result?
                            (<span>
                                <p>
                                    {eventDetails.match.teams[0].result.gameWins} - {eventDetails.match.teams[1].result.gameWins}
                                </p>
                            </span>)
                        : null}
                        <h1>VS</h1>
                    </div>
                        <div className="live-game-card-team">
                            {eventDetails.match.teams[1].code === "TBD" ? (<TeamTBDSVG className="live-game-card-team-image"/>) : (<img className="live-game-card-team-image" src={eventDetails.match.teams[1].image} alt={eventDetails.match.teams[1].name}/>) }
                            <span className="live-game-card-title">
                                {eventDetails?.match.teams[1].result ?
                                    (<span className="outcome">
                                        <p className={eventDetails?.match.teams[1].result.outcome}>
                                            {eventDetails?.match.teams[1].result.outcome}
                                        </p>
                                    </span>)
                                : null}
                                <span>
                                    <h4>
                                        {eventDetails?.match.teams[1].name}
                                    </h4>
                                </span>
                                {records ?
                                    (<span>
                                        <p>
                                            {records[1].wins} - {records[1].losses}
                                        </p>
                                    </span>)
                                : null}
                            </span>
                        </div>
                    </div>
                    {scheduleEvent && eventDetails ?
                        (<h3>Game {getNextUnstartedGameIndex(eventDetails)} out of {eventDetails.match.strategy.count} will start at {new Date(scheduleEvent.startTime).toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit'})}</h3>)
                    : null
                    }
                </div>
            </div>
        )
    } else {
        return(
            <div className="loading-game-container">
                <div>
                    <img className="loading-game-image" alt="game loading" src={Loading}/>
                </div>
            </div>
        )
    }
}

function getNextUnstartedGameIndex(eventDetails: EventDetails) {
    let lastCompletedGame = eventDetails.match.games.slice().reverse().find(game => game.state === "completed")
    let nextUnstartedGame = eventDetails.match.games.find(game => game.state === "unstarted" || game.state === "inProgress")
    return nextUnstartedGame ? nextUnstartedGame.number : (lastCompletedGame ? lastCompletedGame.number : eventDetails.match.games.length)
}

function getStreamOrVod(eventDetails: EventDetails) {
    let vods = eventDetails.match.games[getNextUnstartedGameIndex(eventDetails) - 1].vods
    if (vods.length) {
        return (<span className="footer-notes"><a href={getExtendedVodLink(vods[0])} target="_blank" rel="noreferrer">VOD Link</a></span>)
    }

    if (!eventDetails.streams || !eventDetails.streams.length) {
        return (<span>No streams currently available</span>)
    }
    let shortestDelayStream = eventDetails.streams.reduce((previousVod, currentVod) => currentVod.offset < 0 && currentVod.offset > previousVod.offset ? currentVod : previousVod, eventDetails.streams[0])
    
    let streamOffset = Math.round(shortestDelayStream.offset / 1000 / 60 * -1)
    let link = shortestDelayStream.provider === "youtube" ? `https://www.youtube.com/watch?v=${shortestDelayStream.parameter}` : `https://www.twitch.tv/${shortestDelayStream.parameter}`
    let delayString = streamOffset > 1 ? `Approximately ${streamOffset} minutes` : `Less than 1 minute`
    return (<span className="footer-notes">Stream Delay: {delayString} - <a href={link} target="_blank" rel="noreferrer">Watch Stream</a></span>)
}

function getExtendedVodLink(extendedVod: ExtendedVod) {
    return extendedVod.provider === "youtube" ? `https://www.youtube.com/watch?v=${extendedVod.parameter}` : `https://www.twitch.tv/${extendedVod.parameter}`
}