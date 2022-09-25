import './styles/playerStatusStyle.css'

import {
    getGameDetails,
    getISODateMultiplyOf10,
    getLiveDetailsGame,
    getLiveWindowGame
} from "../../utils/LoLEsportsAPI";
import {useEffect, useState} from "react";
import {GameMetadata, Frame as FrameWindow} from "./types/windowLiveTypes";
import Loading from '../../assets/images/loading.svg'
import {PlayersTable} from "./PlayersTable";
import BigNumber from "bignumber.js";
import {Frame as FrameDetails} from "./types/detailsLiveTypes";
import {GameDetails} from "./types/detailsPersistentTypes";

export function LiveGame({ match }: any) {
    const [firstFrameWindow, setFirstFrameWindow] = useState<FrameWindow>();
    const [lastFrameWindow, setLastFrameWindow] = useState<FrameWindow>();
    const [lastFrameDetails, setLastFrameDetails] = useState<FrameDetails>();
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
                if(gameData === undefined) return;

                for (const game of gameData.data.event.match.games) {
                    if(game.state === "inProgress"){
                        gameId = BigNumber.sum(preGameId, game.number).toString()
                        console.log(gameId)
                    }
                }
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
    }else {
        return(
            <div className="loading-game-container">
                <img className="loading-game-image" alt="game loading" src={Loading}/>
            </div>
        )
    }
}