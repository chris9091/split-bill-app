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

  function getCurrentUserID() {
    return new Promise((resolve, reject) => {
      const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          resolve(user.uid);
        } else {
          console.error('User not authenticated.');
          reject(null);
        }
        unsubscribe();
      });
    });
  }

  function saveExpense(expenseData) {
    const newExpenseRef = database.ref('expenses').push();
    newExpenseRef.set(expenseData)
      .then(() => {
        // Display a success popup or notification
        alert('Expense saved successfully!');
      })
      .catch((error) => {
        console.error('Error saving expense:', error);
      });
  }

  function updateExpenseDetails() {
    const amountInput = document.getElementById('amount');
    const splitOption = document.getElementById('splitOption').value;
    const percentageInput = document.getElementById('percentage');
    const customAmountInput = document.getElementById('customAmount');
    const whoPaidDropdown = document.getElementById('whoPaid');

    if (!amountInput || !splitOption || !whoPaidDropdown) {
      console.error('Required elements are missing.');
      return;
    }

    const selectedUser = whoPaidDropdown;
    if (selectedUser.selectedIndex === -1) {
      console.error('No user selected.');
      return;
    }

    const selectedUserId = selectedUser.value;
    const selectedUserName = selectedUser.options[selectedUser.selectedIndex].text;

    const totalAmount = parseFloat(amountInput.value) || 0;
    const percentage = parseFloat(percentageInput.value) || 0;
    const customAmount = parseFloat(customAmountInput.value) || 0;

    if (totalAmount <= 0) {
      console.error('Amount should be greater than zero.');
      return;
    }

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
    }

    const friendID = getParameterByName('friendId');
    database.ref('users').child(friendID).once('value').then((friendSnapshot) => {
      const friendDetails = friendSnapshot.val().details;
      const friendName = friendDetails.name;

      const expenseData = {
        title: "Test", // You can change this based on your requirements
        amount: totalAmount,
        splitOption: splitOption,
        percentage: percentage,
        customAmount: customAmount,
        whoPaid: selectedUserName,
        userId: selectedUserId,
        userName: selectedUserName,
        friend: {
          friendId: friendID,
          friendName: friendName,
        },
        timestamp: firebase.database.ServerValue.TIMESTAMP, // Use server timestamp
      };

      saveExpense(expenseData);
    });
  }

  async function populateUsersDropdown() {
    const usersDropdown = document.getElementById('whoPaid');

    try {
      const currentUserID = await getCurrentUserID();
      const friendID = getParameterByName('friendId');

      database.ref('users').once('value').then((snapshot) => {
        snapshot.forEach((userSnapshot) => {
          const userId = userSnapshot.key;
          const userName = userSnapshot.val().details.name;

          if (userId === currentUserID || userId === friendID) {
            const option = document.createElement('option');
            option.value = userId;
            option.text = (userId === currentUserID) ? 'Me' : userName;
            usersDropdown.add(option);
          }
        });

        updateExpenseDetails();
      });

    } catch (error) {
      console.error(error);
    }
  }

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  populateUsersDropdown();
  updateExpenseDetails();

  document.getElementById('amount').addEventListener('input', updateExpenseDetails);
  document.getElementById('percentage').addEventListener('input', updateExpenseDetails);
  document.getElementById('customAmount').addEventListener('input', updateExpenseDetails);
  document.getElementById('whoPaid').addEventListener('change', updateExpenseDetails);
  document.getElementById('splitOption').addEventListener('change', function () {
    const percentageInput = document.getElementById('percentageInput');
    const customAmountInput = document.getElementById('customAmountInput');

    percentageInput.style.display = this.value === 'percentage' ? 'block' : 'none';
    customAmountInput.style.display = this.value === 'custom' ? 'block' : 'none';

    updateExpenseDetails();
  });

  document.getElementById('saveExpenseButton').addEventListener('click', updateExpenseDetails);

});