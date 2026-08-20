/* 현재 사용자 */
const currentUserId = localStorage.getItem("currentUserId") || "local-user";

/* 저장된 챌린지 */
const challenges = JSON.parse(localStorage.getItem("challenges")) || [];

/* 챌린지 참여자 */
const participants =
  JSON.parse(localStorage.getItem("challengeParticipants")) || [];

/* 오늘 날짜 */
const today = new Date();

today.setHours(0, 0, 0, 0);

/* 날짜 문자열 만들기 */
function getDateText(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

/* 오늘 날짜 문자열 */
const todayText = getDateText(today);

/* 내 챌린지 참여 정보 가져오기 */
function getMyParticipant(challengeId) {
  return participants.find(function (participant) {
    return (
      String(participant.challengeId) === String(challengeId) &&
      participant.participantId === currentUserId
    );
  });
}

/* 개인 성공 일수 */
function getParticipantSuccessDays(participant) {
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

/* 개인 진행률 */
function getParticipantProgress(challenge) {
  const participant = getMyParticipant(challenge.id);

  if (!participant) {
    return 0;
  }

  const successDays = getParticipantSuccessDays(participant);

  const period = challenge.period || 1;

  let progress = Math.round((successDays / period) * 100);

  if (progress > 100) {
    progress = 100;
  }

  return progress;
}

/* -------------------------------- */
/* 연속 기록 */
/* -------------------------------- */

/* 모든 성공 날짜 */
let successDates = [];

/*
  현재 사용자의
  챌린지 인증 기록만 사용
*/
participants.forEach(function (participant) {
  if (participant.participantId !== currentUserId) {
    return;
  }

  const records = Array.isArray(participant.checkRecords)
    ? participant.checkRecords
    : [];

  records.forEach(function (record) {
    if (record.success === true && record.date) {
      successDates.push(record.date);
    }
  });
});

/* 중복 날짜 제거 */
successDates = [...new Set(successDates)];

successDates.sort();

/* 현재 연속 기록 */
let streak = 0;

if (successDates.length > 0) {
  const sortedDates = successDates.slice().sort().reverse();

  const checkDate = new Date(today);

  /*
    오늘 성공 기록이 없다면
    어제부터 연속 기록 확인
  */
  if (sortedDates[0] !== todayText) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const expectedDate = getDateText(checkDate);

    if (successDates.includes(expectedDate)) {
      streak++;

      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
}

/* 최고 연속 기록 */
let currentStreak = 0;

let maxStreak = 0;

for (let i = 0; i < successDates.length; i++) {
  if (i === 0) {
    currentStreak = 1;

    maxStreak = 1;

    continue;
  }

  const previousDate = new Date(successDates[i - 1] + "T00:00:00");

  const currentDate = new Date(successDates[i] + "T00:00:00");

  const difference = Math.round(
    (currentDate - previousDate) / (1000 * 60 * 60 * 24),
  );

  if (difference === 1) {
    currentStreak++;
  } else {
    currentStreak = 1;
  }

  if (currentStreak > maxStreak) {
    maxStreak = currentStreak;
  }
}

/* 연속 기록 화면 */
const streakCount = document.querySelector(".streak-count");

const recordItems = document.querySelectorAll(".record-item");

if (streakCount) {
  streakCount.innerText = streak;
}

if (recordItems[0]) {
  const streakBest = recordItems[0].querySelector(".record-text > span");

  if (streakBest) {
    streakBest.innerText = "최고 " + maxStreak + "일";
  }
}

/* -------------------------------- */
/* 이번 주 달성률 */
/* -------------------------------- */

/* 이번 주 월요일 */
const currentDay = today.getDay();

const monday = new Date(today);

const mondayDifference = currentDay === 0 ? -6 : 1 - currentDay;

monday.setDate(today.getDate() + mondayDifference);

/* 주간 성공 / 전체 */
let weekTotalCount = 0;

let weekSuccessCount = 0;

const checkDate = new Date(monday);

while (checkDate <= today) {
  const dateText = getDateText(checkDate);

  /*
    해당 날짜에 진행 중이면서
    내가 참여한 챌린지
  */
  const activeChallenges = challenges.filter(function (challenge) {
    const participant = getMyParticipant(challenge.id);

    if (!participant) {
      return false;
    }

    const startDate = new Date(challenge.startDate + "T00:00:00");

    const endDate = new Date(challenge.endDate + "T00:00:00");

    return checkDate >= startDate && checkDate <= endDate;
  });

  activeChallenges.forEach(function (challenge) {
    weekTotalCount++;

    const participant = getMyParticipant(challenge.id);

    const records =
      participant && Array.isArray(participant.checkRecords)
        ? participant.checkRecords
        : [];

    const success = records.some(function (record) {
      return record.date === dateText && record.success === true;
    });

    if (success) {
      weekSuccessCount++;
    }
  });

  checkDate.setDate(checkDate.getDate() + 1);
}

/* 이번 주 달성률 */
let weekPercent = 0;

if (weekTotalCount > 0) {
  weekPercent = Math.round((weekSuccessCount / weekTotalCount) * 100);
}

/* 이번 주 달성률 화면 */
const weekPercentText = document.querySelector(".week-percent");

const weekProgressBar = document.querySelector(".week-progress-bar");

if (weekPercentText) {
  weekPercentText.innerText = weekPercent + "%";
}

if (weekProgressBar) {
  weekProgressBar.style.width = weekPercent + "%";
}

if (recordItems[1]) {
  const weekCountText = recordItems[1].querySelector(".record-text > span");

  if (weekCountText) {
    weekCountText.innerText = "목표 " + weekSuccessCount + "/" + weekTotalCount;
  }
}

/* -------------------------------- */
/* 오늘 목표 */
/* -------------------------------- */

const goalList = document.querySelector(".goal-list");

const goalPercent = document.querySelector(".goal-percent");

const goalProgressBar = document.querySelector(".goal-progress-bar");

const summaryCount = document.querySelector(".summary-count");

const summaryMessage = document.querySelector(".summary-message");

/* 저장된 목표 */
const goals = JSON.parse(localStorage.getItem("goals")) || [];

/* 오늘 목표 */
const todayGoals = goals.filter(function (goal) {
  return goal.date === todayText;
});

/* 오늘 목표 출력 */
function renderGoals() {
  if (!goalList) {
    return;
  }

  goalList.innerHTML = "";

  /* 목표 없음 */
  if (todayGoals.length === 0) {
    goalList.innerHTML = "<p>오늘 등록된 목표가 없습니다.</p>";

    updateGoalProgress();

    return;
  }

  todayGoals.forEach(function (goal) {
    const goalItem = document.createElement("div");

    goalItem.className = "goal-item display-flex align-items-center";

    if (goal.completed) {
      goalItem.classList.add("complete");
    }

    goalItem.innerHTML = `
        <span class="goal-name">
          ${goal.name}
        </span>

        <span class="goal-state">
          ${goal.completed ? "완료" : "진행 중"}
        </span>
      `;

    goalList.append(goalItem);
  });

  updateGoalProgress();
}

/* 오늘 목표 달성률 */
function updateGoalProgress() {
  const totalCount = todayGoals.length;

  const completedCount = todayGoals.filter(function (goal) {
    return goal.completed;
  }).length;

  let percent = 0;

  if (totalCount > 0) {
    percent = Math.round((completedCount / totalCount) * 100);
  }

  if (goalPercent) {
    goalPercent.textContent = percent + "%";
  }

  if (goalProgressBar) {
    goalProgressBar.style.width = percent + "%";
  }

  if (summaryCount) {
    summaryCount.textContent =
      "오늘 목표 " + totalCount + "개 중 " + completedCount + "개 완료했어요!";
  }

  if (!summaryMessage) {
    return;
  }

  if (totalCount === 0) {
    summaryMessage.textContent = "기록에서 오늘의 목표를 추가해보세요!";
  } else if (percent === 100) {
    summaryMessage.textContent = "오늘 목표를 모두 달성했어요! 🎉";
  } else if (completedCount > 0) {
    summaryMessage.textContent = "좋아요! 남은 목표도 이어서 해보세요.";
  } else {
    summaryMessage.textContent = "오늘도 하나씩 시작해보세요!";
  }
}

/* -------------------------------- */
/* 함께하는 챌린지 */
/* -------------------------------- */

/*
  HTML에 아래 클래스가 있을 경우
  자동으로 참여자 출력

  .mate-list
  .mate-count
*/
const mateList = document.querySelector(".mate-list");

const mateCount = document.querySelector(".mate-count");

/*
  현재 진행 중인 함께 도전 챌린지
*/
const togetherChallenge = challenges.find(function (challenge) {
  if (challenge.mode !== "together") {
    return false;
  }

  const startDate = new Date(challenge.startDate + "T00:00:00");

  const endDate = new Date(challenge.endDate + "T00:00:00");

  return (
    challenge.status !== "completed" && today >= startDate && today <= endDate
  );
});

/*
  목업용 표시 이름

  실제 회원 DB 연결 후에는
  participant.userName 등으로 교체
*/
const mockNames = ["김다혜", "이지은", "박서연", "참여자"];

/* 함께하는 챌린지 출력 */
function renderTogetherChallenge() {
  if (!mateList || !togetherChallenge) {
    return;
  }

  mateList.innerHTML = "";

  const challengeMembers = participants.filter(function (participant) {
    return String(participant.challengeId) === String(togetherChallenge.id);
  });

  let completeCount = 0;

  challengeMembers.forEach(function (participant, index) {
    const records = Array.isArray(participant.checkRecords)
      ? participant.checkRecords
      : [];

    const todayRecord = records.find(function (record) {
      return record.date === todayText;
    });

    const completed = todayRecord && todayRecord.success === true;

    if (completed) {
      completeCount++;
    }

    let name = "";

    if (participant.participantId === currentUserId) {
      name = "나";
    } else {
      name = participant.name || mockNames[index] || "참여자";
    }

    const firstLetter = name === "나" ? "나" : name.charAt(0);

    const memberItem = document.createElement("div");

    memberItem.className = "mate-item";

    if (participant.participantId === currentUserId) {
      memberItem.classList.add("me");
    }

    memberItem.innerHTML = `
        <div class="mate-profile">
          ${firstLetter}
        </div>

        <p>
          ${name}
        </p>

        <strong>
          ${completed ? "인증 완료" : "인증 전"}
        </strong>
      `;

    mateList.append(memberItem);
  });

  if (mateCount) {
    mateCount.innerText =
      "오늘 인증 " + completeCount + " / " + challengeMembers.length + "명";
  }
}

/* -------------------------------- */
/* 진행 중 챌린지 */
/* -------------------------------- */

const challengeList = document.querySelector(".challenge-list");

/* 내가 참여한 진행 중 챌린지 */
const ongoingChallenges = challenges.filter(function (challenge) {
  const participant = getMyParticipant(challenge.id);

  if (!participant) {
    return false;
  }

  const startDate = new Date(challenge.startDate + "T00:00:00");

  const endDate = new Date(challenge.endDate + "T00:00:00");

  return (
    challenge.status !== "completed" && today >= startDate && today <= endDate
  );
});

/* 챌린지 출력 */
function renderChallenges() {
  if (!challengeList) {
    return;
  }

  challengeList.innerHTML = "";

  /* 진행 중 없음 */
  if (ongoingChallenges.length === 0) {
    challengeList.innerHTML = "<p>현재 진행 중인 챌린지가 없습니다.</p>";

    return;
  }

  /* 홈 최대 2개 */
  const homeChallenges = ongoingChallenges.slice(0, 2);

  homeChallenges.forEach(function (challenge) {
    const challengeCard = document.createElement("article");

    challengeCard.className = "challenge-card display-flex align-items-center";

    /* 진행 일차 */
    const startDate = new Date(challenge.startDate + "T00:00:00");

    let challengeDay =
      Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;

    if (challengeDay < 1) {
      challengeDay = 1;
    }

    if (challengeDay > challenge.period) {
      challengeDay = challenge.period;
    }

    /* 도전 방식 */
    const challengeType = challenge.mode === "together" ? "함께" : "혼자";

    /* 내 개인 진행률 */
    const progress = getParticipantProgress(challenge);

    challengeCard.innerHTML = `
        <div class="challenge-image">
          <span>
            ${challenge.icon || "🎯"}
          </span>
        </div>

        <div class="challenge-info">

          <span class="challenge-type">
            ${challengeType}
          </span>

          <h3>
            ${challenge.title}
          </h3>

          <p>
            ${challenge.period}일 챌린지 |
            <strong>
              ${challengeDay}일차
            </strong>
          </p>

          <div class="progress">
            <div
              class="progress-bar"
              style="width: ${progress}%;">
            </div>
          </div>

        </div>

        <strong class="challenge-percent">
          ${progress}%
        </strong>

        <span class="challenge-arrow">
          &gt;
        </span>
      `;

    /* 상세 이동 */
    challengeCard.addEventListener("click", function () {
      location.href = "./html/challenge-detail.html?id=" + challenge.id;
    });

    challengeList.append(challengeCard);
  });
}

/* -------------------------------- */
/* 처음 화면 */
/* -------------------------------- */

renderGoals();

renderTogetherChallenge();

renderChallenges();
