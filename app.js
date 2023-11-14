document.addEventListener('DOMContentLoaded', function () {
    var firebaseConfig = {
        apiKey: "AIzaSyCZfnZbZIKR1zyywjrXJu0MJOjETO35aTE",
        authDomain: "split-bill-6c19e.firebaseapp.com",
        databaseURL: "https://split-bill-6c19e-default-rtdb.firebaseio.com",
        projectId: "split-bill-6c19e",
        storageBucket: "split-bill-6c19e.appspot.com",
        messagingSenderId: "297198677510",
        appId: "1:297198677510:web:9cec9889c3224da9735d87"
    };

    // Asynchronous initialization
    async function initializeFirebase() {
        if (!firebase.apps.length) {
            await firebase.initializeApp(firebaseConfig);
        }

        // Add the authentication check here
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                // User is signed in. Continue with data access.
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

                var urlParams = new URLSearchParams(window.location.search);
                var friendId = urlParams.get('friendId');
                var userId = user.uid;

                var currentUserRef = firebase.database().ref('users').child(userId).child('details').child('name');
                currentUserRef.once('value', function (snapshot) {
                    var currentUserName = snapshot.val();
                    currentUserNameElement.textContent = `Your Name: ${currentUserName}`;
                    currentUserNameElement.style.display = 'block';
                });

                var friendRef = firebase.database().ref('users').child(friendId).child('details').child('name');
                friendRef.once('value', function (snapshot) {
                    var friendName = snapshot.val();
                    friendUserNameElement.textContent = `Friend's Name: ${friendName}`;
                    friendUserNameElement.style.display = 'block';
                });

                splitOptionSelect.addEventListener('change', function () {
                    var selectedOption = splitOptionSelect.value;
                    if (selectedOption === 'percentage') {
                        percentageInputDiv.style.display = 'block';
                        customAmountInputDiv.style.display = 'none';
                    } else if (selectedOption === 'custom') {
                        customAmountInputDiv.style.display = 'block';
                        percentageInputDiv.style.display = 'none';
                    } else {
                        percentageInputDiv.style.display = 'none';
                        customAmountInputDiv.style.display = 'none';
                    }
                });

                saveExpenseButton.addEventListener('click', function () {
                    splitAmountElement.textContent = '';
                    remainingAmountElement.textContent = '';
                    whoPaidElement.textContent = '';

                    var amount = parseFloat(amountInput.value);
                    var selectedOption = splitOptionSelect.value;
                    var percentage = parseFloat(percentageInput.value) || 0;
                    var customAmount = parseFloat(customAmountInput.value) || 0;

                    if (isNaN(amount) || amount <= 0) {
                        alert('Please enter a valid amount.');
                        return;
                    }

                    var splitAmount;
                    if (selectedOption === 'percentage') {
                        splitAmount = (amount * (percentage / 100)).toFixed(2);
                    } else if (selectedOption === 'custom') {
                        if (customAmount <= 0 || customAmount > amount) {
                            alert('Invalid custom amount. Please enter a valid value.');
                            return;
                        }
                        splitAmount = customAmount.toFixed(2);
                    } else {
                        splitAmount = (amount / 2).toFixed(2);
                    }

                    var remainingAmount = (amount - splitAmount).toFixed(2);
                    var whoPaid = whoPaidSelect.value;
                    var whoPaidName = (whoPaid === userId) ? 'You' : 'Friend';

                    splitAmountElement.textContent = `Your Share: ₹${splitAmount}`;
                    remainingAmountElement.textContent = `Friend's Share: ₹${remainingAmount}`;
                    whoPaidElement.textContent = `Paid by: ${whoPaidName}`;
                });

            } else {
                // No user is signed in. Redirect or handle accordingly.
                console.log("User not authenticated");
            }
        });
    }

    initializeFirebase();
});
