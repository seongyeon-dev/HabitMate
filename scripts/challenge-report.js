/* 선택한 챌린지 */
const params = new URLSearchParams(window.location.search);

const challengeId = Number(params.get("id"));

/* 현재 사용자 */
const currentUserId = localStorage.getItem("currentUserId") || "local-user";

/* 저장된 챌린지 */
const challenges = JSON.parse(localStorage.getItem("challenges")) || [];

/* 참여자 정보 */
const participants =
  JSON.parse(localStorage.getItem("challengeParticipants")) || [];

/* 개인 기록 */
const personalRecords =
  JSON.parse(localStorage.getItem("personalRecords")) || [];

/* 선택한 챌린지 찾기 */
const challenge = challenges.find(function (item) {
  return item.id === challengeId;
});

/* 현재 사용자의 참여 정보 */
const myParticipant = participants.find(function (participant) {
  return (
    String(participant.challengeId) === String(challengeId) &&
    participant.participantId === currentUserId
  );
});

/* 챌린지를 찾지 못한 경우 */
if (!challenge) {
  alert("챌린지 정보를 찾을 수 없어요.");

  location.href = "challenge-list.html";
}

/* 참여 정보를 찾지 못한 경우 */
if (challenge && !myParticipant) {
  alert("참여 정보를 찾을 수 없어요.");

  location.href = "challenge-list.html";
}

/* 리포트 표시 */
if (challenge && myParticipant) {
  /* 챌린지 정보 */
  const challengeIcon = document.querySelector(".challenge-icon span");

  const challengeTitle = document.querySelector(".challenge-text h3");

  const challengeDescription =
    document.querySelectorAll(".challenge-text p")[0];

  const challengePeriod = document.querySelectorAll(".challenge-text p")[1];

  /* 아이콘 */
  if (challengeIcon) {
    challengeIcon.innerText = challenge.icon || "🎯";
  }

  /* 제목 */
  if (challengeTitle) {
    challengeTitle.innerText = challenge.title;
  }

  /* 설명 */
  if (challengeDescription) {
    challengeDescription.innerText =
      challenge.description || "설정된 설명이 없습니다.";
  }

  /* 기간 */
  if (challengePeriod) {
    challengePeriod.innerText =
      challenge.startDate +
      " ~ " +
      challenge.endDate +
      " (" +
      challenge.period +
      "일)";
  }

  /* 상단 안내 문구 */
  const reportDescription = document.querySelector(".report-title p");

  if (reportDescription) {
    reportDescription.innerText =
      challenge.period + "일간의 도전, 어떤 변화가 있었는지 확인해보세요.";
  }

  /* 개인 성공 일수 */
  const successDays = myParticipant.successDays || 0;

  /* 최종 달성률 */
  let finalRate = Math.round((successDays / (challenge.period || 1)) * 100);

  if (finalRate > 100) {
    finalRate = 100;
  }

  const resultRate = document.querySelector(".result-rate strong");

  if (resultRate) {
    resultRate.innerText = finalRate + "%";
  }

  /* 진행률 바 */
  const progressBar = document.querySelector(".result-progress .progress-bar");

  if (progressBar) {
    progressBar.style.width = finalRate + "%";
  }

  /* 성공일 */
  const resultProgressText = document.querySelector(".result-progress p");

  if (resultProgressText) {
    resultProgressText.innerHTML =
      "<strong>" +
      successDays +
      "일 성공</strong> / " +
      challenge.period +
      "일";
  }

  /* 실패일 */
  let failDays = challenge.period - successDays;

  if (failDays < 0) {
    failDays = 0;
  }

  /* 최대 연속 성공일 계산 */
  const maxStreak = calculateMaxStreak(myParticipant.checkRecords || []);

  /* 성공 / 실패 / 연속 성공 */
  const summaryItems = document.querySelectorAll(".summary-item");

  /* 성공 기록 */
  if (summaryItems[0]) {
    const value = summaryItems[0].querySelector("strong");

    if (value) {
      value.innerText = successDays + "일";
    }
  }

  /* 실패 기록 */
  if (summaryItems[1]) {
    const value = summaryItems[1].querySelector("strong");

    if (value) {
      value.innerText = failDays + "일";
    }
  }

  /* 최대 연속 성공 */
  if (summaryItems[2]) {
    const value = summaryItems[2].querySelector("strong");

    if (value) {
      value.innerText = maxStreak + "일";
    }
  }

  /* 종료 날짜 */
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const endDate = new Date(challenge.endDate);

  endDate.setHours(0, 0, 0, 0);

  let passedDays = Math.floor((today - endDate) / (1000 * 60 * 60 * 24));

  if (passedDays < 0) {
    passedDays = 0;
  }

  const challengeEnd = document.querySelector(".challenge-end strong");

  if (challengeEnd) {
    challengeEnd.innerText = "D+" + passedDays;
  }

  /* 체중 / 컨디션 변화 */

  /* 챌린지 시작일 */
  const start = new Date(challenge.startDate);

  start.setHours(0, 0, 0, 0);

  /* 챌린지 시작 7일 전 */
  const beforeStart = new Date(start);

  beforeStart.setDate(beforeStart.getDate() - 7);

  /* 챌린지 시작 전 기록 */
  const beforeRecords = personalRecords.filter(function (record) {
    const recordDate = new Date(record.date);

    recordDate.setHours(0, 0, 0, 0);

    return recordDate >= beforeStart && recordDate < start;
  });

  /* 챌린지 기간 기록 */
  const duringRecords = personalRecords.filter(function (record) {
    const recordDate = new Date(record.date);

    recordDate.setHours(0, 0, 0, 0);

    return recordDate >= start && recordDate <= endDate;
  });

  /* 평균 계산 */
  function calculateAverage(records, property) {
    const values = records
      .map(function (record) {
        return record[property];
      })
      .filter(function (value) {
        return (
          value !== null && value !== undefined && !Number.isNaN(Number(value))
        );
      });

    if (values.length === 0) {
      return null;
    }

    const total = values.reduce(function (sum, value) {
      return sum + Number(value);
    }, 0);

    return total / values.length;
  }

  /* 체중 평균 */
  const beforeWeight = calculateAverage(beforeRecords, "weight");

  const duringWeight = calculateAverage(duringRecords, "weight");

  /* 컨디션 평균 */
  const beforeCondition = calculateAverage(beforeRecords, "condition");

  const duringCondition = calculateAverage(duringRecords, "condition");

  /* 변화 카드 */
  const changeCards = document.querySelectorAll(".change-card");

  /* 체중 카드 */
  if (changeCards[0]) {
    const weightValues = changeCards[0].querySelectorAll(
      ".change-value > div strong",
    );

    const weightChange = changeCards[0].querySelector(".change-value > strong");

    /* 챌린지 전 체중 */
    if (weightValues[0]) {
      if (beforeWeight !== null) {
        weightValues[0].innerText = beforeWeight.toFixed(1) + "kg";
      } else {
        weightValues[0].innerText = "기록 없음";
      }
    }

    /* 챌린지 중 체중 */
    if (weightValues[1]) {
      if (duringWeight !== null) {
        weightValues[1].innerText = duringWeight.toFixed(1) + "kg";
      } else {
        weightValues[1].innerText = "기록 없음";
      }
    }

    /* 체중 변화량 */
    if (weightChange) {
      if (beforeWeight !== null && duringWeight !== null) {
        const difference = duringWeight - beforeWeight;

        if (difference < 0) {
          weightChange.innerText = "↓ " + difference.toFixed(1) + "kg";
        } else if (difference > 0) {
          weightChange.innerText = "↑ +" + difference.toFixed(1) + "kg";
        } else {
          weightChange.innerText = "변화 없음";
        }
      } else {
        weightChange.innerText = "-";
      }
    }
  }

  /* 컨디션 카드 */
  if (changeCards[1]) {
    const conditionValues = changeCards[1].querySelectorAll(
      ".change-value > div strong",
    );

    const conditionChange = changeCards[1].querySelector(
      ".change-value > strong",
    );

    /* 챌린지 전 컨디션 */
    if (conditionValues[0]) {
      if (beforeCondition !== null) {
        conditionValues[0].innerText = beforeCondition.toFixed(1);
      } else {
        conditionValues[0].innerText = "기록 없음";
      }
    }

    /* 챌린지 중 컨디션 */
    if (conditionValues[1]) {
      if (duringCondition !== null) {
        conditionValues[1].innerText = duringCondition.toFixed(1);
      } else {
        conditionValues[1].innerText = "기록 없음";
      }
    }

    /* 컨디션 변화량 */
    if (conditionChange) {
      if (beforeCondition !== null && duringCondition !== null) {
        const difference = duringCondition - beforeCondition;

        if (difference > 0) {
          conditionChange.innerText = "↑ +" + difference.toFixed(1);
        } else if (difference < 0) {
          conditionChange.innerText = "↓ " + difference.toFixed(1);
        } else {
          conditionChange.innerText = "변화 없음";
        }
      } else {
        conditionChange.innerText = "-";
      }
    }
  }

  /* 리포트 코멘트 */
  const commentTexts = document.querySelectorAll(".comment-bubble p");

  if (commentTexts[0]) {
    commentTexts[0].innerText =
      challenge.period + "일 동안 " + successDays + "일 성공했어요!";
  }

  if (commentTexts[1]) {
    commentTexts[1].innerText = "최종 달성률은 " + finalRate + "%예요.";
  }

  if (commentTexts[2]) {
    commentTexts[2].innerText = "다음 챌린지도 꾸준히 도전해봐요!";
  }
}

