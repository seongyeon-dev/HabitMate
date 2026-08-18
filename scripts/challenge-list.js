/* 챌린지 목록 */
const challengeList = document.querySelector(".challenge-list");
const tabButtons = document.querySelectorAll(".tab-button");

/* 저장된 챌린지 가져오기 */
let challenges = JSON.parse(localStorage.getItem("challenges")) || [];

/* 오늘 날짜 */
const today = new Date();
today.setHours(0, 0, 0, 0);

/* 종료된 챌린지 상태 변경 */
challenges.forEach(function (challenge) {
  const endDate = new Date(challenge.endDate);
  endDate.setHours(0, 0, 0, 0);

  /* 종료일이 지난 경우 */
  if (today > endDate) {
    challenge.status = "completed";
  } else if (!challenge.status) {

  /* 상태가 없는 기존 챌린지 */
    challenge.status = "ongoing";
  }
});

/* 상태 저장 */
localStorage.setItem("challenges", JSON.stringify(challenges));

/* 챌린지 목록 출력 */
function renderChallenges(status) {
  challengeList.innerHTML = "";

  /* 상태에 맞는 챌린지 */
  const filteredChallenges = challenges.filter(function (challenge) {
    return challenge.status === status;
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

  /* 챌린지 카드 만들기 */
  filteredChallenges.forEach(function (challenge) {
    const challengeCard = document.createElement("article");

    challengeCard.className = "challenge-card";

    /* 종료 날짜 */
    const endDate = new Date(challenge.endDate);
    endDate.setHours(0, 0, 0, 0);

    /* 남은 기간 */
    let remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    if (remainingDays < 0) {
      remainingDays = 0;
    }

    /* 성공 일수 */
    const successDays = challenge.successDays || 0;

    /* 기간 */
    const period = challenge.period || 1;

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

    /* 이동할 페이지 */
    let detailPage = "";

    if (challenge.status === "completed") {
      detailPage = "challenge-report.html?id=" + challenge.id;
    } else {
      detailPage = "challenge-detail.html?id=" + challenge.id;
    }

    /* 챌린지 카드 */
    challengeCard.innerHTML = `
            <div class="challenge-icon">
                <span>${challenge.icon || "🎯"}</span>
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
                            style="width: ${progress}%;">
                        </div>
                    </div>

                    <strong>
                        ${progress}%
                    </strong>

                </div>

            </div>

            <a
                href="${detailPage}"
                class="detail-button"
                aria-label="챌린지 상세 보기">
                &gt;
            </a>
        `;

    challengeList.append(challengeCard);
  });
}

/* 탭 선택 */
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

/* 처음 화면 */
renderChallenges("ongoing");
