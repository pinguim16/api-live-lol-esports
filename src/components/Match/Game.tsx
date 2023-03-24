import './styles/playerStatusStyle.css'
import '../Schedule/styles/scheduleStyle.css'

import {GameDetails} from "./GameDetails"
import {MiniHealthBar} from "./MiniHealthBar";
import React, {useEffect, useState} from "react";
import {toast} from 'react-toastify';
import {DetailsFrame, EventDetails, GameMetadata, Item, Participant, Record, Result, TeamStats, WindowFrame, WindowParticipant } from "../types/baseTypes";

import {ReactComponent as TowerSVG} from '../../assets/images/tower.svg';
import {ReactComponent as BaronSVG} from '../../assets/images/baron.svg';
import {ReactComponent as KillSVG} from '../../assets/images/kill.svg';
import {ReactComponent as GoldSVG} from '../../assets/images/gold.svg';
import {ReactComponent as InhibitorSVG} from '../../assets/images/inhibitor.svg';
import { ReactComponent as TeamTBDSVG } from '../../assets/images/team-tbd.svg';

import {ReactComponent as OceanDragonSVG} from '../../assets/images/dragon-ocean.svg';
import {ReactComponent as ChemtechDragonSVG} from '../../assets/images/dragon-chemtech.svg';
import {ReactComponent as HextechDragonSVG} from '../../assets/images/dragon-hextech.svg';
import {ReactComponent as InfernalDragonSVG} from '../../assets/images/dragon-infernal.svg';
import {ReactComponent as CloudDragonSVG} from '../../assets/images/dragon-cloud.svg';
import {ReactComponent as MountainDragonSVG} from '../../assets/images/dragon-mountain.svg';
import {ReactComponent as ElderDragonSVG} from '../../assets/images/dragon-elder.svg';
import {ItemsDisplay} from "./ItemsDisplay";

import {LiveAPIWatcher} from "./LiveAPIWatcher";
import { CHAMPIONS_URL } from '../../utils/LoLEsportsAPI';

type Props = {
    firstWindowFrame: WindowFrame,
    lastWindowFrame: WindowFrame,
    lastDetailsFrame: DetailsFrame,
    gameIndex: number,
    gameMetadata: GameMetadata,
    eventDetails: EventDetails,
    videoLink: JSX.Element,
    records?: Record[],
    results?: Result[],
    items: Item[]
}

enum GameState {
    in_game = "in game",
    paused = "game paused",
    finished = "game ended"
}

