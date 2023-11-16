document.addEventListener('DOMContentLoaded', function() {
  const firebaseConfig = {
    apiKey: "AIzaSyCZfnZbZIKR1zyywjrXJu0MJOjETO35aTE",
    authDomain: "split-bill-6c19e.firebaseapp.com",
    databaseURL: "https://split-bill-6c19e-default-rtdb.firebaseio.com",
    projectId: "split-bill-6c19e",
    storageBucket: "split-bill-6c19e.appspot.com",
    messagingSenderId: "297198677510",
    appId: "1:297198677510:web:9cec9889c3224da9735d87"
  };
  firebase.initializeApp(firebaseConfig);

    const auth = firebase.auth();
    let currentUser;

    // Listen for changes in the authentication state
    auth.onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in
            currentUser = user;
            document.getElementById("currentUserName").innerText = `Current User: ${currentUser.displayName}`;
        } else {
            // No user is signed in
            console.log("User not logged in");
            // Redirect to the login page or handle the scenario accordingly
        }
    });

    // Fetch friend name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const friendId = urlParams.get("friendId");

// Function to fetch friend name from the database based on friendId
async function fetchFriendName(friendId) {
  try {
      const userSnapshot = await firebase.database().ref(`users/${friendId}/details`).once("value");
      const friendName = userSnapshot.val().name;
      return friendName; // Return a default value if friendName is undefined
  } catch (error) {
      throw error;
  }
}

    // Dynamically update Split Option input fields
    const splitOptionDropdown = document.getElementById("splitOption");
    const percentageInput = document.getElementById("percentageInput");
    const customAmountInput = document.getElementById("customAmountInput");

    splitOptionDropdown.addEventListener("change", function () {
        const selectedOption = splitOptionDropdown.value;

        if (selectedOption === "percentage") {
            percentageInput.style.display = "block";
            customAmountInput.style.display = "none";
        } else if (selectedOption === "custom") {
            percentageInput.style.display = "none";
            customAmountInput.style.display = "block";
        } else {
            percentageInput.style.display = "none";
            customAmountInput.style.display = "none";
        }
    });

// Save expense to the database
document.getElementById("saveExpenseButton").addEventListener("click", function () {
  const name = document.getElementById("name").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const splitOption = document.getElementById("splitOption").value;
  const percentage = parseFloat(document.getElementById("percentage").value) || 0;
  const customAmount = parseFloat(document.getElementById("customAmount").value) || 0;
  const whoPaid = document.getElementById("whoPaid").value;

  // Create a unique split ID
  const splitId = generateSplitId();

  // Save split details
  saveSplitDetails(currentUser.uid, currentUser.displayName, friendId, name, whoPaid, amount, splitOption, percentage, customAmount, splitId);
});

// Function to save split details
function saveSplitDetails(userId, userName, friendId, name, whoPaid, amount, splitOption, percentage, customAmount, splitId) {
  const splitRef = firebase.database().ref(`splits/${splitId}`);
  splitRef.set({
      userId1: userId,
      userName1: userName,
      userId2: friendId,
      userName2: name, // Assuming 'name' is the friend's name
      whoPaid: whoPaid === 'me' ? userName : name, // Use the appropriate username
      amount: amount,
      splitOption: splitOption,
      percentage: percentage,
      customAmount: customAmount
  });
}

    // Function to generate a unique split ID (you can customize this function based on your needs)
    function generateSplitId() {
        return firebase.database().ref("splits").push().key;
    }
});
