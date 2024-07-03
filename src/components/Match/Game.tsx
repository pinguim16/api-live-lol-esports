import './styles/playerStatusStyle.css'
import '../Schedule/styles/scheduleStyle.css'

import { GameDetails } from "./GameDetails"
import { MiniHealthBar } from "./MiniHealthBar";
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { DetailsFrame, EventDetails, GameMetadata, Item, Outcome, Participant, Record, Result, TeamStats, WindowFrame, WindowParticipant, ExtendedVod, Rune, Slot, SlottedRune } from "../types/baseTypes";

import { ReactComponent as TowerSVG } from '../../assets/images/tower.svg';
import { ReactComponent as BaronSVG } from '../../assets/images/baron.svg';
import { ReactComponent as KillSVG } from '../../assets/images/kill.svg';
import { ReactComponent as GoldSVG } from '../../assets/images/gold.svg';
import { ReactComponent as InhibitorSVG } from '../../assets/images/inhibitor.svg';
import { ReactComponent as TeamTBDSVG } from '../../assets/images/team-tbd.svg';

import { ReactComponent as OceanDragonSVG } from '../../assets/images/dragon-ocean.svg';
import { ReactComponent as ChemtechDragonSVG } from '../../assets/images/dragon-chemtech.svg';
import { ReactComponent as HextechDragonSVG } from '../../assets/images/dragon-hextech.svg';
import { ReactComponent as InfernalDragonSVG } from '../../assets/images/dragon-infernal.svg';
import { ReactComponent as CloudDragonSVG } from '../../assets/images/dragon-cloud.svg';
import { ReactComponent as MountainDragonSVG } from '../../assets/images/dragon-mountain.svg';
import { ReactComponent as ElderDragonSVG } from '../../assets/images/dragon-elder.svg';
import { ItemsDisplay } from "./ItemsDisplay";

import { LiveAPIWatcher } from "./LiveAPIWatcher";
import { CHAMPIONS_URL, RUNES_JSON_URL, getDataDragonResponse, getFormattedPatchVersion } from '../../utils/LoLEsportsAPI';
import { TwitchEmbed, TwitchEmbedLayout } from 'twitch-player';
import { ChatToggler } from '../Navbar/ChatToggler';

type Props = {
    firstWindowFrame: WindowFrame,
    lastWindowFrame: WindowFrame,
    lastDetailsFrame: DetailsFrame,
    gameIndex: number,
    gameMetadata: GameMetadata,
    eventDetails: EventDetails,
    outcome: Array<Outcome>,
    records?: Record[],
    results?: Result[],
    items: Item[],
    runes: Rune[]
}

enum GameState {
    in_game = "trocação de soco rolando",
    paused = "jogo pausado",
    finished = "jogo finalizado"
}

