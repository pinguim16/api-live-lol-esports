import './styles/playerStatusStyle.css'

import {GameMetadata, Team, WindowFrame, WindowParticipant } from "../types/baseTypes";

import React, {useEffect, useState} from "react";
import {ToastContainer, toast} from 'react-toastify';
import useSound from "use-sound";

const firstblood = require("../../assets/audios/first_blood.ogg");
const kill = require("../../assets/audios/champion_slain.ogg");
const tower_blue = require("../../assets/audios/blue_turret_destroyed.ogg");
const tower_red = require("../../assets/audios/red_turret_destroyed.ogg");
const dragon_blue = require("../../assets/audios/blue_dragon_slain.ogg");
const dragon_red = require("../../assets/audios/red_dragon_slain.ogg");
const baron_blue = require("../../assets/audios/blue_baron_slain.ogg");
const baron_red = require("../../assets/audios/red_baron_slain.ogg");
const inib_blue = require("../../assets/audios/blue_inhibitor_destroyed.ogg");
const inib_red = require("../../assets/audios/red_inhibitor_destroyed.ogg");

type Props = {
    lastWindowFrame: WindowFrame,
    gameMetadata: GameMetadata,
    blueTeam: Team,
    redTeam: Team,
}

type StatusWatcher = {
    inhibitors: {
        blue: number,
        red: number
    }
    dragons: {
        blue: number,
        red: number
    }
    towers: {
        blue: number,
        red: number
    }
    barons: {
        blue: number,
        red: number
    }
    participants: {
        blue: WindowParticipant[]
        red: WindowParticipant[]
    }
}

