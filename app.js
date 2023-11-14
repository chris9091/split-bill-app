document.addEventListener('DOMContentLoaded', function() {
    var firebaseConfig = {
        apiKey: "AIzaSyCZfnZbZIKR1zyywjrXJu0MJOjETO35aTE",
        authDomain: "split-bill-6c19e.firebaseapp.com",
        databaseURL: "https://split-bill-6c19e-default-rtdb.firebaseio.com",
        projectId: "split-bill-6c19e",
        storageBucket: "split-bill-6c19e.appspot.com",
        messagingSenderId: "297198677510",
        appId: "1:297198677510:web:9cec9889c3224da9735d87"
      };

firebase.initializeApp(firebaseConfig);

var amountInput = document.getElementById('amount');
    var splitOptionSelect = document.getElementById('splitOption');
    var percentageInput = document.getElementById('percentage');
    var customAmountInput = document.getElementById('customAmount');
    var whoPaidSelect = document.getElementById('whoPaid');
    var saveExpenseButton = document.getElementById('saveExpenseButton');

    // Fetch the friend's ID from the URL
    var urlParams = new URLSearchParams(window.location.search);
    var friendId = urlParams.get('friendId'); // Replace 'friendId' with the parameter name in your URL

    // Fetch current user's ID (you can fetch it based on your authentication logic)
    var userId = 'userId'; // Replace this with the actual logged-in user's ID

    // Fetch current user's name from the database
    var currentUserRef = firebase.database().ref('users').child(userId).child('details').child('name');
    currentUserRef.once('value', function(snapshot) {
        var currentUserName = snapshot.val();
        // Set current user's name in the UI (assuming you have an element with id 'currentUser' to display the name)
        document.getElementById('currentUser').textContent = currentUserName;
    });

    // Fetch friend's name from the database based on the friendId extracted from the URL
    var friendRef = firebase.database().ref('users').child(friendId).child('details').child('name');
    friendRef.once('value', function(snapshot) {
        var friendName = snapshot.val();
        // Set friend's name in the UI (assuming you have an element with id 'friendName' to display the name)
        document.getElementById('friendName').textContent = friendName;
    });

// Check if urlParams is already defined
if (!window.urlParams) {
    const urlParams = new URLSearchParams(window.location.search);
    const friendId = urlParams.get('friendId');

    const usersRef = firebase.database().ref('users');
    usersRef.child(userId).child('details').once('value', function(snapshot) {
        const selfName = snapshot.val().name;
        // Display selfName in the UI
    });

    usersRef.child(friendId).child('details').once('value', function(snapshot) {
        const friendName = snapshot.val().name;
        // Display friendName in the UI
    });
}


    saveExpenseButton.addEventListener('click', function() {
        var amount = parseFloat(amountInput.value);
        var selectedOption = splitOptionSelect.value;
        var percentage = parseFloat(percentageInput.value) || 0;
        var customAmount = parseFloat(customAmountInput.value) || 0;

        // Validate the amount input
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        // Calculate split amount based on the selected option
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
            // Default to equal split if no option is selected
            splitAmount = (amount / 2).toFixed(2);
        }

        // Calculate remaining amount
        var remainingAmount = (amount - splitAmount).toFixed(2);

        // Get the name of the user who paid
        var whoPaid = whoPaidSelect.value;
        var whoPaidName = (whoPaid === userId) ? 'You' : 'Friend';

        // Display the split amount, remaining amount, and who paid in the UI
        document.getElementById('splitAmount').textContent = `Split Amount: ₹${splitAmount}`;
        document.getElementById('remainingAmount').textContent = `Remaining: ₹${remainingAmount}`;
        document.getElementById('whoPaid').textContent = `Paid by: ${whoPaidName}`;

        // Save the expense details to the database (modify this part based on your database structure)
        var expenseRef = firebase.database().ref('expenses');
        var newExpenseRef = expenseRef.push();
        newExpenseRef.set({
            totalAmount: amount,
            splitAmount: parseFloat(splitAmount),
            remainingAmount: parseFloat(remainingAmount),
            paidBy: whoPaid, // ID of the user who paid (logged-in user or friend)
            splitWith: (whoPaid === userId) ? friendId : userId, // ID of the friend (or current user if friend paid)
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(function() {
            alert('Expense saved successfully!');
            // Redirect or perform additional actions after saving the expense
            // window.location.href = 'dashboard.html';
        }).catch(function(error) {
            console.error('Error saving expense:', error);
            alert('Error saving expense. Please try again.');
        });
    });
});