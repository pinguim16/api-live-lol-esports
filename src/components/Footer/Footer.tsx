import React from "react";
import './styles/footerStyle.css'

import {ReactComponent as GitHubLogoSVG} from '../../assets/images/github.svg';

export function Footer() {

    return (
        <nav className="footer-container">
            <a target="_blank" rel="noreferrer" href="https://github.com/AndyDanger/live-lol-esports">
                <GitHubLogoSVG className="footer-img"/>
            </a>
        </nav>
    );
}