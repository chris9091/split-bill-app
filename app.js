document.addEventListener('DOMContentLoaded', function () {
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
  const database = firebase.database();

  // Function to get the current user's ID
// Function to get the current user's ID
function getCurrentUserID() {
  return new Promise((resolve, reject) => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        resolve(user.uid);
        console.log('User ID:', user.uid);
      } else {
        console.error('User not authenticated.');
        reject(null);
      }
      // Make sure to unsubscribe to avoid memory leaks
      unsubscribe();
    });
  });
}

  // Function to get user name by ID
  async function getUserNameById(userID) {
    const snapshot = await database.ref(`users/${userID}/details/name`).once('value');
    return snapshot.val();
  }

  // Function to save an expense to Firebase
  function saveExpense(expenseData) {
    const newExpenseRef = database.ref('expenses').push();
    newExpenseRef.set(expenseData);
  }

  // Function to update amount and percentage information
  async function updateExpenseDetails() {
    // Get the selected user from the dropdown
    const selectedUser = document.getElementById('whoPaid');
    if (!selectedUser || selectedUser.selectedIndex === -1) {
      return;
    }
    const selectedUserId = selectedUser.value;
    const selectedUserName = selectedUser.options[selectedUser.selectedIndex].text;

    // Get the values from the inputs
    const totalAmount = parseFloat(document.getElementById('amount').value) || 0;
    const splitOption = document.getElementById('splitOption').value;
    const percentage = parseFloat(document.getElementById('percentage').value) || 0;
    const customAmount = parseFloat(document.getElementById('customAmount').value) || 0;

    // Calculate amount to pay based on the split option
    let amountToPayMe = 0;
    let amountToPayFriend = 0;

    switch (splitOption) {
      case 'equal':
        amountToPayMe = totalAmount / 2;
        amountToPayFriend = totalAmount / 2;
        break;
      case 'percentage':
        amountToPayMe = (percentage / 100) * totalAmount;
        amountToPayFriend = totalAmount - amountToPayMe;
        break;
      case 'custom':
        amountToPayMe = customAmount;
        amountToPayFriend = totalAmount - amountToPayMe;
        break;
      default:
        break;
    }

    // Fetch the friend's name from Firebase using the friendID
    const friendID = getParameterByName('friendId');
    let friendName = 'Friend'; // Default to 'Friend' if friend name is not available

    const currentUserID = getParameterByName('userId');
    let currentName = 'You'; // Default to 'Friend' if friend name is not available

    if (friendID) {
      try {
        friendName = await getUserNameById(friendID) || 'Friend';
      } catch (error) {
        console.error('Error fetching friend name:', error);
      }
    }

    if (currentUserID) {
      try {
        currentName = await getUserNameById(currentUserID) || 'You';
      } catch (error) {
        console.error('Error fetching friend name:', error);
      }
    }

    // Update the HTML elements in table format
    const tableContent = `
      <table>
        <tr>
          <th>${currentName} Paid</th>
          <th>${friendName} Paid</th>
        </tr>
        <tr>
          <td>₹${amountToPayMe.toFixed(2)}</td>
          <td>₹${amountToPayFriend.toFixed(2)}</td>
        </tr>
      </table>
    `;

    const amountToPayElement = document.getElementById('amountToPay');
    amountToPayElement.innerHTML = tableContent;
  }

  // Event listener to update expense details when input values change
  document.getElementById('amount').addEventListener('input', updateExpenseDetails);
  document.getElementById('percentage').addEventListener('input', updateExpenseDetails);
  document.getElementById('customAmount').addEventListener('input', updateExpenseDetails);
  document.getElementById('whoPaid').addEventListener('change', updateExpenseDetails);
  document.getElementById('splitOption').addEventListener('change', function () {
    // Show/hide additional fields based on the selected split option
    const percentageInput = document.getElementById('percentageInput');
    const customAmountInput = document.getElementById('customAmountInput');

    // Show/hide percentage and custom amount inputs
    percentageInput.style.display = this.value === 'percentage' ? 'block' : 'none';
    customAmountInput.style.display = this.value === 'custom' ? 'block' : 'none';

    // Call the function to update expense details when the split option changes
    updateExpenseDetails();
  });

  // Function to get URL parameters
  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