export function Game({ firstWindowFrame, lastWindowFrame, lastDetailsFrame, gameMetadata, gameIndex, eventDetails, outcome, results, items, runes }: Props) {
    const [gameState, setGameState] = useState<GameState>(GameState[lastWindowFrame.gameState as keyof typeof GameState]);
    const [videoProvider, setVideoProvider] = useState<string>();
    const [videoParameter, setVideoParameter] = useState<string>();
    const chatData = localStorage.getItem("chat");
    const chatEnabled = chatData ? chatData === `unmute` : false

    useEffect(() => {
        let currentGameState: GameState = GameState[lastWindowFrame.gameState as keyof typeof GameState]
        let icon = currentGameState === GameState.finished ? "🔴" : currentGameState === GameState.paused ? "🟠" : "🟢"
        document.title = `${icon} ${eventDetails.league.name} - ${blueTeam.name} vs. ${redTeam.name}`;

        if (currentGameState !== gameState) {
            setGameState(currentGameState);

            if (currentGameState === GameState.in_game) {
                toast.success(`Jogo Retomado`, {
                    icon: "▶",
                    delay: 15000,
                    position: "top-right",
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    pauseOnFocusLoss: false,
                    draggable: true,
                    toastId: `gameStatus`,
                    theme: `colored`,
                })
            } else if (currentGameState === GameState.finished) {
                toast.error(`Jogo Finalizado`, {
                    delay: 15000,
                    position: "top-right",
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    pauseOnFocusLoss: false,
                    draggable: true,
                    toastId: `gameStatus`,
                    theme: `colored`,
                })
            } else {
                toast.warning(`Jogo Pausado`, {
                    delay: 15000,
                    position: "top-right",
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    pauseOnFocusLoss: false,
                    draggable: true,
                    toastId: `gameStatus`,
                    theme: `colored`,
                })
            }

        }

    }, [lastWindowFrame.gameState, gameState]);

    let blueTeam = eventDetails.match.teams[0];
    let redTeam = eventDetails.match.teams[1];

    const auxBlueTeam = blueTeam

    /*
        As vezes os times continuam errados mesmo apos verificar o ultimo frame,
        em ligas como TCL, por isso fazemos essa verificação pelo nome
    */
    const summonerName = gameMetadata.blueTeamMetadata.participantMetadata[0].summonerName.split(" ");

    if ((summonerName[0] && redTeam.code.startsWith(summonerName[0])) || gameMetadata.blueTeamMetadata.esportsTeamId !== blueTeam.id) { // Temos que verificar apenas os primeiros caracteres pois os times academy usam o A, a mais na tag mas não nos nomes
        blueTeam = redTeam;
        redTeam = auxBlueTeam;
    }

    const goldPercentage = getGoldPercentage(lastWindowFrame.blueTeam, lastWindowFrame.redTeam);
    let inGameTime = getInGameTime(firstWindowFrame.rfc460Timestamp, lastWindowFrame.rfc460Timestamp)
    const formattedPatchVersion = getFormattedPatchVersion(gameMetadata.patchVersion)
    const championsUrlWithPatchVersion = CHAMPIONS_URL.replace(`PATCH_VERSION`, formattedPatchVersion)

    let playerStatsRows = Array.from($('.player-stats-row th'))
    let championStatsRows = Array.from($('.champion-stats-row span'))
    let chevrons = Array.from($('.player-stats-row .chevron-down'))
    playerStatsRows.forEach((playerStatsRow, index) => {
        $(playerStatsRow).prop("onclick", null).off("click");
        $(playerStatsRow).on('click', () => {
            $(championStatsRows[index]).slideToggle()
            $(chevrons[index]).toggleClass('rotated')
        })
    })

    $(`.copy-champion-names`).prop("onclick", null).off("click");
    $(`.copy-champion-names`).on(`click`, () => {
        let championNames: Array<String> = []
        gameMetadata.blueTeamMetadata.participantMetadata.forEach(participant => {
            championNames.push(participant.championId)
        })

        gameMetadata.redTeamMetadata.participantMetadata.forEach(participant => {
            championNames.push(participant.championId)
        })
        navigator.clipboard.writeText(championNames.join("\t"));
    })

    $(`#streamDropdown`).prop("onchange", null).off("change");
    $(`#streamDropdown`).on(`change`, (e) => {
        let optionSelected = $("option:selected", e.target);

        setVideoParameter(optionSelected.attr(`data-parameter`) || videoParameter)
        setVideoProvider(optionSelected.attr(`data-provider`) || videoProvider)
        let videoPlayer = document.querySelector(`#video-player`)
        if (videoPlayer) {
            videoPlayer.removeAttribute(`added`)
        }

    })

    function capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const coStreamers: Array<ExtendedVod> = [
        {
            coStreamer: true,
            locale: `en-US`,
            offset: 0,
            parameter: `caedrel`,
            provider: `twitch`,
            mediaLocale: {
                englishName: `Caedrel`,
                translatedName: `Caedrel`,
                locale: `en-US`
            }
        },
        {
            coStreamer: true,
            locale: `en-US`,
            offset: 0,
            parameter: `doublelift`,
            provider: `twitch`,
            mediaLocale: {
                englishName: `Doublelift`,
                translatedName: `Doublelift`,
                locale: `en-US`
            }
        },
        {
            coStreamer: true,
            locale: `en-ES`,
            offset: 0,
            parameter: `ibai`,
            provider: `twitch`,
            mediaLocale: {
                englishName: `Ibai`,
                translatedName: `Ibai`,
                locale: `en-ES`
            }
        },
        {
            coStreamer: true,
            locale: `en-US`,
            offset: 0,
            parameter: `iwdominate`,
            provider: `twitch`,
            mediaLocale: {
                englishName: `IWillDominate`,
                translatedName: `IWillDominate`,
                locale: `en-US`
            }
        },
        {
            coStreamer: true,
            locale: `en-US`,
            offset: 0,
            parameter: `imls`,
            provider: `twitch`,
            mediaLocale: {
                englishName: `LS`,
                translatedName: `LS`,
                locale: `en-US`
            }
        },
        {
            coStreamer: true,
            locale: `en-US`,
            offset: 0,
            parameter: `yamatocannon`,
            provider: `twitch`,
            mediaLocale: {
                englishName: `YamatoCannon`,
                translatedName: `YamatoCannon`,
                locale: `en-US`
            }
        }]

    function getStreamDropdown(eventDetails: EventDetails) {
        const currentProvider = videoProvider
        const currentParameter = videoParameter
        let vods = eventDetails.match.games[gameIndex - 1].vods
        // if (vods.length) {
        //     return (<span className="footer-notes"><a href={getExtendedVodLink(vods[0])} target="_blank" rel="noreferrer">VOD Link</a></span>)
        // }

        if (!eventDetails.streams || !eventDetails.streams.length) {
            return (<span>No streams currently available</span>)
        }
        let streamsSortedByDelay = eventDetails.streams.sort((a, b) => b.coStreamer ? b.offset - a.offset : 1)
        coStreamers.forEach(streamer => {
            const foundStream = streamsSortedByDelay.find(stream => stream.parameter === streamer.parameter)
            if (!foundStream) {
                streamsSortedByDelay.push(streamer)
            }
        })
        let dropdown = streamsSortedByDelay.map(stream => {
            let streamOffset = Math.round(stream.offset / 1000 / 60 * -1)
            let delayString = streamOffset > 1 ? `~${streamOffset} minutes` : `<1 minute`
            let streamString = stream.coStreamer ? stream.mediaLocale.englishName : stream.provider === `twitch` ? `${capitalizeFirstLetter(stream.provider)}(${stream.locale}) - ${stream.parameter} - Delay: ${delayString}` : `${capitalizeFirstLetter(stream.provider)}(${stream.locale}) - Delay: ${delayString}`
            return <option value={stream.parameter} data-provider={stream.provider} data-parameter={stream.parameter}>{streamString}</option>
        })

        let videoPlayer = document.querySelector(`#video-player`)
        if (videoPlayer && !videoPlayer.hasAttribute(`added`)) {
            setVideoParameter(streamsSortedByDelay[0].parameter)
            setVideoProvider(streamsSortedByDelay[0].provider)
        }

        return (<select id="streamDropdown" className='footer-notes'>{dropdown}</select>)
    }

    function getVideoPlayer() {
        let videoPlayer = document.querySelector(`#video-player`)
        if (!videoParameter || !videoProvider) return
        if (videoPlayer && !videoPlayer.hasAttribute(`added`)) {
            videoPlayer.setAttribute(`added`, `true`)
            if (videoProvider === "youtube") {
                videoPlayer.innerHTML = `
                <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/${videoParameter}?autoplay=1"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded youtube"
                    </iframe>`

                if (chatEnabled) {
                    videoPlayer.innerHTML += `<iframe width="350px" height="500px" src="https://www.youtube.com/live\_chat?v=${videoParameter}" ></iframe>`
                }

            } else {
                videoPlayer.innerHTML = ``
                const embed = new TwitchEmbed(`video-player`, {
                    width: `100%`,
                    height: `100%`,
                    channel: videoParameter,
                    layout: chatEnabled ? TwitchEmbedLayout.VIDEO_WITH_CHAT : TwitchEmbedLayout.VIDEO,
                });
            }
        }
    }

    function getExtendedVodLink(extendedVod: ExtendedVod) {
        return extendedVod.provider === "youtube" ? `https://www.youtube.com/watch?v=${extendedVod.parameter}` : `https://www.twitch.tv/${extendedVod.parameter}`
    }

    return (
        <div className="status-live-game-card">
            <GameDetails eventDetails={eventDetails} gameIndex={gameIndex} />
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
                            <span className='outcome'>
                                {outcome ? (<p className={outcome[0].outcome}>
                                    {outcome[0].outcome}
                                </p>) : null}
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
                            <span className='outcome'>
                                {outcome ? (<p className={outcome[1].outcome}>
                                    {outcome[1].outcome}
                                </p>) : null}
                            </span>
                        </div>
                    </div>
                    <div className="live-game-stats-header-status">
                        {HeaderStats(lastWindowFrame.blueTeam, 'blue-team')}
                        {HeaderStats(lastWindowFrame.redTeam, 'red-team')}
                    </div>
                    <div className="live-game-stats">
                    <h2 className="stats-title">Estatísticas com base nos objetivos para vitória</h2>
                        <div className="live-game-stats-header-gold">
                            <div className="blue-team" style={{ flex: goldPercentage.bluePercentage }}><span>{(goldPercentage.bluePercentage)} %</span></div>
                            <div className="red-team" style={{ flex: goldPercentage.redPercentage }}><span>{(goldPercentage.redPercentage)} %</span></div>
                        </div>
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
                                    <span>Vida</span>
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
                                    <span>Ouro</span>
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
                                    <tr className="player-stats-row" key={`${gameIndex}_${championsUrlWithPatchVersion}${gameMetadata.blueTeamMetadata.participantMetadata[player.participantId - 1].championId}`}>
                                        <th>
                                            <div className="player-champion-info">
                                                <svg className="chevron-down" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 429.3l22.6-22.6 192-192L493.3 192 448 146.7l-22.6 22.6L256 338.7 86.6 169.4 64 146.7 18.7 192l22.6 22.6 192 192L256 429.3z" /></svg>
                                                <div className='player-champion-wrapper'>
                                                    <img src={`${championsUrlWithPatchVersion}${gameMetadata.blueTeamMetadata.participantMetadata[player.participantId - 1].championId}.png`} alt="" className='player-champion' onError={({ currentTarget }) => { currentTarget.style.display = `none` }} />
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
                                            <MiniHealthBar currentHealth={player.currentHealth} maxHealth={player.maxHealth} />
                                        </td>
                                        <td>
                                            <ItemsDisplay participantId={player.participantId - 1} lastFrame={lastDetailsFrame} items={items} patchVersion={formattedPatchVersion} />
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
                                    <tr key={`${gameIndex}_${championsUrlWithPatchVersion}${gameMetadata.blueTeamMetadata.participantMetadata[player.participantId - 1].championId}_stats`} className='champion-stats-row'>
                                        <td colSpan={9}>
                                            <span>
                                                {getFormattedChampionStats(championDetails, runes)}
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
                                    <span>Vida</span>
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
                                    <span>Ouro</span>
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
                                    <tr className="player-stats-row" key={`${gameIndex}_${championsUrlWithPatchVersion}${gameMetadata.redTeamMetadata.participantMetadata[player.participantId - 6].championId}`}>
                                        <th>
                                            <div className="player-champion-info">
                                                <svg className="chevron-down" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 429.3l22.6-22.6 192-192L493.3 192 448 146.7l-22.6 22.6L256 338.7 86.6 169.4 64 146.7 18.7 192l22.6 22.6 192 192L256 429.3z" /></svg>
                                                <div className='player-champion-wrapper'>
                                                    <img src={`${championsUrlWithPatchVersion}${gameMetadata.redTeamMetadata.participantMetadata[player.participantId - 6].championId}.png`} alt="" className='player-champion' onError={({ currentTarget }) => { currentTarget.style.display = `none` }} />
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
                                            <MiniHealthBar currentHealth={player.currentHealth} maxHealth={player.maxHealth} />
                                        </td>
                                        <td>
                                            <ItemsDisplay participantId={player.participantId - 1} lastFrame={lastDetailsFrame} items={items} patchVersion={formattedPatchVersion} />
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
                                    <tr key={`${gameIndex}_${championsUrlWithPatchVersion}${gameMetadata.redTeamMetadata.participantMetadata[player.participantId - 6].championId}_stats`} className='champion-stats-row'>
                                        <td colSpan={9}>
                                            <span>
                                                {getFormattedChampionStats(championDetails, runes)}
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
                <span className="footer-notes">
                    <a href="javascript:void(0);" className="copy-champion-names">
                        Copy Champion Names
                    </a>
                </span>
                {getStreamDropdown(eventDetails)}
                <div className='chatDiv'>
                    <span className='footer-notes'>Chat Enabled:</span>
                    <ChatToggler />
                </div>
                <div id="video-player" className={chatEnabled ? `chatEnabled` : ``}></div>
                {getVideoPlayer()}
            </div>
            <LiveAPIWatcher gameIndex={gameIndex} gameMetadata={gameMetadata} lastWindowFrame={lastWindowFrame} championsUrlWithPatchVersion={championsUrlWithPatchVersion} blueTeam={eventDetails.match.teams[0]} redTeam={eventDetails.match.teams[1]} />
        </div>
    );
}

