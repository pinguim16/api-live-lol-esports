import React from "react";
import './styles/footerStyle.css'

import { ReactComponent as DiscordSVG } from '../../assets/images/discord.svg';
import { ReactComponent as GitHubLogoSVG } from '../../assets/images/github.svg';
import { ReactComponent as TwitterSVG } from '../../assets/images/twitter.svg';

export function Footer() {

    return (
        <nav className="footer-container">
            <a target="_blank" rel="noreferrer" href="https://github.com/AndyDanger/live-lol-esports">
                <GitHubLogoSVG className="footer-img" />
            </a>
            <a target="_blank" rel="noreferrer" href="https://twitter.com/andydangerzone">
                <TwitterSVG className="footer-img" />
            </a>
            <a target="_blank" rel="noreferrer" href="https://discord.com/users/183408194209579008">
                <DiscordSVG className="footer-img" />
            </a>
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4163525631983528" crossOrigin="anonymous"></script>
            <ins className="adsbygoogle"
                data-ad-client="ca-pub-4163525631983528"
                data-ad-slot="6000866139"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
            <script>
                (adsbygoogle = window.adsbygoogle || []).push({ });
            </script>
        </nav>
    );
}