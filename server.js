require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 1. Redirection vers la page de connexion Steam
app.get('/auth/steam', (req, res) => {
    const params = new URLSearchParams({
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': `${BACKEND_URL}/auth/steam/return`,
        'openid.realm': BACKEND_URL,
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
    });
    res.redirect(`https://steamcommunity.com/openid/login?${params.toString()}`);
});

// 2. Retour de Steam et extraction du SteamID64
app.get('/auth/steam/return', async (req, res) => {
    try {
        const verifyParams = new URLSearchParams(req.query);
        verifyParams.set('openid.mode', 'check_authentication');

        const response = await fetch('https://steamcommunity.com/openid/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: verifyParams.toString()
        });

        const text = await response.text();
        if (text.includes('is_valid:true')) {
            const steamId64 = req.query['openid.claimed_id'].split('/').pop();
            return res.redirect(`${FRONTEND_URL}/profile.html?steamid=${steamId64}`);
        }
        res.status(401).send('Validation Steam échouée.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur.');
    }
});

// 3. Récupération du Top 10 des jeux les plus joués
app.get('/api/steam/top-games/:steamid', async (req, res) => {
    try {
        const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${req.params.steamid}&include_appinfo=1&include_played_free_games=1&format=json`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.response || !data.response.games) {
            return res.json({ games: [] });
        }

        const top10 = data.response.games
            .sort((a, b) => b.playtime_forever - a.playtime_forever)
            .slice(0, 10)
            .map(g => ({
                name: g.name,
                hours: Math.round((g.playtime_forever / 60) * 10) / 10
            }));

        res.json({ games: top10 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur API Steam' });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}/connexion.html`);
});