function HeaderStats(teamStats: TeamStats, teamColor: string) {
    return (
        <div className={teamColor}>
            <div className="team-stats inhibitors">
                <InhibitorSVG />
                {teamStats.inhibitors}
            </div>
            <div className="team-stats barons">
                <BaronSVG />
                {teamStats.barons}
            </div>
            <div className="team-stats towers">
                <TowerSVG />
                {teamStats.towers}
            </div>
            <div className="team-stats gold">
                <GoldSVG />
                <span>
                    {Number(teamStats.totalGold).toLocaleString('en-us')}
                </span>
            </div>
            <div className="team-stats kills">
                <KillSVG />
                {teamStats.totalKills}
            </div>
        </div>
    )
}

function getFormattedChampionStats(championDetails: Participant, runes: Rune[]) {
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
            {getFormattedRunes(championDetails, runes)}
        </div>
    )
}

function getRuneUrlFromIcon(runes: Rune[], icon: string) {
    const perkImageUrl = `https://ddragon.leagueoflegends.com/cdn/img/PERK_ICON`
    return perkImageUrl.replace(`PERK_ICON`, icon)
}

function getSlottedRunes(runes: Rune[]): Array<SlottedRune> {
    const slottedRunes: Array<SlottedRune> = []
    runes.forEach(rune => {
        rune.slots.forEach(slot => {
            slot.runes.forEach(slottedRune => {
                slottedRunes.push(slottedRune)
            })
        })
    })
    return slottedRunes
}

