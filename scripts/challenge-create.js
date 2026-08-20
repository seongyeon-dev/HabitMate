/* 현재 사용자 */
const currentUserId = localStorage.getItem("currentUserId") || "local-user";

/* 카테고리 선택 */
const categoryItems = document.querySelectorAll(".category-item");
const customGoalForm = document.querySelector(".custom-goal-form");

categoryItems.forEach(function (item) {
  item.addEventListener("click", function () {
    categoryItems.forEach(function (category) {
      category.classList.remove("active");
    });

    item.classList.add("active");

    const category = item.dataset.category;

    if (category === "custom") {
      customGoalForm.style.display = "block";
    } else {
      customGoalForm.style.display = "none";
    }
  });
});

/* 목표 설정 */
const goalValue = document.querySelector('input[name="goalValue"]');
const goalUnit = document.querySelector('select[name="goalUnit"]');

/* 제목 글자 수 */
const titleInput = document.querySelector('input[name="title"]');
const titleCount = document.querySelector(".title-count");

titleInput.addEventListener("input", function () {
  titleCount.innerText = titleInput.value.length;
});

/* 목표 설명 글자 수 */
const descriptionInput = document.querySelector('textarea[name="description"]');

const descriptionCount = document.querySelector(".description-count");

descriptionInput.addEventListener("input", function () {
  descriptionCount.innerText = descriptionInput.value.length;
});

/* 시작일, 종료일 */
const startDate = document.querySelector('input[name="startDate"]');
const endDate = document.querySelector('input[name="endDate"]');

/* 기간 선택 */
const periodButtons = document.querySelectorAll(".period-list button");

let selectedPeriod = null;

periodButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    /* 선택한 기간을 다시 누르면 선택 해제 */
    if (button.classList.contains("active")) {
      button.classList.remove("active");

      selectedPeriod = null;
      endDate.value = "";

      return;
    }

    /* 다른 기간 선택 */
    periodButtons.forEach(function (item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    selectedPeriod = parseInt(button.innerText, 10);

    if (startDate.value !== "") {
      updateEndDate();
    }
  });
});

/* 시작일 변경 */
startDate.addEventListener("change", function () {
  if (selectedPeriod !== null) {
    updateEndDate();
  }
});

/* 종료일 직접 변경 */
endDate.addEventListener("change", function () {
  if (startDate.value === "" || endDate.value === "") {
    return;
  }

  /* 직접 날짜를 변경하면 기간 버튼 선택 해제 */
  periodButtons.forEach(function (button) {
    button.classList.remove("active");
  });

  selectedPeriod = null;
});

/* 종료일 자동 계산 */
function updateEndDate() {
  if (startDate.value === "" || selectedPeriod === null) {
    return;
  }

  const date = new Date(startDate.value + "T00:00:00");

  date.setDate(date.getDate() + selectedPeriod - 1);

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  endDate.value = year + "-" + month + "-" + day;
}

/* 실제 챌린지 기간 계산 */
function calculatePeriod(start, end) {
  const startValue = new Date(start + "T00:00:00");

  const endValue = new Date(end + "T00:00:00");

  const difference = endValue - startValue;

  const dayMilliseconds = 1000 * 60 * 60 * 24;

  return Math.floor(difference / dayMilliseconds) + 1;
}

/* 도전 방식 */
const participationOptions = document.querySelectorAll(".participation-option");

const inviteSection = document.querySelector(".invite-section");

const soloRewardSection = document.querySelector(".solo-reward-section");

const groupPenaltySection = document.querySelector(".group-penalty-section");

let selectedMode = "solo";

