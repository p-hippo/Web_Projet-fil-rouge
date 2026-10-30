

const inputProfileName = document.getElementById("profile-name");
const inputProfileBio  = document.getElementById("profile-bio");
const profileForm = document.getElementById("form-profile");

let currentUserUuid = null;
let profileRowExists = false;

async function loadCurrentProfile() {
    const { user } = await Auth.getUser();
    
    if (!user) {
        window.location.replace("./connexion.html");
        return;
    }
    currentUserUuid = user.id;

    const { data: profile, error } = await supabaseClient
        .from("Users")
        .select("name, bio")
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
                    bio: bioValue
                })
                .eq("user_Id", currentUserUuid);
            
            resultError = error;
        } else {
            const { error } = await supabaseClient
                .from("Users")
                .insert({
                    user_Id: currentUserUuid,
                    name: nameValue,
                    bio: bioValue
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