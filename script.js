'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

/////////////////////////////////////////////////

// CALCULATING USER NAME FROM OWNER PROPERTY OF THE ACCOUNT OBJECT

const createUsernames = function (accs) {
  accs.forEach(acc => {
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => {
        return name[0];
      })
      .join('');
  });
};
createUsernames(accounts);

//CONVERT EURO TO USD

const convertCurrency = function (accs) {
  accs.forEach(acc => {
    acc.convertedCurrency = acc.movements
      .filter(mov => {
        if (mov > 0) return mov;
      })
      .map(mov => mov * 0.98);
    acc.totalBalanceUsd = acc.convertedCurrency.reduce(
      (accum, curr) => accum + curr,
      0
    );
  });
};
convertCurrency(accounts);

//global variable for current user
let currentAccount;

// CURRENT USER // CALC THE CURRENT ACCOUNT FROM THE UI DATA SUBMITTED
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //DISPLAY A WELCOME MESSAGE TO THE CURRENT USER
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;

    // CHANGING THE OPACITY OF CURRENT ACCOUNT PAGE FROM 0
    containerApp.style.opacity = 100;

    //clear inputfields
    inputLoginUsername.value = inputLoginPin.value = '';

    // DISPLAYING THE DEPOSITS AND WITHDRAWALS OF CURRENT USER BASED ON HIS MOVEMENTS ARRAY
    displayMovements(currentAccount.movements);

    // CALLING THE calcSummary FUNCTION TO CALC THE SUMMARY FOR THE CURRENT USER
    calcSummary(currentAccount);
  }
});

//////////////////////////////////////////////////////////////////////////////
// requesting loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);
    calcSummary(currentAccount);
    displayMovements(currentAccount.movements);
  } else {
    console.log('loan not approved');
  }
});

////////////////////////////////////////////////////////////////////////////////
//closing the account funtionality
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const tranferFunds = function (accs) {
    const amount = Number(inputTransferAmount.value);
    const reciverAccount = accounts.find(
      acc => acc.userName === inputTransferTo.value
    );
    if (
      amount > 0 &&
      reciverAccount &&
      amount <= currentAccount.totalBalance &&
      reciverAccount.userName !== currentAccount.userName
    ) {
      currentAccount.movements.push(-amount);
      reciverAccount.movements.push(amount);
    }
  };
  tranferFunds(accounts);
  //clear inputfields
  inputTransferTo.value = inputTransferAmount.value = '';
  //upadte UI
  calcSummary(currentAccount);
  displayMovements(currentAccount.movements);
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.userName &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.userName === currentAccount.userName
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
  console.log(accounts);
});

//CALCULATING THE TOTAL BALANCE AND SUMMARY FOR THE CURRENT USER
const calcSummary = function (acc) {
  // CALCULATING TOTAL BALANCE
  acc.totalBalance = acc.movements.reduce((accum, curr) => accum + curr, 0);
  //TOTAL BALANCE DISPLAYING IN UI
  labelBalance.textContent = `${acc.totalBalance}€`;

  // CALCULATING TOTAL DEPOSIT OF CURRENT USER
  acc.deposits = acc.movements
    .filter(mov => mov > 0)
    .reduce((accum, curr) => accum + curr, 0);
  //TOTAL DEPOSITS DISPLAYING IN UI
  labelSumIn.textContent = `${acc.deposits}€`;

  //CALCULATING THE WITHDRAWALS FOR THE CURRENT USER
  acc.withdrawals = acc.movements
    .filter(mov => mov < 0)
    .reduce((accum, curr) => accum + curr, 0);
  //TOTAL WITHDRAWALS DISPLAYING IN UI
  labelSumOut.textContent = `${Math.abs(acc.withdrawals)}€`;

  //CALCULATING THE INTEREST FOR THE CURRENT USER
  acc.interests = acc.movements.reduce(
    (accum, curr) => accum + (curr * acc.interestRate) / 100,
    0
  );
  //TOTAL INTERESTS DISPLAYING IN UI
  labelSumInterest.textContent = `${acc.interests}€`;
};

/////////////////////////////////////////////////////////////////////////////////////////////////
// DISPLAYING THE DEPOSITS AND WITHDRAWALS OF CURRENT USER BASED ON HIS MOVEMENTS ARRAY
const displayMovements = function (movements, sort = false) {
  //sorting
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  containerMovements.innerHTML = '';
  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1}</div>
        <div class="movements__type movements__type--${type}">${type}</div>
        <div class="movements__value">${mov}€</div>
      </div>
      `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// g variable for sorting
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
