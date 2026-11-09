const steamShareButton = document.getElementById("steam-share-btn");
let currentSteamId = null;

const salonRowContainer = document.getElementById("salon-row");
const messagesHistoryContainer = document.getElementById("chat-messages-box");
const messageInputField = document.getElementById("message-input");
const sendMessageButton = document.getElementById("send-btn");
const logoutButton = document.getElementById("logout-btn");

let activeSalonId = null;
let currentProfileId = null;
let currentUserUuid = null;
let unsubscribeMessages = null;


async function loadSalons() {
    const {data: salons, error} = await Data.fetchChannel();
    if(error){
        console.log("cant load salon", error);
        return;
    }

    salonRowContainer.replaceChildren();

    const contactTd = document.createElement("td");
    contactTd.className = "chatCircle";
    const contactLink = document.createElement("a");
    contactLink.href = "contact.html";
    contactLink.textContent = "+";
    contactTd.appendChild(contactLink);
    salonRowContainer.appendChild(contactTd);

    salons.forEach(salon => {
        displaySalon(salon)
    });
}

function displaySalon(salon){
    const tdElement = document.createElement("td");
    const pElement = document.createElement("p")

    pElement.className = "salon-item";
    pElement.textContent = "# " + salon.name;
    pElement.style.cursor = "pointer";

    pElement.addEventListener("click", async () => selectSalon(pElement, salon));

    tdElement.appendChild(pElement);
    salonRowContainer.appendChild(tdElement);
}

async function selectSalon(pElement, salon){
    activeSalonId = salon;

    Local.writeCurrentChannel(activeSalonId);
    
    unsubscribeMessages?.();
    unsubscribeMessages = Data.subscribeToMessages(activeSalonId.id, appendMessage)
    await loadMessages();
}

async function loadMessages(){
    if (!activeSalonId) return;
    
    const { data: messages, error } = await Data.fetchMessages(activeSalonId.id)
    if (error) {
        console.error("Impossible de charger les messages.", error);
        return;
    }

    messagesHistoryContainer.replaceChildren();

    messages.reverse().forEach(message => {
        displayMessage(message);
    });
    scrollMessages();
}

function appendMessage(message) {
    displayMessage(message);
    scrollMessages();
}

function displayMessage(message) {
    const pElement = document.createElement("p");
    const strongElement = document.createElement("strong");
    
    const senderName = message.Users?.name || "Profil Inconnu";
    strongElement.textContent = `${senderName}: `;
    
    pElement.appendChild(strongElement);
    pElement.appendChild(document.createTextNode(message.content));
    
    messagesHistoryContainer.appendChild(pElement);
}

function scrollMessages() {
    messagesHistoryContainer.scrollTop = messagesHistoryContainer.scrollHeight;
}

async function sendChat() {
    const content = messageInputField.value.trim();
    if (!content || !activeSalonId || !currentProfileId) return;

    const { error } = await Data.sendMessage(
        activeSalonId.id,
        content,
        currentProfileId
    );
    
    if (error) {
        console.error("Error d'envoie", error.code, error.message);
        return;
    }
    messageInputField.value = "";
}

if (sendMessageButton) {
    sendMessageButton.addEventListener("click", (e) => {
        e.preventDefault();
        sendChat();
    });
}

if (steamShareButton) {
    steamShareButton.addEventListener("click", async (e) => {
        e.preventDefault();
        if (!activeSalonId || !currentProfileId) return;
        if (!currentSteamId) {
            alert("Associez d'abord votre compte Steam dans les paramètres du profil !");
            return;
        }

        const data = await Data.fetchSteamGames(currentSteamId);
        if (!data.games || data.games.length === 0) {
            alert("Aucun jeu public trouvé sur votre profil Steam.");
            return;
        }

        const messageContent = "Mon Top 10 Steam :\n" + 
            data.games.map((g, i) => `${i + 1}. ${g.name} (${g.hours}h)`).join("\n");

        await Data.sendMessage(activeSalonId.id, messageContent, currentProfileId);
    });
}

if (messageInputField) {
    messageInputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendChat();
        }
    });
}

Auth.onSessionEnded(() => {
    Local.clearSession();
    window.location.replace("./connexion.html");
});

if (logoutButton) {
    logoutButton.addEventListener("click", async (event) => {
        event.preventDefault();
        
        const { error } = await Auth.signOut();
        
        if (error) {
            console.error("Erreur lors de la déconnexion :", error.message);
            alert("Impossible de se déconnecter.");
        } else {
            Local.clearSession();
            window.location.replace("./connexion.html");
        }
    });
}

async function init() {
    const { user } = await Auth.getUser();
    if (!user) {
        window.location.replace("./connexion.html");
        return;
    }
    currentUserUuid = user.id;

    const { data: profile, error: profileError } = await supabaseClient
        .from("Users")
        .select("id, steam_id")
        .eq("user_Id", currentUserUuid)
        .single();

    if (profileError || !profile) {
        console.error("Error de profile introuvé:", profileError);
        return;
    }

    currentProfileId = profile.id;
    currentSteamId = profile.steam_id;

    await loadSalons();
    
    Data.subscribeToChannels(() => loadSalons());

    let savedChannelState = Local.readCurrentChannel();
    if (savedChannelState) {
        activeSalonId = savedChannelState;
        unsubscribeMessages?.();
        unsubscribeMessages = Data.subscribeToMessages(activeSalonId.id, appendMessage);
        await loadMessages();
    }
}

init();