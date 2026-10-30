const salonRowContainer = document.getElementById("salon-row");
const messagesHistoryContainer = document.getElementById("chat-messages-box");
const messageInputField = document.getElementById("message-input");
const sendMessageButton = document.getElementById("send-btn");

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
    
    const senderName = message.Users?.name || "Profil Inconnu";
    pElement.innerHTML = `<strong>${senderName}:</strong> ${message.content}`;
    
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

async function init() {
    const { user } = await Auth.getUser();
    if (!user) {
        window.location.replace("./connexion.html");
        return;
    }
    currentUserUuid = user.id;

    const { data: profile, error: profileError } = await supabaseClient
        .from("Users")
        .select("id")
        .eq("user_Id", currentUserUuid)
        .single();

    if (profileError || !profile) {
        console.error("Error de profile introuvé:", profileError);
        return;
    }

    currentProfileId = profile.id;

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