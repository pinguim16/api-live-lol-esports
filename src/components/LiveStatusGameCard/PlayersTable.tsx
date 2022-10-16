import './styles/playerStatusStyle.css'
import '../LiveGameCard/styles/livegameStyle.css'

import { GameMetadata } from "./types/windowLiveTypes";
import {GameDetails, Stream as Video} from "./types/detailsPersistentTypes";

import {MiniHealthBar} from "./MiniHealthBar";
import React, {useEffect, useState} from "react";
import {toast} from 'react-toastify';
import {Frame as FrameDetails} from "./types/detailsLiveTypes";
import {Frame as FrameWindow, Participant as ParticipantWindow} from "./types/windowLiveTypes";
import {Event as EventDetails} from "../LiveGameCard/types/scheduleType";

import {ReactComponent as TowerSVG} from '../../assets/images/tower.svg';
import {ReactComponent as BaronSVG} from '../../assets/images/baron.svg';
import {ReactComponent as KillSVG} from '../../assets/images/kill.svg';
import {ReactComponent as GoldSVG} from '../../assets/images/gold.svg';
import {ReactComponent as InhibitorSVG} from '../../assets/images/inhibitor.svg';

import {ReactComponent as OceanDragonSVG} from '../../assets/images/dragon-ocean.svg';
import {ReactComponent as InfernalDragonSVG} from '../../assets/images/dragon-infernal.svg';
import {ReactComponent as CloudDragonSVG} from '../../assets/images/dragon-cloud.svg';
import {ReactComponent as MountainDragonSVG} from '../../assets/images/dragon-mountain.svg';
import {ReactComponent as ElderDragonSVG} from '../../assets/images/dragon-elder.svg';
import {ItemsDisplay} from "./ItemsDisplay";

import {Helmet} from "react-helmet";
import {LiveAPIWatcher} from "./LiveAPIWatcher";
import { CHAMPIONS_URL } from '../../utils/LoLEsportsAPI';

type Props = {
    firstFrameWindow: FrameWindow,
    lastFrameWindow: FrameWindow,
    lastFrameDetails: FrameDetails,
    gameMetadata: GameMetadata,
    gameDetails: GameDetails,
    eventDetails: EventDetails,
    videoLink: JSX.Element
}

