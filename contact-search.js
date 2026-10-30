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

searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();

    if (query.length === 0) {
        resultsTable.classList.add('hidden');
        resultsBody.innerHTML = '';
        return;
    }

    const { data: users, error } = await db
        .from('Users')
        .select('id, name, avatar_url, bio')
        .ilike('name', `%${query}%`);

    if (error) {
        console.error('Error fetching data:', error.message);
        return;
    }

    resultsBody.innerHTML = '';

    if (users && users.length > 0) {
        resultsTable.classList.remove('hidden');
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.innerHTML = `
                <td><img src="${user.avatar_url || 'https://placeholder.com'}" alt="Avatar"/></td>
                <td>${user.name}</td>
            `;
            
            row.addEventListener('click', () => displayProfile(user));
            resultsBody.appendChild(row);
        });
    } else {
        resultsTable.classList.add('hidden');
    }
});

function displayProfile(profile) {

    selectedProfileForChat = profile;

    if (profImg) profImg.src = profile.avatar_url || 'https://placehold.co';
    if (profName) profName.textContent = profile.name;
    if (profBio) profBio.textContent = profile.bio || 'Aucune description disponible.';
    
    if (profGames) profGames.textContent = 'Steam Info: Indisponible';
    
    if (profileSection) profileSection.classList.remove('hidden');
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
            .select('id, name')
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
