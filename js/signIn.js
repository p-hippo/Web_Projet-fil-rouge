

const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");

function readCredentials(){
    return{
        email: inputEmail.value.trim(),
        password: inputPassword.value,
    };
}

function validateCredentials(credentials){
    if (!credentials.email) 
        return "Veuillez saisir votre adresse courriel.";
    if (!credentials.password) 
        return "Veuillez saisir votre mot de passe.";
    return null;
}

function getValidCredentials() {
  const credentials = readCredentials();
  const validationError = validateCredentials(credentials);
  if (validationError) {
    console.log(validationError);
    return null;
  }
  return credentials;
}

document.querySelector(".btn-submit").addEventListener("click", async (event) => {
    event.preventDefault();

    const credentials = getValidCredentials();
    if(!credentials) return;
    const { error } = await Auth.signIn(credentials.email, credentials.password);
  if (error) {
    console.log(error);
  }
})

Auth.onSessionChange((event, session) => {
    if(session?.user){
        window.location.replace("index.html");
    }
});