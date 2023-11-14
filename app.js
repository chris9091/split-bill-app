document.addEventListener('DOMContentLoaded', async function () {
    // Your Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyCZfnZbZIKR1zyywjrXJu0MJOjETO35aTE",
        authDomain: "split-bill-6c19e.firebaseapp.com",
        databaseURL: "https://split-bill-6c19e-default-rtdb.firebaseio.com",
        projectId: "split-bill-6c19e",
        storageBucket: "split-bill-6c19e.appspot.com",
        messagingSenderId: "297198677510",
        appId: "1:297198677510:web:9cec9889c3224da9735d87"
    };

    // Initialize Firebase
    await initializeFirebase(firebaseConfig);

    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
        console.error('Error: User not authenticated.');
        // You may redirect the user to the login page or take appropriate action.
        return;
    }
// Get user names from the database
function getUserNames(callback) {
    // Fetch user names from Firebase
    var usersRef = firebase.database().ref('users');
    usersRef.once('value')
        .then(function (snapshot) {
            var userNames = [];
            snapshot.forEach(function (userSnapshot) {
                var userName = userSnapshot.child('details/name').val();
                userNames.push(userName);
            });
            callback(userNames);
        })
        .catch(function (error) {
            console.error('Error fetching user names from Firebase:', error);
            callback([]); // Provide an empty array if there's an error
        });
}


    // DOM elements
    var amountInput = document.getElementById('amount');
    var splitOptionSelect = document.getElementById('splitOption');
    var percentageInput = document.getElementById('percentage');
    var customAmountInput = document.getElementById('customAmount');
    var whoPaidSelect = document.getElementById('whoPaid');
    var saveExpenseButton = document.getElementById('saveExpenseButton');
    var splitAmountElement = document.getElementById('splitAmount');
    var remainingAmountElement = document.getElementById('remainingAmount');
    var whoPaidElement = document.getElementById('whoPaid');
    var currentUserNameElement = document.getElementById('currentUserName');
    var friendUserNameElement = document.getElementById('friendUserName');
    var percentageInputDiv = document.getElementById('percentageInput');
    var customAmountInputDiv = document.getElementById('customAmountInput');

    // Get user ID and friend ID from the URL parameters
    var urlParams = new URLSearchParams(window.location.search);
    var friendId = urlParams.get('friendId');
    var userId = user.uid;

    // Fetch and display user names
    var currentUserRef = firebase.database().ref('users/' + userId + '/details/name');
    currentUserRef.once('value', function (snapshot) {
        console.log('Firebase Data Snapshot:', snapshot.val()); // Log the snapshot value
        var currentUserName = snapshot.val();

        if (currentUserName !== null) {
            currentUserNameElement.textContent = `Your Name: ${currentUserName}`;
            currentUserNameElement.style.display = 'block';
        } else {
            console.error('Error: User name not found in Firebase.');
        }
    });

    var friendRef = firebase.database().ref('users').child(friendId).child('details').child('name');
    friendRef.once('value', function (snapshot) {
        var friendName = snapshot.val();
        friendUserNameElement.textContent = `Friend's Name: ${friendName}`;
        friendUserNameElement.style.display = 'block';

        // Now, populate the dropdown with user names
        getUserNames(function (userNames) {
            // Clear existing options in the dropdown
            whoPaidSelect.innerHTML = "";

            // Populate the dropdown with user names
            userNames.forEach(function (name, index) {
                var option = document.createElement('option');
                option.value = index; // Use a unique identifier
                option.text = name;
                whoPaidSelect.add(option);
            });
        });

        // Add event listener to the "Who Paid" dropdown
        whoPaidSelect.addEventListener('change', function () {
            updateShare();
        });
    });

    // Function to populate "Who Paid" dropdown
function populateWhoPaidDropdown(userNames) {
    var whoPaidDropdown = document.getElementById('whoPaid');

    userNames.forEach(function (name, index) {
        var option = document.createElement('option');
        option.value = index; // Use a unique identifier
        option.text = name;
        whoPaidDropdown.add(option);
    });
}


// Function to update share based on user input
function updateShare() {
    var amount = parseFloat(amountInput.value) || 0;
    var selectedOption = splitOptionSelect.value;
    var percentage = parseFloat(percentageInput.value) || 0;
    var customAmount = parseFloat(customAmountInput.value) || 0;

    if (isNaN(amount) || amount <= 0) {
        console.error('Error: Invalid amount.');
        return;
    }

    var shareAmount;
    if (selectedOption === 'percentage') {
        shareAmount = (amount * (percentage / 100)).toFixed(2);
    } else if (selectedOption === 'custom') {
        shareAmount = customAmount.toFixed(2);
    } else {
        shareAmount = (amount / 2).toFixed(2);
    }

    splitAmountElement.textContent = `Your Share: ₹${shareAmount}`;
    remainingAmountElement.textContent = `Friend's Share: ₹${(amount - shareAmount).toFixed(2)}`;

    // Check if whoPaidSelect has options before updating the dropdown
    if (whoPaidSelect.options.length > 0) {
        whoPaidElement.textContent = `Paid by: ${whoPaidSelect.options[whoPaidSelect.selectedIndex].text}`;
    } else {
        console.error('Error: whoPaidSelect has no options.');
    }
}

// Update share when amount or options change
amountInput.addEventListener('input', function () {
    updateShare();
});

splitOptionSelect.addEventListener('change', function () {
    var splitOption = this.value;
    toggleSplitOptions(splitOption);
    updateShare(); // Update the share immediately after changing the split option
});

percentageInput.addEventListener('input', function () {
    updateShare();
});

customAmountInput.addEventListener('input', function () {
    updateShare();
});

// Add event listener to the "Who Paid" dropdown
whoPaidSelect.addEventListener('change', function () {
    updateShare();
});





    
    // Save expense to the database
    saveExpenseButton.addEventListener('click', function () {
        // Your existing code

        // Save data to the database
        var expenseData = {
            // Include relevant data here
        };

        // Assuming you have a function to save data to the database
        saveExpenseToDatabase(expenseData);
    });

    // Function to save data to the database
    function saveExpenseToDatabase(expenseData) {
        // Implement saving data to the database
        // Example:
        var expensesRef = firebase.database().ref('expenses');
        expensesRef.push(expenseData);
    }

    // Function to initialize Firebase
    async function initializeFirebase(config) {
        if (!firebase.apps.length) {
            await firebase.initializeApp(config);
        }
    }

    // Function to get the current authenticated user
    async function getCurrentUser() {
        return new Promise((resolve) => {
            firebase.auth().onAuthStateChanged((user) => {
                resolve(user);
            });
        });
    }
});