export function Game({ firstWindowFrame, lastWindowFrame, lastDetailsFrame, gameMetadata, gameIndex, eventDetails, videoLink, records, results, items } : Props) {
    const [gameState, setGameState] = useState<GameState>(GameState[lastWindowFrame.gameState as keyof typeof GameState]);

    useEffect(() => {
        let currentGameState: GameState = GameState[lastWindowFrame.gameState as keyof typeof GameState]

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

        var playerStatsRows = Array.from($('.player-stats-row th'))
        var championStatsRows = Array.from($('.champion-stats-row span'))
        var chevrons = Array.from($('.player-stats-row .chevron-down'))
        playerStatsRows.forEach((playerStatsRow, index) => {
            $(playerStatsRow).prop("onclick", null).off("click");
            $(playerStatsRow).on('click', () => {
                $(championStatsRows[index]).slideToggle()
                $(chevrons[index]).toggleClass('rotated')
            })
        })

        var itemImages = Array.from($('.player-stats-item:not(.empty)'))
        var itemDescriptions = Array.from($('.itemDescription'))
        itemImages.forEach((itemImage, index) => {
            $(itemImage).off("mouseenter");
            $(itemImage).off("mouseleave");
            $(itemImage).on('mouseenter', () => {
                $(itemDescriptions[index]).show();
            })
            $(itemImage).on('mouseleave', () => {
                $(itemDescriptions[index]).hide();
            })

            $(itemImage).off("touchstart");
            $(itemImage).off("touchend");
            $(itemImage).on('touchstart', () => {
                $(itemDescriptions[index]).show();
            })
            $(itemImage).on('touchend', () => {
                $(itemDescriptions[index]).hide();
            })
        })
    }, [lastWindowFrame.gameState, gameState]);

    let blueTeam = eventDetails.match.teams[0];
    let redTeam = eventDetails.match.teams[1];

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

    const goldPercentage = getGoldPercentage(lastWindowFrame.blueTeam.totalGold, lastWindowFrame.redTeam.totalGold);
    let inGameTime = getInGameTime(firstWindowFrame.rfc460Timestamp, lastWindowFrame.rfc460Timestamp)
    document.title = `${blueTeam.name} VS ${redTeam.name}`;
    let matchResults = results || eventDetails.match.teams.map(team=> team.result)

    return (
        <div className="status-live-game-card">
            <GameDetails eventDetails={eventDetails} gameIndex={gameIndex}/>
            <div className="status-live-game-card-content">
                {/* {eventDetails ? (<h3>{eventDetails?.league.name}</h3>) : null} */}
                <div className="live-game-stats-header">
                    <div className="live-game-stats-header-team-images">
                        <div className="live-game-card-team">
                            {blueTeam.code === "TBD" ? (<TeamTBDSVG className="live-game-card-team-image" />) : (<img className="live-game-card-team-image" src={blueTeam.image} alt={blueTeam.name} />)}
                            <span>
                                <h4>
                                    {blueTeam.name}
                                </h4>
                            </span>
                        </div>
                        <h1>
                            <div className={`gamestate-bg-${gameState.split(` `).join(`-`)}`}>{gameState.toUpperCase()}</div>
                            <div>{inGameTime}</div>
                        </h1>
                        <div className="live-game-card-team">
                            {redTeam.code === "TBD" ? (<TeamTBDSVG className="live-game-card-team-image" />) : (<img className="live-game-card-team-image" src={redTeam.image} alt={redTeam.name} />)}
                            <span>
                                <h4>
                                    {redTeam.name}
                                </h4>
                            </span>
                        </div>
                    </div>
                    <div className="live-game-stats-header-status">
                        {HeaderStats(lastWindowFrame.blueTeam, 'blue-team')}
                        {HeaderStats(lastWindowFrame.redTeam, 'red-team')}
                    </div>
                    <div className="live-game-stats-header-gold">
                        <div className="blue-team" style={{flex: goldPercentage.goldBluePercentage}}/>
                        <div className="red-team" style={{flex: goldPercentage.goldRedPercentage}}/>
                    </div>
                    <div className="live-game-stats-header-dragons">
                        <div className="blue-team">
                            {lastWindowFrame.blueTeam.dragons.map((dragon, i) => (
                                getDragonSVG(dragon, 'blue', i)
                            ))}
                        </div>
                        <div className="red-team">

                            {lastWindowFrame.redTeam.dragons.slice().reverse().map((dragon, i) => (
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
                        {lastWindowFrame.blueTeam.participants.map((player: WindowParticipant, index) => {
                            let goldDifference = getGoldDifference(player, "blue", gameMetadata, lastWindowFrame);
                            let championDetails = lastDetailsFrame.participants[index]
                            return [(
                                <tr className="player-stats-row" key={`${gameIndex}_${CHAMPIONS_URL}${gameMetadata.blueTeamMetadata.participantMetadata[player.participantId - 1].championId}`}>
                                    <th>
                                        <div className="player-champion-info">
                                            <svg className="chevron-down" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 429.3l22.6-22.6 192-192L493.3 192 448 146.7l-22.6 22.6L256 338.7 86.6 169.4 64 146.7 18.7 192l22.6 22.6 192 192L256 429.3z"/></svg>
                                            <div className='player-champion-wrapper'>
                                                <img src={`${CHAMPIONS_URL}${gameMetadata.blueTeamMetadata.participantMetadata[player.participantId - 1].championId}.png`} className='player-champion' onError={({ currentTarget }) => { currentTarget.style.display = `none` }}/>
                                                <TeamTBDSVG className='player-champion' />
                                            </div>
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
                                        <ItemsDisplay participantId={player.participantId - 1} lastFrame={lastDetailsFrame} items={items}/>
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
                            ), (
                            <tr key={`${gameIndex}_${CHAMPIONS_URL}${gameMetadata.blueTeamMetadata.participantMetadata[player.participantId - 1].championId}_stats`} className='champion-stats-row'>
                                <td colSpan={9}>
                                    <span>
                                        {getFormattedChampionStats(championDetails)}
                                    </span>
                                </td>
                            </tr>
                            )]
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
                        {lastWindowFrame.redTeam.participants.map((player: WindowParticipant, index) => {
                            let goldDifference = getGoldDifference(player, "red", gameMetadata, lastWindowFrame);
                            let championDetails = lastDetailsFrame.participants[index + 5]

                            return [(
                                <tr className="player-stats-row" key={`${gameIndex}_${CHAMPIONS_URL}${gameMetadata.redTeamMetadata.participantMetadata[player.participantId - 6].championId}`}>
                                    <th>
                                        <div className="player-champion-info">
                                            <svg className="chevron-down" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 429.3l22.6-22.6 192-192L493.3 192 448 146.7l-22.6 22.6L256 338.7 86.6 169.4 64 146.7 18.7 192l22.6 22.6 192 192L256 429.3z"/></svg>
                                            <div className='player-champion-wrapper'>
                                                <img src={`${CHAMPIONS_URL}${gameMetadata.redTeamMetadata.participantMetadata[player.participantId - 6].championId}.png`} className='player-champion' onError={({ currentTarget }) => { currentTarget.style.display = `none` }}/>
                                                <TeamTBDSVG className='player-champion' />
                                            </div>
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
                                        <ItemsDisplay participantId={player.participantId - 1} lastFrame={lastDetailsFrame} items={items}/>
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
                            ), (
                                <tr key={`${gameIndex}_${CHAMPIONS_URL}${gameMetadata.redTeamMetadata.participantMetadata[player.participantId - 6].championId}_stats`} className='champion-stats-row'>
                                    <td colSpan={9}>
                                        <span>
                                            {getFormattedChampionStats(championDetails)}
                                        </span>
                                    </td>
                                </tr>
                                )]
                        })}
                        </tbody>
                    </table>
                </div>
                <span className="footer-notes">
                    <a target="_blank" href={`https://www.leagueoflegends.com/en-us/news/game-updates/patch-${gameMetadata.patchVersion.split(`.`).slice(0, 2).join(`-`)}-notes/`}>Patch Version: {gameMetadata.patchVersion}</a>
                </span>
                {videoLink}
            </div>
            <LiveAPIWatcher gameIndex={gameIndex} gameMetadata={gameMetadata} lastWindowFrame={lastWindowFrame} blueTeam={eventDetails.match.teams[0]} redTeam={eventDetails.match.teams[1]}/>
        </div>
    );
}

type TeamCardProps = {
    eventDetails: EventDetails,
    index: number,
    matchResults?: Result[],
    record?: Record,
}

function TeamCard({eventDetails, index, matchResults, record}: TeamCardProps) {
    return (
        <h1>
            <div className="live-game-card-team">
                <img className="live-game-card-team-image" src={eventDetails.match.teams[index].image}
                    alt={eventDetails?.match.teams[index].name}/>
                <span className='outcome'>
                    {matchResults ? (<p className={matchResults[index].outcome}>
                        {matchResults[index].outcome}
                    </p>) : null}
                </span>
                <span>
                    <h4>
                        {eventDetails.match.teams[index].name}
                    </h4>
                </span>
                {record ?
                    (<span>
                        <p>
                            {record.wins} - {record.losses}
                        </p>
                    </span>)
                : null}
            </div>
        </h1>
    )
}

function HeaderStats(teamStats: TeamStats, teamColor: string) {
    return (
        <div className={teamColor}>
            <div className="team-stats inhibitors">
                <InhibitorSVG/>
                {teamStats.inhibitors}
            </div>
            <div className="team-stats barons">
                <BaronSVG/>
                {teamStats.barons}
            </div>
            <div className="team-stats towers">
                <TowerSVG/>
                {teamStats.towers}
            </div>
            <div className="team-stats gold">
                <GoldSVG/>
                <span>
                    {Number(teamStats.totalGold).toLocaleString('en-us')}
                </span>
            </div>
            <div className="team-stats kills">
                <KillSVG/>
                {teamStats.totalKills}
            </div>
        </div>
    )
}

function getFormattedChampionStats(championDetails: Participant) {
    return (
        <div>
            <div className='footer-notes'>Attack Damage: {championDetails.attackDamage}</div>
            <div className='footer-notes'>Ability Power: {championDetails.abilityPower}</div>
            <div className='footer-notes'>Attack Speed: {championDetails.attackSpeed}</div>
            <div className='footer-notes'>Life Steal: {championDetails.lifeSteal}%</div>
            <div className='footer-notes'>Armor: {championDetails.armor}</div>
            <div className='footer-notes'>Magic Resistance: {championDetails.magicResistance}</div>
            <div className='footer-notes'>Wards Destroyed: {championDetails.wardsDestroyed}</div>
            <div className='footer-notes'>Wards Placed: {championDetails.wardsPlaced}</div>
            <div className='footer-notes'>Damage Share: {Math.round(championDetails.championDamageShare * 10000) / 100}%</div>
            <div className='footer-notes'>Kill Participation: {Math.round(championDetails.killParticipation * 10000) / 100}%</div>
            <div className='footer-notes'>Skill Order: {championDetails.abilities.join('->')}</div>
        </div>
    )
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

function getGoldDifference(player: WindowParticipant, side: string, gameMetadata: GameMetadata, frame: WindowFrame) {
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
        case "hextech": return <HextechDragonSVG className="dragon" key={key}/>;
        case "chemtech": return <ChemtechDragonSVG className="dragon" key={key}/>;
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