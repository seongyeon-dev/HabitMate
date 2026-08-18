/* 화면 */
const signupArea = document.querySelector(".signup-area");
const loginArea = document.querySelector(".login-area");

/* 회원가입 폼 */
const signupForm = document.querySelector(".signup-form");

const emailInput = document.querySelector('input[name="email"]');
const passwordInput = document.querySelector('input[name="password"]');
const passwordConfirmInput = document.querySelector(
  'input[name="passwordConfirm"]',
);
const nicknameInput = document.querySelector('input[name="nickname"]');
const agreeInput = document.querySelector('input[name="agree"]');

/* 로그인 폼 */
const loginForm = document.querySelector(".login-form");

const loginEmailInput = document.querySelector('input[name="loginEmail"]');
const loginPasswordInput = document.querySelector(
  'input[name="loginPassword"]',
);

/* 화면 전환 버튼 */
const loginButton = document.querySelector(".login-button");
const signupLinkButton = document.querySelector(".signup-link-button");

/* 회원가입 */
signupForm.addEventListener("submit", function (event) {
  event.preventDefault();

  /* 이메일 확인 */
  if (emailInput.value.trim() === "") {
    alert("이메일을 입력해주세요.");
    return;
  }

  /* 비밀번호 확인 */
  if (passwordInput.value.trim() === "") {
    alert("비밀번호를 입력해주세요.");
    return;
  }

  if (passwordInput.value.length < 8) {
    alert("비밀번호는 8자 이상 입력해주세요.");
    return;
  }

  /* 비밀번호 일치 확인 */
  if (passwordInput.value !== passwordConfirmInput.value) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  /* 닉네임 확인 */
  if (nicknameInput.value.trim() === "") {
    alert("닉네임을 입력해주세요.");
    return;
  }

  if (
    nicknameInput.value.trim().length < 2 ||
    nicknameInput.value.trim().length > 10
  ) {
    alert("닉네임은 2자 이상 10자 이하로 입력해주세요.");
    return;
  }

  /* 약관 동의 확인 */
  if (!agreeInput.checked) {
    alert("이용약관 및 개인정보처리방침에 동의해주세요.");
    return;
  }

  /* 회원 정보 */
  const user = {
    email: emailInput.value.trim(),
    password: passwordInput.value,
    nickname: nicknameInput.value.trim(),
  };

  /* 회원 정보 저장 */
  localStorage.setItem("user", JSON.stringify(user));

  alert("회원가입이 완료되었어요!");

  /* 로그인 이메일 자동 입력 */
  loginEmailInput.value = user.email;

  /* 로그인 화면으로 이동 */
  showLogin();
});

/* 로그인 */
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  /* 이메일 확인 */
  if (loginEmailInput.value.trim() === "") {
    alert("이메일을 입력해주세요.");
    return;
  }

  /* 비밀번호 확인 */
  if (loginPasswordInput.value.trim() === "") {
    alert("비밀번호를 입력해주세요.");
    return;
  }

  /* 저장된 회원 정보 */
  const user = JSON.parse(localStorage.getItem("user"));

  /* 회원가입 정보가 없는 경우 */
  if (!user) {
    alert("회원가입 정보가 없습니다.");
    showSignup();
    return;
  }

  /* 이메일 확인 */
  if (loginEmailInput.value.trim() !== user.email) {
    alert("이메일이 일치하지 않습니다.");
    return;
  }

  /* 비밀번호 확인 */
  if (loginPasswordInput.value !== user.password) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  /* 로그인 상태 저장 */
  localStorage.setItem("isLogin", "true");

  alert("로그인되었어요!");

  location.href = "../index.html";
});

/* 로그인 화면으로 이동 */
loginButton.addEventListener("click", function () {
  showLogin();
});

/* 회원가입 화면으로 이동 */
signupLinkButton.addEventListener("click", function () {
  showSignup();
});

/* 로그인 화면 */
function showLogin() {
  signupArea.style.display = "none";
  loginArea.style.display = "block";
}

/* 회원가입 화면 */
function showSignup() {
  loginArea.style.display = "none";
  signupArea.style.display = "block";
}

/* 처음 화면 */
showSignup();
