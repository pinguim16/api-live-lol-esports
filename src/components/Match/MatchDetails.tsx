import './styles/playerStatusStyle.css'
import '../Schedule/styles/scheduleStyle.css'

import { MiniHealthBar } from "./MiniHealthBar";
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { DetailsFrame, EventDetails, GameMetadata, Participant, Record, Result, ScheduleEvent, TeamStats, WindowFrame, WindowParticipant } from "../types/baseTypes";

import { ReactComponent as TowerSVG } from '../../assets/images/tower.svg';
import { ReactComponent as BaronSVG } from '../../assets/images/baron.svg';
import { ReactComponent as KillSVG } from '../../assets/images/kill.svg';
import { ReactComponent as GoldSVG } from '../../assets/images/gold.svg';
import { ReactComponent as InhibitorSVG } from '../../assets/images/inhibitor.svg';

import { ReactComponent as OceanDragonSVG } from '../../assets/images/dragon-ocean.svg';
import { ReactComponent as InfernalDragonSVG } from '../../assets/images/dragon-infernal.svg';
import { ReactComponent as CloudDragonSVG } from '../../assets/images/dragon-cloud.svg';
import { ReactComponent as MountainDragonSVG } from '../../assets/images/dragon-mountain.svg';
import { ReactComponent as ElderDragonSVG } from '../../assets/images/dragon-elder.svg';
import { ItemsDisplay } from "./ItemsDisplay";

import { Helmet } from "react-helmet";
import { LiveAPIWatcher } from "./LiveAPIWatcher";
import { CHAMPIONS_URL } from '../../utils/LoLEsportsAPI';

type Props = {
    gameMetadata: GameMetadata,
    eventDetails: EventDetails,
    records?: Record[],
    results?: Result[],
    scheduleEvent: ScheduleEvent
}

enum GameState {
    in_game = "in game",
    paused = "paused",
    finished = "match ended"
}

export function MatchDetails({ gameMetadata, eventDetails, records, results, scheduleEvent }: Props) {

    useEffect(() => {

    }, []);

    let blueTeam = eventDetails.match.teams[0];
    let redTeam = eventDetails.match.teams[1];

    const auxBlueTeam = blueTeam

    /*
        As vezes os times continuam errados mesmo apos verificar o ultimo frame,
        em ligas como TCL, por isso fazemos essa verificação pelo nome
    */
    const summonerName = gameMetadata.blueTeamMetadata.participantMetadata[0].summonerName.split(" ");

    if (redTeam.code.startsWith(summonerName[0])) { // Temos que verificar apenas os primeiros caracteres pois os times academy usam o A, a mais na tag mas não nos nomes
        blueTeam = redTeam;
        redTeam = auxBlueTeam;
    }

    let matchResults = results || eventDetails.match.teams.map(team => team.result)

    return (
        <div className="">
            <div className="status-live-game-card-content">
                {eventDetails ? (<h3>{eventDetails.league.name} - {scheduleEvent.blockName}  - Best of {eventDetails.match.strategy.count}</h3>) : null}
                <h3>{new Date(scheduleEvent.startTime).toLocaleTimeString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</h3>
                <div className="live-game-stats-header">
                    <div className="live-game-stats-header-team-images">
                        {TeamCard({ eventDetails, index: 0, matchResults, record: records ? records[0] : undefined })}
                        <h1>
                            <div>Match {formatMatchState(eventDetails, scheduleEvent)}</div>
                            {matchResults ? (<div>{matchResults[0].gameWins}-{matchResults[1].gameWins}</div>) : null}
                            VS
                        </h1>
                        {TeamCard({ eventDetails, index: 1, matchResults, record: records ? records[1] : undefined })}
                    </div>
                </div>
            </div>
        </div>
    );
}

type TeamCardProps = {
    eventDetails: EventDetails,
    index: number,
    matchResults?: Result[],
    record?: Record,
}

function formatMatchState(eventDetails: EventDetails, scheduleEvent: ScheduleEvent): string {
    let gamesFinished = eventDetails.match.games.filter(game => game.state == `completed` || game.state == `unneeded`)
    return gamesFinished.length >= eventDetails.match.games.length ? `completed` : scheduleEvent.state
}

function TeamCard({ eventDetails, index, matchResults, record }: TeamCardProps) {
    return (
        <h1>
            <div className="live-game-card-team">
                <img className="live-game-card-team-image" src={eventDetails.match.teams[index].image}
                    alt={eventDetails?.match.teams[index].name} />
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