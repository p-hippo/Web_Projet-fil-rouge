const db = window.supabaseClient;

const searchInput = document.getElementById('search-input');
const resultsTable = document.getElementById('results-table');
const resultsBody = document.getElementById('results-body');
const profileSection = document.getElementById('profile-section');

const profImg = document.getElementById('prof-img');
const profName = document.getElementById('prof-name');
const profBio = document.getElementById('prof-bio');
const profGames = document.getElementById('prof-games');

searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();

    if (query.length === 0) {
        resultsTable.classList.add('hidden');
        resultsBody.innerHTML = '';
        return;
    }

    const { data: profiles, error } = await db
        .from('profiles')
        .select('id, name, avatar_url, bio, steam_games')
        .ilike('name', `%${query}%`);

    if (error) {
        console.error('Error fetching data:', error.message);
        return;
    }

    resultsBody.innerHTML = '';

    if (profiles && profiles.length > 0) {
        resultsTable.classList.remove('hidden');
        
        profiles.forEach(profile => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.innerHTML = `
                <td><img src="${profile.avatar_url || 'https://placeholder.com'}" alt="Avatar"/></td>
                <td>${profile.name}</td>
            `;
            
            row.addEventListener('click', () => displayProfile(profile));
            resultsBody.appendChild(row);
        });
    } else {
        resultsTable.classList.add('hidden');
    }
});

function displayProfile(profile) {
    profImg.src = profile.avatar_url || 'https://placeholder.com';
    profName.textContent = profile.name;
    profBio.textContent = profile.bio || 'Aucune description disponible.';
    profGames.textContent = `Steam Games: ${profile.steam_games || 'Aucun'}`;
    
    profileSection.classList.remove('hidden');
}
