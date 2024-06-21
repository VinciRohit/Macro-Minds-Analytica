///////////////////// Sign in modal
// Get the modal
var modal = document.getElementById("signInModal");
    
// Get the button that opens the modal
var btn = document.getElementById("signInBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
function DisplaySignInModal() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function signIn() {
    alert('Sign In function triggered');
    // Implement sign-in logic here
}

function signUp() {
    alert('Sign Up function triggered');
    // Implement sign-up logic here
}

///////////////////// Toggle SIgn up
function ToggleSignUp() {
    var title_signin = document.getElementById("title-signin");
    var title_signup = document.getElementById("title-signup");
    var toggle_signin = document.getElementById("toggle-signin");
    var toggle_signup = document.getElementById("toggle-signup");
    var _email = document.getElementById('email-text');
    var _password = document.getElementById('password-text');
    var _firstname = document.getElementById("firstname-text");
    var _lastname = document.getElementById("lastname-text");
    var button_signin = document.getElementById("signin-button");
    var button_signup = document.getElementById("signup-button");

    var login_form_reset = document.getElementById('login-form-reset')
    login_form_reset.click()
    
    title_signin.style.display='none';
    toggle_signin.style.display='none';
    button_signin.style.display='none';
    
    title_signup.style.display='block';
    toggle_signup.style.display='block';
    _firstname.style.display='block';
    _lastname.style.display='block';
    button_signup.style.display='block';

    _firstname.getElementsByTagName('input')[0].required = true;
    _lastname.getElementsByTagName('input')[0].required = true;

}

function ToggleSignIn() {
    var title_signin = document.getElementById("title-signin");
    var title_signup = document.getElementById("title-signup");
    var toggle_signin = document.getElementById("toggle-signin");
    var toggle_signup = document.getElementById("toggle-signup");
    var _email = document.getElementById('email-text');
    var _password = document.getElementById('password-text');
    var _firstname = document.getElementById("firstname-text");
    var _lastname = document.getElementById("lastname-text");
    var button_signin = document.getElementById("signin-button");
    var button_signup = document.getElementById("signup-button");

    var login_form_reset = document.getElementById('login-form-reset')
    login_form_reset.click()

    title_signin.style.display='block';
    toggle_signin.style.display='block';
    button_signin.style.display='block';
    
    title_signup.style.display='none';
    toggle_signup.style.display='none';
    _firstname.style.display='none';
    _lastname.style.display='none';
    button_signup.style.display='none';

    _firstname.getElementsByTagName('input')[0].required = false;
    _lastname.getElementsByTagName('input')[0].required = false;
}

///////////////////// Email
function handleEmailCredentialResponseSignUp() {
    var _email = document.getElementById('email-text').getElementsByTagName('input')[0];
    var _password = document.getElementById('password-text').getElementsByTagName('input')[0];
    var _firstname = document.getElementById("firstname-text").getElementsByTagName('input')[0];
    var _lastname = document.getElementById("lastname-text").getElementsByTagName('input')[0];

    if (_email.validity.valid && _password.validity.valid) {
        fetch(`${configSettings[environment]['python']['pythonApiUrl']}/credentials/emailtokensignup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: _email.value, password: _password.value, firstname: _firstname.value, lastname: _lastname.value })
        }).then(response => response.json())
          .then(data => {
              console.log('User information:', data);
          });
          var login_form_reset = document.getElementById('login-form-reset')
          login_form_reset.click()

          var modal = document.getElementById("signInModal");
          modal.style.display = "none";
         
          SignIn();
        }
}

function handleEmailCredentialResponse() {
    var _email = document.getElementById('email-text').getElementsByTagName('input')[0];
    var _password = document.getElementById('password-text').getElementsByTagName('input')[0];

    if (_email.validity.valid && _password.validity.valid) {
        fetch(`${configSettings[environment]['python']['pythonApiUrl']}/credentials/emailtokensignin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: _email.value, password: _password.value })
        }).then(response => response.json())
          .then(data => {
              console.log('User information:', data);
              if(data['error']) {
                var errormessagecontainer = document.getElementById("error-message-loginerror");
                var errormessage = errormessagecontainer.getElementsByTagName('span')[0];
                errormessage.textContent = data['error'];
                errormessagecontainer.style.display = "block";
                errormessage.style.display = "block";
              } else {
                var login_form_reset = document.getElementById('login-form-reset')
                login_form_reset.click()

                var modal = document.getElementById("signInModal");
                modal.style.display = "none";

                SignIn();
              }
          });
    
          
    }
}

///////////////////// Google
function handleGoogleCredentialResponse(response) {
    console.log('Encoded JWT ID token: ' + response.credential);
    // Send the token to your server for further processing.
    fetch(`${configSettings[environment]['python']['pythonApiUrl']}/credentials/googletokensignin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: response.credential })
    }).then(response => response.json())
      .then(data => {
          console.log('User information:', data);
      });

      var modal = document.getElementById("signInModal");
      modal.style.display = "none";

      SignIn();
}

window.onload = function() {
    google.accounts.id.initialize({
        client_id: '664272806449-gtrhu7pdn3i10f4eeduao8r66lmn6lkn.apps.googleusercontent.com',
        callback: handleGoogleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementsByClassName('g_id_signin')[0],
        { theme: 'outline', size: 'large' }  // customization attributes
    );
    google.accounts.id.prompt();  // Display the One Tap prompt
};


/////////////////////// Sign In / Sign Out
function SignIn() {
    var about = document.getElementById("tablinks-about");
    about.style.display = "none";

    var about = document.getElementById("tablinks-analysis-dashboard");
    about.style.display = "block";
}

function SignOut() {
    var about = document.getElementById("tablinks-about");
    about.style.display = "block";

    var about = document.getElementById("tablinks-analysis-dashboard");
    about.style.display = "none";
}


