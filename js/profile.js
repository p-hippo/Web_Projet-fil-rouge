const inputProfileName = document.getElementById("profile-name");
const inputProfileBio  = document.getElementById("profile-bio");
const profileForm = document.getElementById("form-profile");

const linkSteamBtn = document.getElementById("btn-link-steam");
const steamStatusText = document.getElementById("steam-status");
let currentSteamId = null;

let currentUserUuid = null;
let profileRowExists = false;

if (linkSteamBtn) {
    linkSteamBtn.addEventListener("click", () => {
        window.location.href = `${API_URL}/auth/steam`;
    });
}

async function loadCurrentProfile() {
    const { user } = await Auth.getUser();
    
    if (!user) {
        window.location.replace("./connexion.html");
        return;
    }
    currentUserUuid = user.id;

    const { data: profile, error } = await supabaseClient
        .from("Users")
        .select("name, bio, steam_id")
        .eq("user_Id", currentUserUuid)
        .maybeSingle();
    if (error) {
        console.error("Erreur lors de la récupération du profil:", error.message);
        return;
    }

    if (profile) {
        profileRowExists = true;
        if (inputProfileName) inputProfileName.value = profile.name || "";
        if (inputProfileBio) inputProfileBio.value = profile.bio || "";
        currentSteamId = profile.steam_id || null;
    }

    const params = new URLSearchParams(window.location.search);
    const steamIdFromUrl = params.get("steamid");

    if (steamIdFromUrl) {
        currentSteamId = steamIdFromUrl;

        if (profileRowExists) {
            await supabaseClient
                .from("Users")
                .update({ steam_id: currentSteamId })
                .eq("user_Id", currentUserUuid);
        }

        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (steamStatusText && currentSteamId) {
        steamStatusText.textContent = "Compte Steam lié ✅ (ID : " + currentSteamId + ")";
    }
}

if (profileForm) {
    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nameValue = inputProfileName.value.trim();
        const bioValue  = inputProfileBio.value.trim();

        if (!nameValue) {
            alert("Veuillez saisir un nom d'affichage valide.");
            return;
        }

        let resultError = null;

        if (profileRowExists) {
            const { error } = await supabaseClient
                .from("Users")
                .update({
                    name: nameValue,
                    bio: bioValue,
                    steam_id: currentSteamId
                })
                .eq("user_Id", currentUserUuid);
            
            resultError = error;
        } else {
            const { error } = await supabaseClient
                .from("Users")
                .insert({
                    user_Id: currentUserUuid,
                    name: nameValue,
                    bio: bioValue,
                    steam_id: currentSteamId
                });

            resultError = error;
        }

        if (resultError) {
            console.error("Échec de la transaction de profil:", resultError.message);
            alert("Impossible d'enregistrer le profil: " + resultError.message);
        } else {
            alert("Profil enregistré avec succès !");
            window.location.href = "./index.html";
        }
    });
}

loadCurrentProfile();