function getRuneHTMLElement(slottedRune: SlottedRune) {
    return <div dangerouslySetInnerHTML={{ __html: slottedRune.longDesc }}></div>
}

function getFormattedRunes(championDetails: Participant, runes: Rune[]) {
    const slottedRunes = getSlottedRunes(runes)
    const mappedRunes = championDetails.perkMetadata.perks.map(perk => {
        return slottedRunes.find(slottedRune => slottedRune.id === perk)
    })
    if (!mappedRunes) return (<div className="StatsMatchupRunes"></div>)

    return (
        <div className="rune-list">
            {mappedRunes.map(mappedRune => {
                return mappedRune ?
                    (
                        <div className="rune">
                            <div>
                                <img className="image" src={getRuneUrlFromIcon(runes, mappedRune.icon)} alt="" />
                                <div className="name">{mappedRune.name}</div>
                            </div>
                            <div className="text">
                                <div className="description">{getRuneHTMLElement(mappedRune)}</div>
                            </div>
                        </div>) : null
            })}
        </div>
    )
}

function getInGameTime(startTime: string, currentTime: string) {
    let startDate = new Date(startTime)
    let currentDate = new Date(currentTime)
    let seconds = Math.floor((currentDate.valueOf() - (startDate.valueOf())) / 1000)
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    hours = hours - (days * 24);
    minutes = minutes - (days * 24 * 60) - (hours * 60);
    seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);
    let secondsString = seconds < 10 ? '0' + seconds : seconds

    return hours ? `${hours}:${minutes}:${secondsString}` : `${minutes}:${secondsString}`
}

