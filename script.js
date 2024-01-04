document.getElementById('subscribeButton').addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById('subscribeForm').style.display = 'block';
    document.getElementById('thankYouMessage').style.display = 'none';
    document.getElementById('ErrorMessage').style.display = 'none';
});

document.getElementById('emailForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Get the email input value
    const emailInput = document.getElementById('email');
    const email = emailInput.value;

    // Get the email input value
    const commentsInput = document.getElementById('comments');
    const comments = commentsInput.value;

    // Call a function to send the email to Google Forms (replace the URL with your Google Forms URL)
    submitToGoogleScript(email, comments);

    // // Display the thank-you message
    // document.getElementById('thankYouMessage').style.display = 'block';

    // Hide the form after submission
    document.getElementById('subscribeForm').style.display = 'none';
});

function submitToGoogleScript(email, comments) {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbz54IUDuYTIsKHgt_Efj_A69BxpuJfgYbFY6fpMkun9_w3ok9YrjJRTn4hUmXTOtKvQ/exec'; // Replace with the URL you copied
  
    fetch(scriptURL, {
      method: 'POST',
      body: `email=${encodeURIComponent(email)}&comments=${encodeURIComponent(comments)}`,
      mode: 'no-cors', // Important: Use 'no-cors' mode for Google Forms
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then(response => {
        // Handle success or error
        console.log('Form submitted successfully');
        // Display the thank-you message
        document.getElementById('thankYouMessage').style.display = 'block';
      })
      .catch(error => {
        console.error('Error submitting form: ', error);
        // Display the thank-you message
        document.getElementById('ErrorMessage').style.display = 'block';
      });
  }
  
