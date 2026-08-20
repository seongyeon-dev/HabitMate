/* 챌린지 목록 */
const challengeList = document.querySelector(".challenge-list");
const tabButtons = document.querySelectorAll(".tab-button");

/* 초대코드 참여 */
const inviteCodeInput = document.querySelector("#invite-code");
const inviteCheckButton = document.querySelector("#invite-check-button");
const inviteMessage = document.querySelector("#invite-message");

const joinChallengeBox = document.querySelector("#join-challenge-box");
const joinChallengeTitle = document.querySelector("#join-challenge-title");
const joinChallengePeriod = document.querySelector("#join-challenge-period");
const joinCategory = document.querySelector(".join-category");

const personalGoalInput = document.querySelector("#personal-goal");
const goalUnit = document.querySelector("#goal-unit");
const joinChallengeButton = document.querySelector("#join-challenge-button");

/* 현재 사용자 */
const currentUserId = localStorage.getItem("currentUserId") || "local-user";

/* 저장된 챌린지 */
let challenges = JSON.parse(localStorage.getItem("challenges")) || [];

/* 참여자 정보 */
let participants =
  JSON.parse(localStorage.getItem("challengeParticipants")) || [];

/* 현재 초대코드로 찾은 챌린지 */
let selectedChallenge = null;

/* 오늘 날짜 */
const today = new Date();

today.setHours(0, 0, 0, 0);


/* 공통 함수 */


/* 날짜 만들기 */
function createDate(dateText) {
  return new Date(dateText + "T00:00:00");
}

/* 목표 단위 표시 */
function getGoalUnit(unit) {
  if (unit === "step") {
    return "보";
  }

  if (unit === "liter" || unit === "l" || unit === "L") {
    return "L";
  }

  if (unit === "ml") {
    return "ml";
  }

  if (unit === "minute") {
    return "분";
  }

  if (unit === "time") {
    return "회";
  }

  if (unit === "hour") {
    return "시간";
  }

  return unit || "";
}

/* 카테고리 이름 */
function getCategoryName(category) {
  if (category === "exercise") {
    return "운동";
  }

  if (category === "diet") {
    return "식단";
  }

  if (category === "water") {
    return "물 마시기";
  }

  if (category === "sleep") {
    return "수면";
  }

  if (category === "custom") {
    return "직접 설정";
  }

  return "챌린지";
}

/* 내 참여 정보 */
function getMyParticipant(challengeId) {
  return participants.find(function (participant) {
    return (
      String(participant.challengeId) === String(challengeId) &&
      participant.participantId === currentUserId
    );
  });
}

/* 성공 일수 계산 */
function getSuccessDays(participant) {
  if (!participant) {
    return 0;
  }

  const records = Array.isArray(participant.checkRecords)
    ? participant.checkRecords
    : [];

  return records.filter(function (record) {
    return record.success === true;
  }).length;
}

challenges = challenges.filter(function (challenge) {
  return (
    challenge &&
    challenge.id !== undefined &&
    challenge.id !== null &&
    challenge.title &&
    challenge.startDate &&
    challenge.endDate
  );
});

localStorage.setItem("challenges", JSON.stringify(challenges));

/* 종료 상태 갱신 */
challenges.forEach(function (challenge) {
  const endDate = createDate(challenge.endDate);

  if (today > endDate) {
    challenge.status = "completed";
  } else {
    challenge.status = "ongoing";
  }
});

localStorage.setItem("challenges", JSON.stringify(challenges));

/* 챌린지 목록 */
function renderChallenges(status) {
  challengeList.innerHTML = "";

  /* 실제로 참여하고 있는 챌린지만 표시 */
  const filteredChallenges = challenges.filter(function (challenge) {
    const myParticipant = getMyParticipant(challenge.id);

    return challenge.status === status && myParticipant;
  });

  /* 챌린지가 없는 경우 */
  if (filteredChallenges.length === 0) {
    const emptyMessage = document.createElement("div");

    emptyMessage.className = "challenge-empty";

    if (status === "ongoing") {
      emptyMessage.innerText = "진행 중인 챌린지가 없어요.";
    } else {
      emptyMessage.innerText = "완료한 챌린지가 없어요.";
    }

    challengeList.append(emptyMessage);

    return;
  }

  /* 챌린지 카드 */
  filteredChallenges.forEach(function (challenge) {
    const challengeCard = document.createElement("article");

    challengeCard.className = "challenge-card";

    /* 종료 날짜 */
    const endDate = createDate(challenge.endDate);

    /* 남은 기간 */
    let remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    if (remainingDays < 0) {
      remainingDays = 0;
    }

    /* 내 참여 정보 */
    const myParticipant = getMyParticipant(challenge.id);

    /* 성공 일수 */
    const successDays = getSuccessDays(myParticipant);

    /* successDays 값도 참여자 데이터와 동기화 */
    if (myParticipant) {
      myParticipant.successDays = successDays;
    }

    /* 기간 */
    const period = Number(challenge.period) || 1;

    /* 진행률 */
    let progress = Math.round((successDays / period) * 100);

    if (progress > 100) {
      progress = 100;
    }

    /* 날짜 표시 */
    let dateText = "";

    if (challenge.status === "completed") {
      dateText = "완료";
    } else {
      dateText = "D-" + remainingDays;
    }

    /* 참여 문구 */
    let participationText = "";

    if (challenge.status === "completed") {
      participationText = successDays + " / " + period + "일 완료";
    } else {
      participationText = successDays + " / " + period + "일 참여 중";
    }

    /* 이동 페이지 */
    let detailPage = "";

    if (challenge.status === "completed") {
      detailPage =
        "challenge-report.html?id=" + encodeURIComponent(challenge.id);
    } else {
      detailPage =
        "challenge-detail.html?id=" + encodeURIComponent(challenge.id);
    }

    /* 카드 내용 */
    challengeCard.innerHTML = `
      <div class="challenge-icon">
        <span>
          ${challenge.icon || "🎯"}
        </span>
      </div>

      <div class="challenge-info">

        <div class="challenge-title">

          <h2>
            ${challenge.title}
          </h2>

          <strong>
            ${dateText}
          </strong>

        </div>

        <p>
          ${participationText}
        </p>

        <div class="challenge-progress-area">

          <div class="challenge-progress">

            <div
              class="challenge-progress-bar"
              style="width: ${progress}%;"
            ></div>

          </div>

          <strong>
            ${progress}%
          </strong>

        </div>

      </div>

      <a
        href="${detailPage}"
        class="detail-button"
        aria-label="챌린지 상세 보기"
      >
        &gt;
      </a>
    `;

    challengeList.append(challengeCard);
  });

  /* 참여자 성공일 동기화 저장 */
  localStorage.setItem("challengeParticipants", JSON.stringify(participants));
}


  /* 탭 */
tabButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    tabButtons.forEach(function (item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    const status = button.dataset.status;

    renderChallenges(status);
  });
});

  /* 초대코드 확인 */
inviteCheckButton.addEventListener("click", function () {
  const inputCode = inviteCodeInput.value.trim().toUpperCase();

  /* 입력 안 함 */
  if (!inputCode) {
    inviteMessage.innerText = "초대코드를 입력해주세요.";

    selectedChallenge = null;

    joinChallengeBox.classList.add("hidden");

    return;
  }

  /* 초대코드 챌린지 찾기 */
  selectedChallenge = challenges.find(function (challenge) {
    return (
      challenge.inviteCode && challenge.inviteCode.toUpperCase() === inputCode
    );
  });

  /* 없음 */
  if (!selectedChallenge) {
    inviteMessage.innerText = "일치하는 초대코드가 없어요.";

    joinChallengeBox.classList.add("hidden");

    return;
  }

  /* 종료 */
  if (selectedChallenge.status === "completed") {
    inviteMessage.innerText = "이미 종료된 챌린지예요.";

    joinChallengeBox.classList.add("hidden");

    selectedChallenge = null;

    return;
  }

  /* 이미 참여 */
  const myParticipant = getMyParticipant(selectedChallenge.id);

  if (myParticipant) {
    inviteMessage.innerText = "이미 참여 중인 챌린지예요.";

    joinChallengeBox.classList.add("hidden");

    selectedChallenge = null;

    return;
  }

  /* 확인 성공 */
  inviteMessage.innerText = "참여할 챌린지를 확인했어요.";

  /* 카테고리 */
  if (joinCategory) {
    const categoryName = getCategoryName(selectedChallenge.category);

    joinCategory.innerText =
      (selectedChallenge.icon || "🎯") + " " + categoryName;
  }

  /* 제목 */
  joinChallengeTitle.innerText = selectedChallenge.title;

  /* 기간 */
  joinChallengePeriod.innerText =
    selectedChallenge.startDate + " ~ " + selectedChallenge.endDate;

  /* 목표 단위 */
  const selectedUnit =
    selectedChallenge.unit || selectedChallenge.goalUnit || "";

  goalUnit.innerText = getGoalUnit(selectedUnit);

  /* 목표 초기화 */
  personalGoalInput.value = "";

  /* 참여 영역 표시 */
  joinChallengeBox.classList.remove("hidden");
});

/* 엔터로 초대코드 확인 */
inviteCodeInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    inviteCheckButton.click();
  }
});

/* 챌린지 참여 */

joinChallengeButton.addEventListener("click", function () {
  if (!selectedChallenge) {
    alert("초대코드를 먼저 확인해주세요.");

    return;
  }

  /* 개인 목표 */
  const personalGoal = Number(personalGoalInput.value);

  if (Number.isNaN(personalGoal) || personalGoal <= 0) {
    alert("나의 목표를 입력해주세요.");

    personalGoalInput.focus();

    return;
  }

  participants =
    JSON.parse(localStorage.getItem("challengeParticipants")) || [];

  /* 중복 확인 */
  const alreadyJoined = participants.some(function (participant) {
    return (
      String(participant.challengeId) === String(selectedChallenge.id) &&
      participant.participantId === currentUserId
    );
  });

  if (alreadyJoined) {
    alert("이미 참여 중인 챌린지예요.");

    return;
  }

  /* 단위 */
  const selectedUnit =
    selectedChallenge.unit || selectedChallenge.goalUnit || "";

  /* 참여자 정보 */
  const participant = {
    challengeId: selectedChallenge.id,

    participantId: currentUserId,

    role: "member",

    personalGoal: personalGoal,

    unit: selectedUnit,

    successDays: 0,

    progress: 0,

    checkRecords: [],

    joinedAt: new Date().toISOString(),
  };

  /* 참여자 추가 */
  participants.push(participant);

  /* 저장 */
  localStorage.setItem("challengeParticipants", JSON.stringify(participants));

  alert("챌린지에 참여했어요!");

  /* 상세 이동 */
  location.href =
    "challenge-detail.html?id=" + encodeURIComponent(selectedChallenge.id);
});

/* 처음 화면 */
renderChallenges("ongoing");
