const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const inputConfirmPassword = document.getElementById("confirm-password");


function readCredentials(){
    return{
        email: inputEmail.value.trim(),
        password: inputPassword.value,
        confirmPassword: inputConfirmPassword.value
    };
}

function validateCredentials(credentials){
    if (!credentials.email) 
        return "Veuillez saisir votre adresse courriel.";
    if (!credentials.password) 
        return "Veuillez saisir votre mot de passe.";
    if (credentials.password !== credentials.confirmPassword)
        return "Les deux mots de passe ne correspondent pas !";
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

document.querySelector(".btn-submit").addEventListener("click", async () => {
    event.preventDefault();
    const credentials = getValidCredentials();
    if(!credentials) return;

    const{error} = await Auth.signUp(credentials.email, credentials.password);
    if(error){
        console.log(error);
    } else{
        console.log("compte crée")
    }
});

Auth.onSessionChange((event, session) => {
    if(session?.user) {
        window.location.replace("connexion.html")
    }
});
