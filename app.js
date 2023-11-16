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

// Reference to the Firebase database
const database = firebase.database();

// Fetch user details from Firebase
const usersRef = database.ref('users');
const whoPaidSelect = document.getElementById('whoPaid');

// Get friendId from the URL
const urlParams = new URLSearchParams(window.location.search);
const friendId = urlParams.get('friendId');

// Get the authenticated user's ID
let authUserId;
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    authUserId = user.uid;
  }
});

usersRef.once('value')
  .then((snapshot) => {
    snapshot.forEach((userSnapshot) => {
      const userId = userSnapshot.key;
      const userName = userSnapshot.child('details/name').val();

      const option = document.createElement('option');
      option.value = userId;
      option.textContent = userName;
      whoPaidSelect.appendChild(option);
    });
  })
  .catch((error) => {
    console.error('Error fetching user details:', error);
  });

// Event listener for the 'splitOption' select dropdown
const splitOptionSelect = document.getElementById('splitOption');
const percentageInput = document.getElementById('percentageInput');
const customAmountInput = document.getElementById('customAmountInput');

splitOptionSelect.addEventListener('change', () => {
  const selectedOption = splitOptionSelect.value;
  percentageInput.style.display = selectedOption === 'percentage' ? 'block' : 'none';
  customAmountInput.style.display = selectedOption === 'custom' ? 'block' : 'none';
});

// Event listener for the 'Save Expense' button
const saveExpenseButton = document.getElementById('saveExpenseButton');
saveExpenseButton.addEventListener('click', () => {
  // Get values from the form
  const amount = parseFloat(document.getElementById('amount').value);
  const splitOption = splitOptionSelect.value;
  const percentage = parseFloat(document.getElementById('percentage').value) || 0;
  const customAmount = parseFloat(document.getElementById('customAmount').value) || 0;
  const whoPaid = whoPaidSelect.value;

  // Perform necessary validations

  // Calculate split amounts
  let userAmount = 0;
  let friendAmount = 0;

  if (splitOption === 'equal') {
    userAmount = amount / 2;
    friendAmount = amount / 2;
  } else if (splitOption === 'percentage') {
    userAmount = (amount * percentage) / 100;
    friendAmount = amount - userAmount;
  } else if (splitOption === 'custom') {
    userAmount = customAmount;
    friendAmount = amount - userAmount;
  }

  // Prepare data to be saved to the database
  const expenseData = {
    amount,
    splitOption,
    percentage,
    customAmount,
    whoPaid,
    userAmount,
    friendAmount,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
  };

  // Save data to the Firebase database under the 'expenses' node
  const expenseRef = database.ref('expenses');
  const newExpenseRef = expenseRef.push(expenseData);

  // Save data to the authenticated user's transaction history
  const userExpensesRef = database.ref(`users/${authUserId}/transactions`);
  userExpensesRef.push({
    expenseId: newExpenseRef.key,
    amount: userAmount,
    totalAmount: amount,
    splitOption,
    percentage,
    customAmount,
    whoPaid,
    friendAmount,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
  });

  // Save data to the friend's transaction history
  const friendExpensesRef = database.ref(`users/${friendId}/transactions`);
  friendExpensesRef.push({
    expenseId: newExpenseRef.key,
    amount: friendAmount,
    totalAmount: amount,
    splitOption,
    percentage,
    customAmount,
    whoPaid,
    userAmount,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
  });

  console.log('Expense and transactions saved successfully!');
});
});