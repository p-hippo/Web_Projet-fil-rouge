const db =  supabaseClient;

const searchInput = document.getElementById('search-input');
const resultsTable = document.getElementById('results-table');
const resultsBody = document.getElementById('results-body');
const profileSection = document.getElementById('profile-section');

const profImg = document.getElementById('prof-img');
const profName = document.getElementById('prof-name');
const profBio = document.getElementById('prof-bio');
const profGames = document.getElementById('prof-games');

const addContactButton = document.getElementById('btn-add-contact');

let selectedProfileForChat = null;
let searchTimeout = null;

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    clearTimeout(searchTimeout);

    if (query.length === 0) {
        resultsTable.classList.add('hidden');
        resultsBody.innerHTML = '';
        return;
    }

    searchTimeout = setTimeout(async () => {
        const { data: users, error } = await db
            .from('Users')
            .select('id, name, bio, steam_id')
            .ilike('name', `%${query}%`);

        if (error) {
            console.error('Error fetching data:', error.message);
            return;
        }

        resultsBody.innerHTML = '';

        if (users && users.length > 0) {
            resultsTable.classList.remove('hidden');
            
            users.forEach(user => {
                const avatarSrc = user.steam_id
                    ? `${API_URL}/api/steam/avatar/${user.steam_id}`
                    : 'https://placehold.co/80x80/1e1f22/dbdee1?text=?';

                const row = document.createElement('tr');
                row.style.cursor = 'pointer';
                row.innerHTML = `
                    <td><img src="${avatarSrc}" alt="Avatar"/></td>
                    <td>${user.name}</td>
                `;
                
                row.addEventListener('click', () => displayProfile(user));
                resultsBody.appendChild(row);
            });
        } else {
            resultsTable.classList.add('hidden');
        }
    }, 250);
});

async function displayProfile(profile) {
    selectedProfileForChat = profile;

    if (profImg) {
        profImg.src = profile.steam_id
            ? `${API_URL}/api/steam/avatar/${profile.steam_id}`
            : 'https://placehold.co/80x80/1e1f22/dbdee1?text=?';
    }
    if (profName) profName.textContent = profile.name;
    if (profBio) profBio.textContent = profile.bio || 'Aucune description disponible.';
    
    if (profileSection) profileSection.classList.remove('hidden');

    if (profGames) {
        if (!profile.steam_id) {
            profGames.textContent = 'Steam Info: Indisponible';
        } else {
            profGames.textContent = 'Chargement du Top 10 Steam...';
            const data = await Data.fetchSteamGames(profile.steam_id);
            if (data.games && data.games.length > 0) {
                profGames.innerHTML = "<strong>Top 10 Steam :</strong><br>" +
                    data.games.map((g, i) => `${i + 1}. ${g.name} (${g.hours}h)`).join('<br>');
            } else {
                profGames.textContent = 'Steam Info: Profil privé ou aucun jeu';
            }
        }
    }
}

if (addContactButton) {
    addContactButton.addEventListener('click', async () => {
        if (!selectedProfileForChat) return;

        const { user: authUser, error: authError } = await Auth.getUser();
        if (authError || !authUser) {
            alert("Votre session a expiré. Veuillez vous reconnecter.");
            window.location.replace("./connexion.html");
            return;
        }

        const { data: currentUserProfile, error: profileError } = await db
            .from('Users')
            .select('id, name, steam_id')
            .eq('user_Id', authUser.id)
            .single();

        if (profileError || !currentUserProfile) {
            console.error("Could not fetch logged-in user details:", profileError);
            alert("Erreur de profil interne.");
            return;
        }

        if (currentUserProfile.id === selectedProfileForChat.id) {
            alert("Vous ne pouvez pas créer un salon avec vous-même !");
            return;
        }

        const generatedRoomName = `${currentUserProfile.name} & ${selectedProfileForChat.name}`;

        const { data: newSalon, error: salonError } = await db
            .from('Salon')
            .insert({ name: generatedRoomName })
            .select()
            .single();

        if (salonError) {
            console.error("Failed creating chat room container row:", salonError.message);
            alert("Impossible de créer le salon.");
            return;
        }

        Local.writeCurrentChannel(newSalon); 

        alert(`Salon "${generatedRoomName}" créé avec succès ! Redirection...`);
        
        window.location.href = "./index.html";
    });
}
