'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2022-10-01T23:36:17.929Z',
    '2022-10-04T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Data
// const account1 = {
//   owner: 'Jonas Schmedtmann',
//   movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
//   interestRate: 1.2, // %
//   pin: 1111,
// };

// const account2 = {
//   owner: 'Jessica Davis',
//   movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
//   interestRate: 1.5,
//   pin: 2222,
// };

// const account3 = {
//   owner: 'Steven Thomas Williams',
//   movements: [200, -200, 340, -300, -20, 50, 400, -460],
//   interestRate: 0.7,
//   pin: 3333,
// };

// const account4 = {
//   owner: 'Sarah Smith',
//   movements: [430, 1000, 700, 50, 90],
//   interestRate: 1,
//   pin: 4444,
// };

// const accounts = [account1, account2, account3, account4];

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
let currentAccount, timer;

///////////////////////////////////////////////////////////////////////////////////
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

    //LOGOUT TIMER
    if (timer) clearInterval(timer);
    timer = logoutTimer();

    // DISPLAYING THE DEPOSITS AND WITHDRAWALS OF CURRENT USER BASED ON HIS MOVEMENTS ARRAY
    displayMovements(currentAccount);

    // CALLING THE calcSummary FUNCTION TO CALC THE SUMMARY FOR THE CURRENT USER
    calcSummary(currentAccount);
  }
});

///////////////////////////////////////////////////////////////////////////////////////
//logtout timer funtion

const logoutTimer = function () {
  let time = 120;
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    time--;
    if (time < 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'log in to get started';
      containerApp.style.opacity = 0;
    }
  };
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//////////////////////////////////////////////////////////////////////////////
// requesting loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    calcSummary(currentAccount);
    displayMovements(currentAccount);
  } else {
    console.log('loan not approved');
  }
  inputLoanAmount.value = '';
  clearInterval(timer);
  timer = logoutTimer();
});

////////////////////////////////////////////////////////////////////////////////
//transfer funds
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
    currentAccount.movementsDates.push(new Date().toISOString());
    reciverAccount.movementsDates.push(new Date().toISOString());
  };
  tranferFunds(accounts);
  //clear inputfields
  inputTransferTo.value = inputTransferAmount.value = '';
  //upadte UI
  calcSummary(currentAccount);
  displayMovements(currentAccount);
  clearInterval(timer);
  timer = logoutTimer();
});

/////////////////////////////////////////////////////////////////////////////
//closing account

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

//////////////////////////////////////////////////////////////////////////////////
//CALCULATING THE TOTAL BALANCE AND SUMMARY FOR THE CURRENT USER
const calcSummary = function (acc) {
  // CALCULATING TOTAL BALANCE
  acc.totalBalance = acc.movements.reduce((accum, curr) => accum + curr, 0);
  //TOTAL BALANCE DISPLAYING IN UI
  labelBalance.textContent = `${acc.totalBalance.toFixed(2)}€`;

  // CALCULATING TOTAL DEPOSIT OF CURRENT USER
  acc.deposits = acc.movements
    .filter(mov => mov > 0)
    .reduce((accum, curr) => accum + curr, 0);
  //TOTAL DEPOSITS DISPLAYING IN UI
  labelSumIn.textContent = `${acc.deposits.toFixed(2)}€`;

  //CALCULATING THE WITHDRAWALS FOR THE CURRENT USER
  acc.withdrawals = acc.movements
    .filter(mov => mov < 0)
    .reduce((accum, curr) => accum + curr, 0);
  //TOTAL WITHDRAWALS DISPLAYING IN UI
  labelSumOut.textContent = `${Math.abs(acc.withdrawals).toFixed(2)}€`;

  //CALCULATING THE INTEREST FOR THE CURRENT USER
  acc.interests = acc.movements.reduce(
    (accum, curr) => accum + (curr * acc.interestRate) / 100,
    0
  );
  //TOTAL INTERESTS DISPLAYING IN UI
  labelSumInterest.textContent = `${acc.interests.toFixed(2)}€`;
};

/////////////////////////////////////////////////////////////////////////////////////////
/// date
const now = new Date();
const year = now.getFullYear();
const month = `${now.getMonth() + 1}`.padStart(2, 0);
const date = `${now.getDate()}`.padStart(2, 0);
const hour = `${now.getHours()}`.padStart(2, 0);
const minutes = `${now.getMinutes()}`.padStart(2, 0);
labelDate.textContent = '';
labelDate.textContent = `${date}/${month}/${year},  ${hour}:${minutes}`;

/////////////////////////////////////////////////////////////////////////////////////////
// calculting date for movments
const calcMovsDates = function (movDate) {
  const calcDaysPassed = function (date1, date2) {
    return Math.round(Math.abs((date1 - date2) / (1000 * 60 * 60 * 24)));
  };
  const daysPassed = calcDaysPassed(new Date(), movDate);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} Days ago`;
  const year = movDate.getFullYear();
  const month = `${movDate.getMonth() + 1}`.padStart(2, 0);
  const dates = `${movDate.getDate()}`.padStart(2, 0);
  return `${dates}/${month}/${year}`;
};

/////////////////////////////////////////////////////////////////////////////////////////////////
// DISPLAYING THE DEPOSITS AND WITHDRAWALS OF CURRENT USER BASED ON HIS MOVEMENTS ARRAY
const displayMovements = function (acc, sort = false) {
  //sorting
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  containerMovements.innerHTML = '';
  //   const movDates = acc.movementsDates;
  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    // dates for the movements
    const movDate = new Date(acc.movementsDates[i]);
    const displayDate = calcMovsDates(movDate);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1}</div>
        <div class="movements__type movements__type--${type}">${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>
      `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// g variable for sorting
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

//////////////////////////////////////////////////////////////////////////////////////////////
//Filling Arrays
// const random = Array.from({ length: 30 }, () => Math.trunc(Math.random() * 21));
// console.log(random);
