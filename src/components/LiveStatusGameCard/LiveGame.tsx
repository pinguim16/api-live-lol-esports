import './styles/playerStatusStyle.css'

import {
    getGameDetails,
    getISODateMultiplyOf10,
    getLiveDetailsGame,
    getLiveWindowGame,
    getSchedule
} from "../../utils/LoLEsportsAPI";
import {useEffect, useState} from "react";
import {GameMetadata, Frame as FrameWindow} from "./types/windowLiveTypes";
import Loading from '../../assets/images/loading.svg'
import {PlayersTable} from "./PlayersTable";
import BigNumber from "bignumber.js";
import {Frame as FrameDetails} from "./types/detailsLiveTypes";
import {GameDetails} from "./types/detailsPersistentTypes";
import {Event as EventDetails} from "../LiveGameCard/types/scheduleType";

export function LiveGame({ match }: any) {
    const [firstFrameWindow, setFirstFrameWindow] = useState<FrameWindow>();
    const [lastFrameWindow, setLastFrameWindow] = useState<FrameWindow>();
    const [lastFrameDetails, setLastFrameDetails] = useState<FrameDetails>();
    const [eventDetails, setEventDetails] = useState<EventDetails>();
    const [gameData, setGameData] = useState<GameDetails>();
    const [metadata, setMetadata] = useState<GameMetadata>();

    const matchId = match.params.gameid;
    const preGameId = new BigNumber(matchId);
    let gameId = BigNumber.sum(preGameId, 1).toString();
    
    useEffect(() => {
        getLiveGameDetails();
        /*getLiveWindow();
        getLiveGameStatus();*/

        const windowIntervalID = setInterval(() => {
            getLiveWindow();
            getLiveGameStatus();
        }, 500);

        return () => {
            clearInterval(windowIntervalID);
        }

        function getEventDetails(){
            getSchedule().then(response => {
                setEventDetails(response.data.data.schedule.events.find((event: EventDetails) => {
                    return event.match.id == matchId
                }));
            }).catch(error =>
                console.error(error)
            )
        }

        function getFirstWindow(){
            getLiveWindowGame(gameId).then(response => {
                let frames = response.data.frames;
                if(frames === undefined) return;
                
                setFirstFrameWindow(frames[0])
            });
        }

        function getLiveWindow(){
            let date = getISODateMultiplyOf10();
            getLiveWindowGame(gameId, date).then(response => {
                let frames = response.data.frames;
                if(frames === undefined) return;

                setLastFrameWindow(frames[frames.length - 1])
                setMetadata(response.data.gameMetadata)
            });
        }

        function getLiveGameStatus() {
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
                console.log(gameData)
                if(gameData === undefined) return;

                for (const game of gameData.data.event.match.games) {
                    if(game.state === "inProgress"){
                        gameId = BigNumber.sum(preGameId, game.number).toString()
                        console.log(gameId)
                    }
                }
                getEventDetails()
                getFirstWindow()
                setGameData(gameData);
            })
        }
    }, [matchId]);

    /*if(gameId === "0") {
        return (
            <Redirect to="/"/>
        )
    }*/

    if(firstFrameWindow !== undefined && lastFrameWindow !== undefined && lastFrameDetails !== undefined && metadata !== undefined && gameData !== undefined) {
        return (
            <PlayersTable firstFrameWindow={firstFrameWindow} lastFrameWindow={lastFrameWindow} lastFrameDetails={lastFrameDetails} gameMetadata={metadata} gameDetails={gameData} />
        );
    }else if (eventDetails !== undefined && gameData !== undefined) {
        return(
            <div className="loading-game-container">
                <div>
                    <img className="loading-game-image" alt="game loading" src={Loading}/>
                    <div className="live-game-card-content">
                        <div className="live-game-card-team">
                            <img className="live-game-card-team-image" src={gameData.data.event.match.teams[0].image}
                                alt={gameData.data.event.match.teams[0].name}/>
                            <span className="live-game-card-title">
                            {gameData.data.event.match.teams[0].name}
                        </span>
                        </div>

                        <div>
                            <h1>VS</h1>
                            <span>BEST OF {gameData.data.event.match.strategy.count}</span>
                        </div>

                        <div className="live-game-card-team">
                            <img className="live-game-card-team-image" src={gameData.data.event.match.teams[1].image}
                                alt={gameData.data.event.match.teams[1].name}/>
                            <span className="live-game-card-title">
                            {gameData.data.event.match.teams[1].name}
                        </span>
                        </div>
                    </div>
                    <h3>Game {gameData.data.event.match.games.length} out of {eventDetails.match.strategy.count} will start at {new Date(eventDetails.startTime).toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit'})}</h3>
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