export function LiveAPIWatcher({ lastWindowFrame, gameMetadata, blueTeam, redTeam } : Props) {
    const [status, setStatus] = useState<StatusWatcher>({
        dragons: {blue: lastWindowFrame.blueTeam.dragons.length, red: lastWindowFrame.redTeam.dragons.length},
        inhibitors: {blue: lastWindowFrame.blueTeam.inhibitors, red: lastWindowFrame.redTeam.inhibitors},
        towers: {blue: lastWindowFrame.blueTeam.towers, red: lastWindowFrame.redTeam.towers},
        barons: {blue: lastWindowFrame.blueTeam.barons, red: lastWindowFrame.redTeam.barons},
        participants: {blue: lastWindowFrame.blueTeam.participants, red: lastWindowFrame.redTeam.participants}
    })

    const [firstBloodPlay] = useSound(firstblood);

    useEffect(() => {
        const soundData = localStorage.getItem("sound");
        let isMuted = false;
        if(soundData) {
            if (soundData === "mute") {
                isMuted = true;
            }else if(soundData === "unmute"){
                isMuted = false;
            }
        }

        // Topo = prioridade para o som
        let isPlaying = isMuted;

        if(status.inhibitors.blue !== lastWindowFrame.blueTeam.inhibitors){
            createToast(true, isPlaying, inib_red.default, "Destroyed an inhibitor", blueTeam.image);
            isPlaying = true
        }

        if(status.inhibitors.red !== lastWindowFrame.redTeam.inhibitors){
            createToast(false, isPlaying, inib_blue.default, "Destroyed an inhibitor", redTeam.image);
            isPlaying = true
        }

        if(status.barons.blue !== lastWindowFrame.blueTeam.barons){
            createToast(true, isPlaying, baron_blue.default, "Defeated the baron", blueTeam.image);
            isPlaying = true
        }

        if(status.barons.red !== lastWindowFrame.redTeam.barons){
            createToast(false, isPlaying, baron_red.default, "Defeated the baron", redTeam.image);
            isPlaying = true
        }

        if(status.dragons.blue !== lastWindowFrame.blueTeam.dragons.length){
            createToast(true, isPlaying, dragon_blue.default, "Defeated the dragon", blueTeam.image);
            isPlaying = true
        }

        if(status.dragons.red !== lastWindowFrame.redTeam.dragons.length){
            createToast(false, isPlaying, dragon_red.default, "Defeated the dragon", redTeam.image);
            isPlaying = true
        }

        if(status.towers.blue !== lastWindowFrame.blueTeam.towers){
            createToast(true, isPlaying, tower_red.default, "Destroyed a turret", blueTeam.image);
            isPlaying = true
        }

        if(status.towers.red !== lastWindowFrame.redTeam.towers){
            createToast(false, isPlaying, tower_blue.default, "Destroyed a turret", redTeam.image);
            isPlaying = true
        }

        for (let i = 0; i < status.participants.blue.length; i++) {
            if(status.participants.blue[i].kills !== lastWindowFrame.blueTeam.participants[i].kills){
                createToast(true, isPlaying, kill.default, "Killed an enemy", `http://ddragon.leagueoflegends.com/cdn/11.4.1/img/champion/${gameMetadata.blueTeamMetadata.participantMetadata[status.participants.blue[i].participantId - 1].championId}.png`)
                isPlaying = true
            }
        }

        for (let i = 0; i < status.participants.red.length; i++) {
            if(status.participants.red[i].kills !== lastWindowFrame.redTeam.participants[i].kills){
                createToast(false, isPlaying, kill.default, "Killed an enemy", `http://ddragon.leagueoflegends.com/cdn/11.4.1/img/champion/${gameMetadata.redTeamMetadata.participantMetadata[status.participants.red[i].participantId - 6].championId}.png`)
                isPlaying = true
            }
        }

        setStatus({
            dragons: {blue: lastWindowFrame.blueTeam.dragons.length, red: lastWindowFrame.redTeam.dragons.length},
            inhibitors: {blue: lastWindowFrame.blueTeam.inhibitors, red: lastWindowFrame.redTeam.inhibitors},
            towers: {blue: lastWindowFrame.blueTeam.towers, red: lastWindowFrame.redTeam.towers},
            barons: {blue: lastWindowFrame.blueTeam.barons, red: lastWindowFrame.redTeam.barons},
            participants: {blue: lastWindowFrame.blueTeam.participants, red: lastWindowFrame.redTeam.participants},
        })
    }, [lastWindowFrame.blueTeam.totalKills, lastWindowFrame.blueTeam.dragons.length, lastWindowFrame.blueTeam.inhibitors, lastWindowFrame.redTeam.totalKills, lastWindowFrame.redTeam.dragons.length, lastWindowFrame.redTeam.inhibitors, firstBloodPlay, status.dragons.blue, status.dragons.red, status.barons.blue, status.barons.red, status.inhibitors.blue, status.inhibitors.red, status.towers.blue, status.towers.red, status.participants.blue, status.participants.red, lastWindowFrame.blueTeam.barons, lastWindowFrame.blueTeam.towers, lastWindowFrame.blueTeam.participants, lastWindowFrame.redTeam.barons, lastWindowFrame.redTeam.towers, lastWindowFrame.redTeam.participants, gameMetadata.blueTeamMetadata.participantMetadata, gameMetadata.redTeamMetadata.participantMetadata, blueTeam.image, redTeam.image]);

    return (
        <ToastContainer/>
    );
}

function createToast(blueTeam: boolean, soundIsPlaying: boolean, sound: string, message: string, image: string) {
    if(!soundIsPlaying) {
        let audio = new Audio(sound);
        audio.load();
        audio.volume = 0.20;
        audio.play();
    }

    if(blueTeam){
        toast.info(
            <div className="toast-watcher">
                <div className="toast-image">
                    <img src={image} alt="blue team"/>
                </div>
                <h4 style={{color: "#FFF"}}>{message}</h4>
            </div>
            , {
                pauseOnFocusLoss: false,
                position: toast.POSITION.TOP_LEFT
            }
        )
    }else{
        toast.error(
            <div className="toast-watcher">
                <img className="toast-image" src={image} alt="red team"/>
                <h4 style={{color: "#FFF"}}>{message}</h4>
            </div>
            , {
                pauseOnFocusLoss: false,
                position: toast.POSITION.TOP_RIGHT
            }
        )
    }
}