import './styles/playerStatusStyle.css'

import {
    getGameDetails,
    getISODateMultiplyOf10,
    getLiveDetailsGame,
    getLiveWindowGame,
    getSchedule,
    getStandings
} from "../../utils/LoLEsportsAPI";
import {useEffect, useState} from "react";
import {GameMetadata, Frame as FrameWindow} from "./types/windowLiveTypes";
import Loading from '../../assets/images/loading.svg'
import {ReactComponent as TeamTBDSVG} from '../../assets/images/team-tbd.svg';
import {PlayersTable} from "./PlayersTable";
import BigNumber from "bignumber.js";
import { Result } from "../Schedule/types/matchTypes";
import {Frame as FrameDetails} from "./types/detailsLiveTypes";
import {GameDetails, Stream as Video} from "./types/detailsPersistentTypes";
import {Event as EventDetails} from "../Schedule/types/scheduleTypes";

export function Match({ match }: any) {
    const [firstFrameWindow, setFirstFrameWindow] = useState<FrameWindow>();
    const [lastFrameWindow, setLastFrameWindow] = useState<FrameWindow>();
    const [lastFrameDetails, setLastFrameDetails] = useState<FrameDetails>();
    const [eventDetails, setEventDetails] = useState<EventDetails>();
    const [results, setResults] = useState<Result[]>();
    const [gameData, setGameData] = useState<GameDetails>();
    const [metadata, setMetadata] = useState<GameMetadata>();

    const matchId = match.params.gameid;
    const preGameId = new BigNumber(matchId);
    
    useEffect(() => {
        getLiveGameDetails();

        function getEventDetails(){
            getSchedule().then(response => {
                let event = response.data.data.schedule.events.find((event: EventDetails) => {
                    return event.match ? (event.match.id == matchId) : false
                })
                console.groupCollapsed(`Event Details`)
                console.log(event)
                console.groupEnd()
                setEventDetails(event);
            }).catch(error =>
                console.error(error)
            )
        }

        function getFirstWindow(gameId: string){
            getLiveWindowGame(gameId).then(response => {
                let frames = response.data.frames;
                if(frames === undefined) return;
                
                console.groupCollapsed(`Meta Data`)
                console.log(response.data.gameMetadata)
                console.groupEnd()
                console.groupCollapsed(`First Frame`)
                console.log(frames[0])
                console.groupEnd()
                setFirstFrameWindow(frames[0])
            });
        }

        function getLiveWindow(gameId: string){
            let date = getISODateMultiplyOf10();
            getLiveWindowGame(gameId, date).then(response => {
                let frames = response.data.frames;
                if(frames === undefined) return;

                setLastFrameWindow(frames[frames.length - 1])
                setMetadata(response.data.gameMetadata)
            });
        }

        function getLiveGameStatus(gameId: string) {
            let date = getISODateMultiplyOf10();
            getLiveDetailsGame(gameId, date).then(response => {
                let frames = response.data.frames;
                if(frames === undefined) return;

                setLastFrameDetails(frames[frames.length - 1])
            });
        }

        function getLiveGameDetails() {
            getGameDetails(matchId).then(response => {
                let gameData: GameDetails = response.data;
                console.groupCollapsed(`Game Data`)
                console.log(gameData.data)
                console.groupEnd()
                if(gameData === undefined) return;

                let nextUnstartedGameIndex = gameData ? getNextUnstartedGameIndex(gameData) : 1
                let gameId = BigNumber.sum(preGameId, nextUnstartedGameIndex).toString();
                getEventDetails()
                getFirstWindow(gameId)
                getResults(gameData)
                setGameData(gameData);
                const windowIntervalID = setInterval(() => {
                    getLiveWindow(gameId);
                    getLiveGameStatus(gameId);
                }, 500);

                return () => {
                    clearInterval(windowIntervalID);
                }
            })
        }

        function getResults(gameData: GameDetails) {
            if(gameData === undefined) return;
            getStandings(gameData.data.event.tournament.id).then(response => {
                let stage = response.data.data.standings[0].stages.find((stage: any) => {
                    let stageSection = stage.sections.find((section: any) => {
                        return section.matches.find((match: any) => match.id == matchId)
                    })
                    return stageSection
                })
                let section = stage.sections.find((section: any) => {
                    return section.matches.find((match: any) => match.id == matchId)
                })
                if(section === undefined) return;
                let teams = section.matches.find((match: any) => match.id == matchId).teams
                let results = teams.map((team: any) => team.result)
                setResults(teams.map((team: any) => team.result))
                console.groupCollapsed(`Results`)
                console.log(results)
                console.groupEnd()
            });
        }
    }, [matchId]);

    if(firstFrameWindow !== undefined && lastFrameWindow !== undefined && lastFrameDetails !== undefined && metadata !== undefined && gameData !== undefined) {
        return (
            <PlayersTable firstFrameWindow={firstFrameWindow} lastFrameWindow={lastFrameWindow} lastFrameDetails={lastFrameDetails} gameMetadata={metadata} gameDetails={gameData} eventDetails={eventDetails} videoLink={getStreamOrVod(gameData)} results={results} />
        );
    }else if (gameData !== undefined) {
        return(
            <div className="loading-game-container">
                <div>
                    <img className="loading-game-image" alt="game loading" src={Loading}/>
                    {eventDetails ? (<h3>{eventDetails?.league.name} - {eventDetails?.blockName}</h3>) : null}
                    <div className="live-game-card-content">
                        <div className="live-game-card-team">
                            {gameData.data.event.match.teams[0].code == "TBD" ? (<TeamTBDSVG className="live-game-card-team-image"/>) : (<img className="live-game-card-team-image" src={gameData.data.event.match.teams[0].image} alt={gameData.data.event.match.teams[0].name}/>) }
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
                                {eventDetails?.match.teams[0].result ?
                                    (<span>
                                        <p>
                                            {eventDetails?.match.teams[0].record.wins} - {eventDetails?.match.teams[0].record.losses}
                                        </p>
                                    </span>)
                                : null}
                            </span>
                        </div>
                    <div className="game-card-versus">
                        <span>BEST OF {gameData.data.event.match.strategy.count}</span>
                        {gameData.data.event.match.teams[0].result && gameData.data.event.match.teams[1].result?
                            (<span>
                                <p>
                                    {gameData.data.event.match.teams[0].result.gameWins} - {gameData.data.event.match.teams[1].result.gameWins}
                                </p>
                            </span>)
                        : null}
                        <h1>VS</h1>
                    </div>
                        <div className="live-game-card-team">
                            {gameData.data.event.match.teams[1].code == "TBD" ? (<TeamTBDSVG className="live-game-card-team-image"/>) : (<img className="live-game-card-team-image" src={gameData.data.event.match.teams[1].image} alt={gameData.data.event.match.teams[1].name}/>) }
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
                                {eventDetails?.match.teams[1].result ?
                                    (<span>
                                        <p>
                                            {eventDetails?.match.teams[1].record.wins} - {eventDetails?.match.teams[1].record.losses}
                                        </p>
                                    </span>)
                                : null}
                            </span>
                        </div>
                    </div>
                    {eventDetails ?
                    (<h3>Game {getNextUnstartedGameIndex(gameData)} out of {eventDetails.match.strategy.count} will start at {new Date(eventDetails.startTime).toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit'})}</h3>)
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

function getNextUnstartedGameIndex(gameDetails: GameDetails) {
    let lastCompletedGame = gameDetails.data.event.match.games.slice().reverse().find(game => game.state == "completed")
    let nextUnstartedGame = gameDetails.data.event.match.games.find(game => game.state == "unstarted" || game.state == "inProgress")
    return nextUnstartedGame ? nextUnstartedGame.number : (lastCompletedGame ? lastCompletedGame.number : gameDetails.data.event.match.games.length)
}

function getStreamOrVod(gameDetails: GameDetails) {
    let vods = gameDetails.data.event.match.games[gameDetails.data.event.match.games.length - 1].vods
    if (vods.length) {
        return (<span className="footer-notes"><a href={getVideoLink(vods[0])} target="_blank">VOD Link</a></span>)
    }


    if (!gameDetails.data.event.streams.length) {
        return (<span>No streams currently available</span>)
    }
    let shortestDelayStream = gameDetails.data.event.streams.reduce((a, b) => b.offset < 0 && b.offset > a.offset ? b : a)
    let streamOffset = Math.round(shortestDelayStream.offset / 1000 / 60 * -1)
    let link = shortestDelayStream.provider == "youtube" ? `https://www.youtube.com/watch?v=${shortestDelayStream.parameter}` : `https://www.twitch.tv/${shortestDelayStream.parameter}`
    let delayString = streamOffset > 1 ? `Approximately ${streamOffset} minutes` : `Less than 1 minute`
    return (<span className="footer-notes">Stream Delay: {delayString} - <a href={link} target="_blank">Watch Stream</a></span>)
}

function getVideoLink(video: Video) {
    return video.provider == "youtube" ? `https://www.youtube.com/watch?v=${video.parameter}` : `https://www.twitch.tv/${video.parameter}`
}