/* 최대 연속 성공일 계산 */
function calculateMaxStreak(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return 0;
  }

  const successRecords = records
    .filter(function (record) {
      return record.success === true;
    })
    .sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });

  if (successRecords.length === 0) {
    return 0;
  }

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < successRecords.length; i++) {
    const previousDate = new Date(successRecords[i - 1].date + "T00:00:00");

    const currentDate = new Date(successRecords[i].date + "T00:00:00");

    const difference = Math.round(
      (currentDate - previousDate) / (1000 * 60 * 60 * 24),
    );

    if (difference === 1) {
      currentStreak++;

      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else if (difference > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/* 챌린지 삭제 */
const deleteButton = document.querySelector(".delete-button");

/* 방장만 삭제 버튼 표시 */
if (deleteButton && myParticipant && myParticipant.role !== "owner") {
  deleteButton.style.display = "none";
}

if (deleteButton) {
  deleteButton.addEventListener("click", function () {
    if (!myParticipant || myParticipant.role !== "owner") {
      alert("챌린지를 만든 사람만 삭제할 수 있어요.");

      return;
    }

    const result = confirm("이 챌린지와 종료 리포트를 삭제하시겠어요?");

    if (result === false) {
      return;
    }

    /* 선택한 챌린지를 제외 */
    const newChallenges = challenges.filter(function (item) {
      return item.id !== challengeId;
    });

    /* 해당 챌린지 참여자 삭제 */
    const newParticipants = participants.filter(function (participant) {
      return String(participant.challengeId) !== String(challengeId);
    });

    /* 저장 */
    localStorage.setItem("challenges", JSON.stringify(newChallenges));

    localStorage.setItem(
      "challengeParticipants",
      JSON.stringify(newParticipants),
    );

    alert("챌린지가 삭제되었어요.");

    location.href = "challenge-list.html";
  });
}