function getGoldDifference(player: WindowParticipant, side: string, gameMetadata: GameMetadata, frame: WindowFrame) {
    if (6 > player.participantId) { // blue side
        const redPlayer = frame.redTeam.participants[player.participantId - 1];
        const goldResult = player.totalGold - redPlayer.totalGold;

        return {
            style: goldResult > 0 ? "positive" : "negative",
            goldDifference: goldResult > 0 ? "+" + Number(goldResult).toLocaleString("en-us") : Number(goldResult).toLocaleString("en-us")
        };
    } else {
        const bluePlayer = frame.blueTeam.participants[player.participantId - 6];
        const goldResult = player.totalGold - bluePlayer.totalGold;

        return {
            style: goldResult > 0 ? "positive" : "negative",
            goldDifference: goldResult > 0 ? "+" + Number(goldResult).toLocaleString("en-us") : Number(goldResult).toLocaleString("en-us")
        };
    }
}

function getDragonSVG(dragonName: string, teamColor: string, index: number) {
    let key = `${teamColor}_${index}_${dragonName}`
    switch (dragonName) {
        case "ocean": return <OceanDragonSVG className="dragon" key={key} />;
        case "hextech": return <HextechDragonSVG className="dragon" key={key} />;
        case "chemtech": return <ChemtechDragonSVG className="dragon" key={key} />;
        case "infernal": return <InfernalDragonSVG className="dragon" key={key} />
        case "cloud": return <CloudDragonSVG className="dragon" key={key} />
        case "mountain": return <MountainDragonSVG className="dragon" key={key} />
        case "elder": return <ElderDragonSVG className="dragon" key={key} />
    }
}