// Fetch and populate the users dropdown
async function populateUsersDropdown() {
  const usersDropdown = document.getElementById('whoPaid');

  // Get the current user's ID dynamically
  let currentUserID;
  try {
    currentUserID = await getCurrentUserID();
  } catch (error) {
    console.error(error);
    return;
  }

  // Assuming you have a way to get the friend's ID from the URL
  const friendID = getParameterByName('friendId');

  // Fetch friends from Firebase and populate the dropdown
  try {
    const snapshot = await database.ref('users').once('value');
    snapshot.forEach((userSnapshot) => {
      const userId = userSnapshot.key;
      const userName = userSnapshot.val().details.name;

      // Display current user's name and friend's name in the dropdown
      if (userId === currentUserID || userId === friendID) {
        const option = document.createElement('option');
        option.value = userId;
        option.text = userId === currentUserID ? 'You' : userName;
        usersDropdown.add(option);
      }
    });

    // Call the function to update expense details when the users dropdown is populated
    updateExpenseDetails();
  } catch (error) {
    // Handle the error as needed
    console.error(error);
  }
}

// Event listener to handle the "Save Expense" button click
document.getElementById('saveExpenseButton').addEventListener('click', async function () {
  // Validate the input values before saving
  const amountInput = document.getElementById('amount');
  if (!amountInput || parseFloat(amountInput.value) <= 0) {
    console.error('Amount should be greater than zero.');
    return;
  }

  // Get the values from the inputs
  const totalAmount = parseFloat(amountInput.value) || 0;
  const splitOption = document.getElementById('splitOption').value;
  const percentage = parseFloat(document.getElementById('percentage').value) || 0;
  const customAmount = parseFloat(document.getElementById('customAmount').value) || 0;

  // Calculate amount to pay based on the split option
  let amountToPayMe = 0;
  let amountToPayFriend = 0;

  // Get the selected user from the dropdown
  const selectedUser = document.getElementById('whoPaid');
  if (!selectedUser || selectedUser.selectedIndex === -1) {
    console.error('No user selected.');
    return;
  }

  const selectedUserId = selectedUser.value;
  const selectedUserName = selectedUser.options[selectedUser.selectedIndex].text;

  const friendID = getParameterByName('friendId');
  let friendName = 'Friend'; // Default to 'Friend' if friend name is not available

  // Determine user names based on who paid
  const currentUserID = await getCurrentUserID();
  let currentUserName = 'You';

  if (friendID) {
    friendName = await getUserNameById(friendID) || 'Friend';
  }

  if (currentUserID === selectedUserId) {
    // If the current user paid, set the real user name and amount accordingly
    currentUserName = await getUserNameById(currentUserID) || 'You';
    amountToPayMe = splitOption === 'custom' ? customAmount : (percentage / 100) * totalAmount;
    amountToPayFriend = totalAmount - amountToPayMe;
  } else {
    // If a friend paid, set the friend's name and current user's name, and amount accordingly
    currentUserName = await getUserNameById(currentUserID) || 'You';
    friendName = await getUserNameById(selectedUserId) || 'Friend';
    amountToPayFriend = splitOption === 'custom' ? customAmount : (percentage / 100) * totalAmount;
    amountToPayMe = totalAmount - amountToPayFriend;
  }

  try {
    // Generate a unique split ID
    const splitID = database.ref('expenses').push().key;

    // Create data object with the new structure
    const expenseData = {
      title: document.getElementById('name').value,
      amount: totalAmount,
      splitOption: splitOption,
      percentage: percentage,
      customAmount: customAmount,
      whoPaid: currentUserName,
      user1: currentUserID,
      user1Name: currentUserName,
      user1Share: amountToPayMe,
      user2: friendID,
      user2Name: friendName,
      user2Share: amountToPayFriend,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      splitId: splitID,
    };

    // Save the expense data to Firebase
    await saveExpense(expenseData);

    // Show a success popup (You can replace this with your logic)
    alert('Expense saved successfully!');
  } catch (error) {
    console.error('Error saving expense:', error);
  }
});


  // Call the function to populate the users dropdown when the DOM is ready
  populateUsersDropdown();
});