participationOptions.forEach(function (button) {
  button.addEventListener("click", function () {
    participationOptions.forEach(function (item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    selectedMode = button.dataset.mode;

    /* 혼자 도전 */
    if (selectedMode === "solo") {
      soloRewardSection.style.display = "block";

      groupPenaltySection.style.display = "none";

      inviteSection.style.display = "none";
    } else {
      /* 함께 도전 */
      soloRewardSection.style.display = "none";

      groupPenaltySection.style.display = "block";

      inviteSection.style.display = "block";
    }
  });
});

/* 성공 보상 , 실패 약속 선택 */
const rewardOptions = document.querySelectorAll(".reward-option");

rewardOptions.forEach(function (button) {
  button.addEventListener("click", function () {
    const rewardList = button.closest(".reward-option-list");

    const buttons = rewardList.querySelectorAll(".reward-option");

    buttons.forEach(function (item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    /* 직접 설정 입력창 */
    const section = button.closest(
      ".solo-reward-section, .group-penalty-section",
    );

    const customInput = section.querySelector(".custom-reward-input");

    if (button.classList.contains("custom-reward-option")) {
      customInput.style.display = "block";
    } else {
      customInput.style.display = "none";
    }
  });
});

/* 랜덤 초대 코드 생성 */
function createInviteCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let randomCode = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);

    randomCode += characters[randomIndex];
  }

  return "HABIT" + randomCode;
}

/* 초대 코드 중복 확인 */
function createUniqueInviteCode() {
  const challenges = JSON.parse(localStorage.getItem("challenges")) || [];

  let inviteCode = createInviteCode();

  let isDuplicate = challenges.some(function (challenge) {
    return challenge.inviteCode === inviteCode;
  });

  while (isDuplicate) {
    inviteCode = createInviteCode();

    isDuplicate = challenges.some(function (challenge) {
      return challenge.inviteCode === inviteCode;
    });
  }

  return inviteCode;
}

/* 챌린지 생성 */
const challengeForm = document.querySelector(".challenge-form");

challengeForm.addEventListener("submit", function (event) {
  event.preventDefault();

  /* 제목 확인 */
  if (titleInput.value.trim() === "") {
    alert("챌린지 제목을 입력해주세요.");

    return;
  }

  /* 카테고리 확인 */
  const activeCategory = document.querySelector(".category-item.active");

  if (!activeCategory) {
    alert("카테고리를 선택해주세요.");

    return;
  }

  const selectedCategory = activeCategory.dataset.category;

  /* 직접 설정 확인 */
  let customGoalValue = "";

  if (selectedCategory === "custom") {
    const customGoal = document.querySelector('input[name="customGoal"]');

    if (customGoal.value.trim() === "") {
      alert("나만의 목표를 입력해주세요.");

      return;
    }

    customGoalValue = customGoal.value.trim();
  }

  /* 나의 개인 목표 확인 */
  const selectedGoalValue = Number(goalValue.value);

  if (
    goalValue.value === "" ||
    Number.isNaN(selectedGoalValue) ||
    selectedGoalValue <= 0
  ) {
    alert("나의 목표를 설정해주세요.");

    return;
  }

  /* 시작일 확인 */
  if (startDate.value === "") {
    alert("챌린지 시작일을 선택해주세요.");

    return;
  }

  /* 종료일 확인 */
  if (endDate.value === "") {
    alert("챌린지 종료일을 선택해주세요.");

    return;
  }

  /* 실제 기간 계산 */
  const period = calculatePeriod(startDate.value, endDate.value);

  if (period <= 0) {
    alert("종료일은 시작일 이후로 설정해주세요.");

    return;
  }

  /* 카테고리 이모지 */
  let categoryIcon = "🎯";

  if (selectedCategory === "exercise") {
    categoryIcon = "🏃";
  } else if (selectedCategory === "diet") {
    categoryIcon = "🥗";
  } else if (selectedCategory === "water") {
    categoryIcon = "💧";
  } else if (selectedCategory === "sleep") {
    categoryIcon = "🌙";
  } else if (selectedCategory === "custom") {
    categoryIcon = "✏️";
  }

  /* 성공 보상 / 실패 약속 */
  let reward = "";
  let promise = "";

  /* 혼자 도전 */
  if (selectedMode === "solo") {
    const selectedReward = soloRewardSection.querySelector(
      ".reward-option.active",
    );

    if (
      selectedReward &&
      selectedReward.classList.contains("custom-reward-option")
    ) {
      const customReward = document.querySelector(
        'input[name="soloCustomReward"]',
      );

      reward = customReward.value.trim();
    } else if (selectedReward) {
      reward = selectedReward.innerText.trim();
    }
  } else {
    /* 함께 도전 */
    const selectedPromise = groupPenaltySection.querySelector(
      ".reward-option.active",
    );

    if (
      selectedPromise &&
      selectedPromise.classList.contains("custom-reward-option")
    ) {
      const customPromise = document.querySelector(
        'input[name="togetherCustomPromise"]',
      );

      promise = customPromise.value.trim();
    } else if (selectedPromise) {
      promise = selectedPromise.innerText.trim();
    }
  }

  /* 초대 코드 */
  let inviteCode = null;

  if (selectedMode === "together") {
    inviteCode = createUniqueInviteCode();
  }

  /* 챌린지 ID */
  const challengeId = Date.now();

  /* 챌린지 공통 정보 */
  const challenge = {
    id: challengeId,

    title: titleInput.value.trim(),

    description: descriptionInput.value.trim(),

    category: selectedCategory,

    icon: categoryIcon,

    customGoal: customGoalValue,

    /* 공통 단위 */
    unit: goalUnit.value,

    /* 기존 detail 코드 호환용 */
    goalUnit: goalUnit.value,

    /* 생성자 개인 목표 호환용 */
    myGoal: {
      value: selectedGoalValue,
      unit: goalUnit.value,
    },

    period: period,

    startDate: startDate.value,

    endDate: endDate.value,

    mode: selectedMode,

    reward: reward,

    promise: promise,

    inviteCode: inviteCode,

    progress: 0,

    successDays: 0,

    checkRecords: [],

    status: "ongoing",
  };

  /* 저장된 챌린지 */
  const challenges = JSON.parse(localStorage.getItem("challenges")) || [];

  /* 챌린지 추가 */
  challenges.push(challenge);

  /* 챌린지 저장 */
  localStorage.setItem("challenges", JSON.stringify(challenges));

  /* 참여자 정보 */
  const participants =
    JSON.parse(localStorage.getItem("challengeParticipants")) || [];

  const creatorParticipant = {
    challengeId: challengeId,

    participantId: currentUserId,

    role: "owner",

    personalGoal: selectedGoalValue,

    unit: goalUnit.value,

    successDays: 0,

    checkRecords: [],

    joinedAt: new Date().toISOString(),
  };

  participants.push(creatorParticipant);

  /* 참여자 정보 저장 */
  localStorage.setItem("challengeParticipants", JSON.stringify(participants));

  /* 생성 완료 */
  if (selectedMode === "together") {
    alert("챌린지가 만들어졌어요!\n초대 코드 : " + inviteCode);
  } else {
    alert("챌린지가 만들어졌어요!");
  }

  /* 챌린지 목록 이동 */
  location.href = "challenge-list.html";
});

/* 처음 화면 설정 */
customGoalForm.style.display = "none";

soloRewardSection.style.display = "block";

groupPenaltySection.style.display = "none";

inviteSection.style.display = "none";

/* 기간 선택 초기화 */
periodButtons.forEach(function (button) {
  button.classList.remove("active");
});

selectedPeriod = null;

/* 직접 설정 입력창 숨기기 */
document.querySelectorAll(".custom-reward-input").forEach(function (input) {
  input.style.display = "none";
});