function getGoldPercentage(teamBlue: TeamStats, teamRed: TeamStats) {
   
    const totalGold = teamBlue.totalGold + teamRed.totalGold;
    var goldBluePercentage =  ((teamBlue.totalGold * 100) / totalGold);
    var goldRedPercentage = ((teamRed.totalGold * 100) / totalGold);

    var towerBluePercentage = (teamBlue.towers / 22) * 100;
    var towerRedPercentage = (teamRed.towers / 22) * 100;

    const baronsTotal = teamBlue.barons + teamRed.barons;
    var baronsPercentageBlue = teamBlue.barons != 0 ? (teamBlue.barons / baronsTotal) * 100 : 0; 
    var baronsPercentageRed = teamRed.barons != 0 ? (teamRed.barons / baronsTotal) * 100 : 0 

    const dragons = teamBlue.dragons.length + teamRed.dragons.length;
    var dragonsBlue = (teamBlue.dragons.length / dragons) * 100; 
    var dragonsRed = (teamRed.dragons.length / dragons) * 100; 

    const levelTotalBlue = (teamBlue.participants[0].level + teamBlue.participants[1].level + teamBlue.participants[2].level + teamBlue.participants[3].level + teamBlue.participants[4].level) / 5;
    const levelTotalRed = (teamRed.participants[0].level + teamRed.participants[1].level + teamRed.participants[2].level + teamRed.participants[3].level + teamRed.participants[4].level) / 5;

    var levelBlueMedia = (levelTotalBlue /18) * 100;
    var levelRedMedia = (levelTotalRed /18) * 100;
    
    const killsTotal = teamBlue.totalKills + teamRed.totalKills;
    var killPercentageBlue = (teamBlue.totalKills / killsTotal) * 100;
    var killPercentageRed = (teamRed.totalKills / killsTotal) * 100;

    var inibiBlue = (teamBlue.inhibitors/ 6) * 100;
    var inibiRed = (teamRed.inhibitors/ 6) * 100;

    var percentageBlue = (goldBluePercentage * 0.3) + (towerBluePercentage * 0.2) + (dragonsBlue * 0.15) + (baronsPercentageBlue * 0.1) + (levelBlueMedia * 0.1) 
    + (killPercentageBlue * 0.1) + (inibiBlue + 0.05) ;
    
    var percentageRed = (goldRedPercentage * 0.3) + (towerRedPercentage * 0.2) + (dragonsRed * 0.15) + (baronsPercentageRed * 0.1) + (levelRedMedia * 0.1) 
    + (killPercentageRed * 0.1) + (inibiRed + 0.05) ;

    var totalPercentage = percentageBlue + percentageRed;
    var probabilityBlue = (percentageBlue / totalPercentage) * 100;
    var probabilityRed = (percentageRed / totalPercentage) * 100;

    return {
        bluePercentage: probabilityBlue.toFixed(2),
        redPercentage: probabilityRed.toFixed(2),
    }
}