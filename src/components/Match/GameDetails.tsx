import './styles/playerStatusStyle.css'
import '../Schedule/styles/scheduleStyle.css'

import { MiniHealthBar } from "./MiniHealthBar";
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { DetailsFrame, EventDetails, GameMetadata, Participant, Record, Result, TeamStats, WindowFrame, WindowParticipant } from "../types/baseTypes";

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
    eventDetails: EventDetails,
    gameIndex: number
}

enum GameState {
    in_game = "in game",
    paused = "paused",
    finished = "match ended"
}

export function GameDetails({ eventDetails, gameIndex }: Props) {
    useEffect(() => {

    }, []);

    return (
        (eventDetails.match.games.length > 1) ? (
            <div className='game-selector'>
                {eventDetails.match.games.map((game) => {
                    return <a className={`game-selector-item ${game.state} ${gameIndex == game.number ? `selected` : ``}`} href={`/live-lol-esports/#/live/${eventDetails.id}/game-index/${game.number}`} key={`game-selector-${game.id}`}>
                        <span className={`#/live/${game.state}`}>Game {game.number} - {game.state}</span>
                    </a>
                })}

            </div>) : null
    )
}