export function PlayersTable({ firstFrameWindow, lastFrameWindow, lastFrameDetails, gameMetadata, gameDetails, eventDetails, videoLink } : Props) {
    const [gameState, setGameState] = useState<GameState>(GameState[lastFrameWindow.gameState as keyof typeof GameState]);

    useEffect(() => {
        let currentGameState: GameState = GameState[lastFrameWindow.gameState as keyof typeof GameState]

        if(currentGameState !== gameState){
            setGameState(currentGameState);

            toast.info(`Game status changed: ${currentGameState.toUpperCase()}`, {
                position: "top-right",
                autoClose: 15000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    }, [lastFrameWindow.gameState, gameState]);

    let blueTeam = gameDetails.data.event.match.teams[0];
    let redTeam = gameDetails.data.event.match.teams[1];

    const auxBlueTeam = blueTeam

    /*
        As vezes os times continuam errados mesmo apos verificar o ultimo frame,
        em ligas como TCL, por isso fazemos essa verificação pelo nome
    */
    const summonerName = gameMetadata.blueTeamMetadata.participantMetadata[0].summonerName.split(" ");

    if(redTeam.code.startsWith(summonerName[0])){ // Temos que verificar apenas os primeiros caracteres pois os times academy usam o A, a mais na tag mas não nos nomes
        blueTeam = redTeam;
        redTeam = auxBlueTeam;
    }

    const goldPercentage = getGoldPercentage(lastFrameWindow.blueTeam.totalGold, lastFrameWindow.redTeam.totalGold);
    let inGameTime = getInGameTime(firstFrameWindow.rfc460Timestamp, lastFrameWindow.rfc460Timestamp)
    document.title = `${blueTeam.name} VS ${redTeam.name}`;

    return (
        <div className="status-live-game-card">

            <Helmet>
                <script src="../../utils/LoLAPIWatcher.js"/>
            </Helmet>

            <div className="status-live-game-card-content">
                <div className="live-game-stats-header">
                    <div className="live-game-stats-header-team-images">
                        <h1>
                            <div className="live-game-card-team">
                                <img className="live-game-card-team-image" src={eventDetails.match.teams[0].image}
                                    alt={eventDetails.match.teams[0].name}/>
                                <span className='outcome'>
                                    <p className={eventDetails.match.teams[0].result.outcome}>
                                        {eventDetails.match.teams[0].result.outcome}
                                    </p>
                                </span>
                                <span>
                                    <h4>
                                        {eventDetails.match.teams[0].name}
                                    </h4>
                                </span>
                                <span>
                                    <p>
                                        {eventDetails.match.teams[0].record.wins} - {eventDetails.match.teams[0].record.losses}
                                    </p>
                                </span>
                            </div>
                        </h1>
                        <h1>
                            <div>BEST OF {gameDetails.data.event.match.strategy.count}</div>
                            <div>{eventDetails.match.teams[0].result.gameWins}-{eventDetails.match.teams[1].result.gameWins}</div>
                            VS
                            <div>{gameState.toUpperCase()}</div>
                            <div>{inGameTime}</div>
                        </h1>
                        <h1>
                            <div className="live-game-card-team">
                                <img className="live-game-card-team-image" src={eventDetails.match.teams[1].image}
                                    alt={eventDetails.match.teams[1].name}/>
                                <span className='outcome'>
                                    <p className={eventDetails.match.teams[1].result.outcome}>
                                        {eventDetails.match.teams[1].result.outcome}
                                    </p>
                                </span>
                                <span>
                                    <h4>
                                        {eventDetails.match.teams[1].name}
                                    </h4>
                                </span>
                                <span>
                                    <p>
                                        {eventDetails.match.teams[1].record.wins} - {eventDetails.match.teams[1].record.losses}
                                    </p>
                                </span>
                            </div>
                        </h1>
                    </div>
                    <div className="live-game-stats-header-status">
                        <div className="blue-team">
                            <div className="team-stats inhibitors">
                                <InhibitorSVG/>
                                {lastFrameWindow.blueTeam.inhibitors}
                            </div>
                            <div className="team-stats barons">
                                <BaronSVG/>
                                {lastFrameWindow.blueTeam.barons}
                            </div>
                            <div className="team-stats towers">
                                <TowerSVG/>
                                {lastFrameWindow.blueTeam.towers}
                            </div>
                            <div className="team-stats gold">
                                <GoldSVG/>
                                <span>
                                    {Number(lastFrameWindow.blueTeam.totalGold).toLocaleString('en-us')}
                                </span>
                            </div>
                            <div className="team-stats kills">
                                <KillSVG/>
                                {lastFrameWindow.blueTeam.totalKills}
                            </div>
                        </div>
                        <div className="red-team">
                            <div className="team-stats">
                                <InhibitorSVG/>
                                {lastFrameWindow.redTeam.inhibitors}
                            </div>
                            <div className="team-stats">
                                <BaronSVG/>
                                {lastFrameWindow.redTeam.barons}
                            </div>
                            <div className="team-stats">
                                <TowerSVG/>
                                {lastFrameWindow.redTeam.towers}
                            </div>
                            <div className="team-stats gold">
                                <GoldSVG/>
                                <span>
                                    {Number(lastFrameWindow.redTeam.totalGold).toLocaleString('en-us')}
                                </span>
                            </div>
                            <div className="team-stats">
                                <KillSVG/>
                                {lastFrameWindow.redTeam.totalKills}
                            </div>
                        </div>
                    </div>
                    <div className="live-game-stats-header-gold">
                        <div className="blue-team" style={{flex: goldPercentage.goldBluePercentage}}/>
                        <div className="red-team" style={{flex: goldPercentage.goldRedPercentage}}/>
                    </div>
                    <div className="live-game-stats-header-dragons">
                        <div className="blue-team">
                            {lastFrameWindow.blueTeam.dragons.map((dragon, i) => (
                                getDragonSVG(dragon, 'blue', i)
                            ))}
                        </div>
                        <div className="red-team">

                            {lastFrameWindow.redTeam.dragons.slice().reverse().map((dragon, i) => (
                                getDragonSVG(dragon, 'red', i)
                            ))}
                        </div>
                    </div>
                </div>
                <div className="status-live-game-card-table-wrapper">
                    <table className="status-live-game-card-table">
                        <thead>
                        <tr key={blueTeam.name.toUpperCase()}>
                            <th className="table-top-row-champion" title="champion/team">
                                <span>{blueTeam.name.toUpperCase()}</span>
                            </th>
                            <th className="table-top-row-vida" title="life">
                                <span>Health</span>
                            </th>
                            <th className="table-top-row-items" title="items">
                                <span>Items</span>
                            </th>
                            <th className="table-top-row" title="creep score">
                                <span>CS</span>
                            </th>
                            <th className="table-top-row player-stats-kda" title="kills">
                                <span>K</span>
                            </th>
                            <th className="table-top-row player-stats-kda" title="kills">
                                <span>D</span>
                            </th>
                            <th className="table-top-row player-stats-kda" title="kills">
                                <span>A</span>
                            </th>
                            <th className="table-top-row" title="gold">
                                <span>Gold</span>
                            </th>
                            <th className="table-top-row" title="gold difference">
                                <span>+/-</span>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {lastFrameWindow.blueTeam.participants.map((player: ParticipantWindow) => {
                            let goldDifference = getGoldDifference(player, "blue", gameMetadata, lastFrameWindow);

                            return (
                                <tr key={`${CHAMPIONS_URL}${gameMetadata.blueTeamMetadata.participantMetadata[player.participantId - 1].championId}`}>
                                    <th>
                                        <div className="player-champion-info">
                                            <img
                                                src={`${CHAMPIONS_URL}${gameMetadata.blueTeamMetadata.participantMetadata[player.participantId - 1].championId}.png`}
                                                className="player-champion"
                                                alt="imagem do campeao"/>
                                            <span className=" player-champion-info-level">{player.level}</span>
                                            <div className=" player-champion-info-name">
                                                <span>{gameMetadata.blueTeamMetadata.participantMetadata[player.participantId - 1].championId}</span>
                                                <span
                                                    className=" player-card-player-name">{gameMetadata.blueTeamMetadata.participantMetadata[player.participantId - 1].summonerName}</span>
                                            </div>
                                        </div>
                                    </th>
                                    <td>
                                        <MiniHealthBar currentHealth={player.currentHealth} maxHealth={player.maxHealth}/>
                                    </td>
                                    <td>
                                        <ItemsDisplay participantId={player.participantId - 1} lastFrame={lastFrameDetails}/>
                                    </td>
                                    <td>
                                        <div className=" player-stats">{player.creepScore}</div>
                                    </td>
                                    <td>
                                        <div className=" player-stats player-stats-kda">{player.kills}</div>
                                    </td>
                                    <td>
                                        <div className=" player-stats player-stats-kda">{player.deaths}</div>
                                    </td>
                                    <td>
                                        <div className=" player-stats player-stats-kda">{player.assists}</div>
                                    </td>
                                    <td>
                                        <div
                                            className=" player-stats">{Number(player.totalGold).toLocaleString('en-us')}</div>
                                    </td>
                                    <td>
                                        <div className={`player-stats player-gold-${goldDifference?.style}`}>{goldDifference.goldDifference}</div>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>

                    <table className="status-live-game-card-table">
                        <thead>
                        <tr key={redTeam.name.toUpperCase()}>
                            <th className="table-top-row-champion" title="champion/team">
                                <span>{redTeam.name.toUpperCase()}</span>
                            </th>
                            <th className="table-top-row-vida" title="life">
                                <span>Health</span>
                            </th>
                            <th className="table-top-row-items" title="items">
                                <span>Items</span>
                            </th>
                            <th className="table-top-row" title="creep score">
                                <span>CS</span>
                            </th>
                            <th className="table-top-row player-stats-kda" title="kills">
                                <span>K</span>
                            </th>
                            <th className="table-top-row player-stats-kda" title="kills">
                                <span>D</span>
                            </th>
                            <th className="table-top-row player-stats-kda" title="kills">
                                <span>A</span>
                            </th>
                            <th className="table-top-row" title="gold">
                                <span>Gold</span>
                            </th>
                            <th className="table-top-row" title="gold difference">
                                <span>+/-</span>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {lastFrameWindow.redTeam.participants.map((player) => {
                            let goldDifference = getGoldDifference(player, "red", gameMetadata, lastFrameWindow);

                            return(
                                <tr key={`${CHAMPIONS_URL}${gameMetadata.redTeamMetadata.participantMetadata[player.participantId - 6].championId}`}>
                                    <th>
                                        <div className="player-champion-info">
                                            <img
                                                src={`${CHAMPIONS_URL}${gameMetadata.redTeamMetadata.participantMetadata[player.participantId - 6].championId}.png`}
                                                className="player-champion"
                                                alt="imagem do campeao"/>
                                            <span className=" player-champion-info-level">{player.level}</span>
                                            <div className=" player-champion-info-name">
                                                <span>{gameMetadata.redTeamMetadata.participantMetadata[player.participantId - 6].championId}</span>
                                                <span className=" player-card-player-name">{gameMetadata.redTeamMetadata.participantMetadata[player.participantId - 6].summonerName}</span>
                                            </div>
                                        </div>
                                    </th>
                                    <td>
                                        <MiniHealthBar currentHealth={player.currentHealth} maxHealth={player.maxHealth}/>
                                    </td>
                                    <td>
                                        <ItemsDisplay participantId={player.participantId - 1} lastFrame={lastFrameDetails}/>
                                    </td>
                                    <td>
                                        <div className=" player-stats">{player.creepScore}</div>
                                    </td>
                                    <td>
                                        <div className=" player-stats player-stats-kda">{player.kills}</div>
                                    </td>
                                    <td>
                                        <div className=" player-stats player-stats-kda">{player.deaths}</div>
                                    </td>
                                    <td>
                                        <div className=" player-stats player-stats-kda">{player.assists}</div>
                                    </td>
                                    <td>
                                        <div className=" player-stats">{Number(player.totalGold).toLocaleString('en-us')}</div>
                                    </td>
                                    <td>
                                        <div className={`player-stats player-gold-${goldDifference?.style}`}>{goldDifference.goldDifference}</div>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
                <span className="footer-notes">
                    Patch Version: {gameMetadata.patchVersion}
                </span>
                {videoLink}
            </div>

            <LiveAPIWatcher gameMetadata={gameMetadata} lastFrameWindow={lastFrameWindow} blueTeam={blueTeam} redTeam={redTeam}/>
        </div>
    );
}

function getInGameTime(startTime: string, currentTime: string) {
    let startDate = new Date(startTime)
    let currentDate = new Date(currentTime)
    let seconds = Math.floor((currentDate.valueOf() - (startDate.valueOf()))/1000)
    let minutes = Math.floor(seconds/60);
    let hours = Math.floor(minutes/60);
    let days = Math.floor(hours/24);
    
    hours = hours-(days*24);
    minutes = minutes-(days*24*60)-(hours*60);
    seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
    let secondsString = seconds < 10 ? '0' + seconds : seconds

    return hours ? `${hours}:${minutes}:${secondsString}` : `${minutes}:${secondsString}`
}

function getGoldDifference(player: ParticipantWindow, side: string, gameMetadata: GameMetadata, frame: FrameWindow) {
    if(6 > player.participantId) { // blue side
        const redPlayer = frame.redTeam.participants[player.participantId - 1];
        const goldResult = player.totalGold - redPlayer.totalGold;

        return {
            style: goldResult > 0 ? "positive" : "negative",
            goldDifference: goldResult > 0 ? "+" + Number(goldResult).toLocaleString("en-us") : Number(goldResult).toLocaleString("en-us")
        };
    }else{
        const bluePlayer = frame.blueTeam.participants[player.participantId - 6];
        const goldResult = player.totalGold - bluePlayer.totalGold;

        return {
            style: goldResult > 0 ? "positive" : "negative",
            goldDifference: goldResult > 0 ? "+" + Number(goldResult).toLocaleString("en-us") : Number(goldResult).toLocaleString("en-us")
        };
    }
}

function getDragonSVG(dragonName: string, teamColor: string, index: number){
    let key = `${teamColor}_${index}_${dragonName}`
    switch (dragonName) {
        case "ocean": return <OceanDragonSVG className="dragon" key={key}/>;
        case "infernal": return <InfernalDragonSVG className="dragon" key={key}/>
        case "cloud": return <CloudDragonSVG className="dragon" key={key}/>
        case "mountain": return <MountainDragonSVG className="dragon" key={key}/>
        case "elder": return <ElderDragonSVG className="dragon" key={key}/>
    }
}

function getGoldPercentage(goldBlue: number, goldRed: number){
    const total = goldBlue + goldRed;
    return {
        goldBluePercentage: ((goldBlue/ 100) * total),
        goldRedPercentage: ((goldRed/ 100) * total),
    }
}

enum GameState {
    in_game = "in game",
    paused = "paused",
    finished = "match ended"
}