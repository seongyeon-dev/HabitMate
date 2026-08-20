/** 선택한 챌린지 */
const params = new URLSearchParams(window.location.search);
const challengeId = params.get("id");

/** 현재 사용자 */
const currentUserId = localStorage.getItem("currentUserId") || "local-user";

/** 저장된 챌린지 */
let challenges = JSON.parse(localStorage.getItem("challenges")) || [];

/** 참여자 정보 */
let participants =
  JSON.parse(localStorage.getItem("challengeParticipants")) || [];

/** 선택한 챌린지 찾기 */
let challenge = challenges.find(function (item) {
  return String(item.id) === String(challengeId);
});

/** 현재 사용자의 참여 정보 */
let myParticipant = participants.find(function (participant) {
  return (
    String(participant.challengeId) === String(challengeId) &&
    participant.participantId === currentUserId
  );
});

/** 오늘 날짜 */
const today = new Date();
today.setHours(0, 0, 0, 0);

/** 챌린지를 찾지 못한 경우 */
if (!challenge) {
  alert("챌린지 정보를 찾을 수 없어요.");

  location.href = "challenge-list.html";
}

/** 참여 정보가 없는 경우 */
if (challenge && !myParticipant) {
  alert("참여 중인 챌린지가 아니에요.");

  location.href = "challenge-list.html";
}

/** 챌린지 종료 확인 */
if (challenge) {
  const endDate = new Date(challenge.endDate);

  endDate.setHours(0, 0, 0, 0);

  if (today > endDate) {
    challenge.status = "completed";

    const challengeIndex = challenges.findIndex(function (item) {
      return String(item.id) === String(challengeId);
    });

    if (challengeIndex !== -1) {
      challenges[challengeIndex] = challenge;

      localStorage.setItem("challenges", JSON.stringify(challenges));
    }

    location.href =
      "challenge-report.html?id=" + encodeURIComponent(challenge.id);
  }
}

/** 목표 단위 */
function getGoalUnit(unit) {
  if (unit === "step") {
    return "보";
  }

  if (unit === "minute") {
    return "분";
  }

  if (unit === "time") {
    return "회";
  }

  if (unit === "ml") {
    return "ml";
  }

  if (unit === "liter" || unit === "l" || unit === "L") {
    return "L";
  }

  if (unit === "hour") {
    return "시간";
  }

  return unit || "";
}

/** 개인 성공 일수 */
function getMySuccessDays() {
  if (!myParticipant) {
    return 0;
  }

  if (!Array.isArray(myParticipant.checkRecords)) {
    myParticipant.checkRecords = [];
  }

  return myParticipant.checkRecords.filter(function (record) {
    return record.success === true;
  }).length;
}

/** 개인 진행률 */
function getMyProgress() {
  if (!challenge) {
    return 0;
  }

  const successDays = getMySuccessDays();

  const period = Number(challenge.period) || 1;

  let progress = Math.round((successDays / period) * 100);

  if (progress > 100) {
    progress = 100;
  }

  return progress;
}

/** 참여자 정보 저장 */
function saveParticipants() {
  if (!myParticipant) {
    return;
  }

  const participantIndex = participants.findIndex(function (participant) {
    return (
      String(participant.challengeId) === String(challengeId) &&
      participant.participantId === currentUserId
    );
  });

  if (participantIndex !== -1) {
    participants[participantIndex] = myParticipant;
  }

  localStorage.setItem("challengeParticipants", JSON.stringify(participants));
}

/** 참여자 목록 */
const participantList = document.querySelector(".participant-list");

/** 참여자 이름 가져오기 */
function getParticipantName(participant) {
  if (participant.participantId === currentUserId) {
    return "나";
  }

  if (participant.name) {
    return participant.name;
  }

  if (participant.nickname) {
    return participant.nickname;
  }

  return "참여자";
}

/** 참여자 프로필 글자 */
function getParticipantInitial(name) {
  if (name === "나") {
    return "나";
  }

  if (!name) {
    return "?";
  }

  return name.charAt(0);
}

/** 참여자 화면 출력 */
function renderParticipants() {
  if (!participantList || !challenge) {
    return;
  }

  /** 기존 목업 참여자 제거 */
  participantList.innerHTML = "";

  /** 현재 챌린지 참여자 */
  const challengeParticipants = participants.filter(function (participant) {
    return String(participant.challengeId) === String(challengeId);
  });

  /** 참여자가 없는 경우 */
  if (challengeParticipants.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "participant-empty";

    emptyMessage.innerText = "아직 참여자가 없어요.";

    participantList.append(emptyMessage);

    return;
  }

  /** 참여자 출력 */
  challengeParticipants.forEach(function (participant) {
    const participantElement = document.createElement("div");

    participantElement.className = "participant";

    const name = getParticipantName(participant);

    /** 현재 사용자 표시 */
    if (participant.participantId === currentUserId) {
      participantElement.classList.add("me");
    }

    participantElement.innerHTML = `
      <div class="member-avatar">
        ${getParticipantInitial(name)}
      </div>

      <p>
        ${name}
      </p>
    `;

    participantList.append(participantElement);
  });

  /** 함께 도전인 경우 초대 버튼 표시 */
  if (challenge.mode === "together") {
    const inviteMemberButton = document.createElement("button");

    inviteMemberButton.type = "button";

    inviteMemberButton.className = "invite-member";

    inviteMemberButton.innerHTML = `
      <span>+</span>

      <strong>
        초대하기
      </strong>
    `;

    participantList.append(inviteMemberButton);

    /** 초대 버튼 */
    inviteMemberButton.addEventListener("click", function () {
      const inviteCode = challenge.inviteCode || "";

      if (!inviteCode) {
        alert("초대 코드가 없습니다.");

        return;
      }

      alert("초대 코드 : " + inviteCode);
    });
  }
}

/** 선택한 챌린지 정보 표시 */
if (challenge && myParticipant) {
  const challengeImage = document.querySelector(".challenge-image span");

  const challengeTitle = document.querySelector(".challenge-text h2");

  const challengeDescription = document.querySelector(".challenge-text > p");

  const challengeMeta = document.querySelectorAll(".challenge-meta span");

  const challengeDday = document.querySelector(".challenge-dday strong");

  const progressText = document.querySelector(".progress-header strong");

  const progressBar = document.querySelector(".progress-bar");

  const progressDescription = document.querySelector(".progress-section > p");

  const infoItems = document.querySelectorAll(".info-item");

  /** 챌린지 아이콘 */
  if (challengeImage) {
    challengeImage.innerText = challenge.icon || "🎯";
  }

  /** 챌린지 제목 */
  if (challengeTitle) {
    challengeTitle.innerText = challenge.title;
  }

  /** 챌린지 설명 */
  if (challengeDescription) {
    challengeDescription.innerText =
      challenge.description || "설정된 설명이 없습니다.";
  }

  /** 챌린지 기간 */
  if (challengeMeta[0]) {
    challengeMeta[0].innerText =
      challenge.startDate +
      " ~ " +
      challenge.endDate +
      " (" +
      challenge.period +
      "일)";
  }

  /** 도전 방식 */
  if (challengeMeta[1]) {
    if (challenge.mode === "solo") {
      challengeMeta[1].innerText = "혼자 도전";
    } else {
      const challengeParticipants = participants.filter(function (participant) {
        return String(participant.challengeId) === String(challengeId);
      });

      challengeMeta[1].innerText = challengeParticipants.length + "명 참여 중";
    }
  }

  /** 종료 날짜 */
  const endDate = new Date(challenge.endDate);

  endDate.setHours(0, 0, 0, 0);

  /** 남은 날짜 */
  let remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

  if (remainingDays < 0) {
    remainingDays = 0;
  }

  /** D-day */
  if (challengeDday) {
    challengeDday.innerText = "D-" + remainingDays;
  }

  /** 나의 성공 일수 */
  const mySuccessDays = getMySuccessDays();

  /** 나의 진행률 */
  const myProgress = getMyProgress();

  if (progressText) {
    progressText.innerText = myProgress + "%";
  }

  if (progressBar) {
    progressBar.style.width = myProgress + "%";
  }

  if (progressDescription) {
    progressDescription.innerText =
      mySuccessDays + "일 성공 / 총 " + challenge.period + "일";
  }

  /** 챌린지 정보 기간 */
  if (infoItems[0]) {
    const periodText = infoItems[0].querySelector("p");

    if (periodText) {
      periodText.innerText =
        challenge.startDate +
        " ~ " +
        challenge.endDate +
        " (" +
        challenge.period +
        "일)";
    }
  }

  /** 나의 목표 */
  let goalText = "";

  if (
    myParticipant.personalGoal !== null &&
    myParticipant.personalGoal !== undefined &&
    myParticipant.personalGoal !== ""
  ) {
    goalText =
      myParticipant.personalGoal + " " + getGoalUnit(myParticipant.unit);
  } else if (challenge.customGoal) {
    goalText = challenge.customGoal;
  } else {
    goalText = "설정된 목표가 없습니다.";
  }

  if (infoItems[1]) {
    const goalElement = infoItems[1].querySelector("p");

    const goalTitle = infoItems[1].querySelector(".info-title");

    if (goalTitle) {
      goalTitle.innerText = "나의 목표";
    }

    if (goalElement) {
      goalElement.innerText = goalText;
    }
  }

  /** 성공 보상 또는 실패 약속 */
  if (infoItems[2]) {
    const lastInfoTitle = infoItems[2].querySelector(".info-title");

    const lastInfoText = infoItems[2].querySelector("p");

    /** 혼자 도전 */
    if (challenge.mode === "solo") {
      if (lastInfoTitle) {
        lastInfoTitle.innerText = "성공 보상";
      }

      if (lastInfoText) {
        lastInfoText.innerText = challenge.reward || "설정하지 않음";
      }
    } else {
      /** 함께 도전 */
      if (lastInfoTitle) {
        lastInfoTitle.innerText = "실패 시 약속";
      }

      if (lastInfoText) {
        lastInfoText.innerText = challenge.promise || "설정하지 않음";
      }
    }
  }
}

/** 인증 방식 */
const checkTypes = document.querySelectorAll(".check-type");

const photoCheck = document.querySelector(".photo-check");

const textCheck = document.querySelector(".text-check");

/** 인증 방식 선택 */
checkTypes.forEach(function (button) {
  button.addEventListener("click", function () {
    /** 기존 선택 해제 */
    checkTypes.forEach(function (item) {
      item.classList.remove("active");
    });

    /** 현재 선택 */
    button.classList.add("active");

    const type = button.dataset.type;

    /** 사진 인증 */
    if (type === "photo") {
      if (photoCheck) {
        photoCheck.style.display = "block";
      }

      if (textCheck) {
        textCheck.style.display = "none";
      }
    }

    /** 글 인증 */
    if (type === "text") {
      if (photoCheck) {
        photoCheck.style.display = "none";
      }

      if (textCheck) {
        textCheck.style.display = "block";
      }
    }
  });
});

/** 인증 글 */
const checkText = document.querySelector('textarea[name="checkText"]');

/** 인증 글자 수 */
const checkTextCount = document.querySelector(".check-text-count");

/** 글자 수 표시 */
if (checkText && checkTextCount) {
  checkText.addEventListener("input", function () {
    checkTextCount.innerText = checkText.value.length;
  });
}

/** 사진 입력 */
const photoInput = document.querySelector('.photo-check input[type="file"]');

/** 사진 미리보기 */
const photoPreview = document.querySelector(".photo-preview");

/** 선택한 사진 */
let selectedPhoto = null;

/** 사진 선택 */
if (photoInput) {
  photoInput.addEventListener("change", function () {
    const file = photoInput.files[0];

    if (!file) {
      selectedPhoto = null;

      return;
    }

    /** 이미지 파일 확인 */
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일을 선택해주세요.");

      photoInput.value = "";

      selectedPhoto = null;

      return;
    }

    selectedPhoto = file;

    const reader = new FileReader();

    /** 사진 미리보기 출력 */
    reader.addEventListener("load", function () {
      if (!photoPreview) {
        return;
      }

      photoPreview.innerHTML = "";

      const image = document.createElement("img");

      image.src = reader.result;

      image.alt = "인증 사진";

      photoPreview.appendChild(image);
    });

    reader.readAsDataURL(file);
  });
}

/** 오늘 인증 버튼 */
const checkButton = document.querySelector(".check-button");

/** 오늘 인증 */
if (checkButton) {
  checkButton.addEventListener("click", function () {
    const activeType = document.querySelector(".check-type.active");

    /** 인증 방식 확인 */
    if (!activeType) {
      alert("인증 방식을 선택해주세요.");

      return;
    }

    const type = activeType.dataset.type;

    /** 챌린지 확인 */
    if (!challenge) {
      alert("챌린지 정보를 찾을 수 없어요.");

      return;
    }

    /** 참여자 확인 */
    if (!myParticipant) {
      alert("참여 정보를 찾을 수 없어요.");

      return;
    }

    /** 현재 날짜 */
    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);

    /** 종료일 */
    const endDate = new Date(challenge.endDate);

    endDate.setHours(0, 0, 0, 0);

    /** 종료된 챌린지 */
    if (currentDate > endDate) {
      alert("이미 종료된 챌린지입니다.");

      location.href =
        "challenge-report.html?id=" + encodeURIComponent(challenge.id);

      return;
    }

    /** 시작일 */
    const startDate = new Date(challenge.startDate);

    startDate.setHours(0, 0, 0, 0);

    /** 시작 전 챌린지 */
    if (currentDate < startDate) {
      alert("아직 시작하지 않은 챌린지입니다.");

      return;
    }

    /** 사진 인증 확인 */
    if (type === "photo" && selectedPhoto === null) {
      alert("인증할 사진을 선택해주세요.");

      return;
    }

    /** 글 인증 확인 */
    if (type === "text" && (!checkText || checkText.value.trim() === "")) {
      alert("인증 내용을 입력해주세요.");

      return;
    }

    /** 오늘 날짜 문자열 */
    const year = currentDate.getFullYear();

    const month = String(currentDate.getMonth() + 1).padStart(2, "0");

    const day = String(currentDate.getDate()).padStart(2, "0");

    const todayText = year + "-" + month + "-" + day;

    /** 인증 기록 배열 확인 */
    if (!Array.isArray(myParticipant.checkRecords)) {
      myParticipant.checkRecords = [];
    }

    /** 오늘 인증 기록 찾기 */
    const todayRecord = myParticipant.checkRecords.find(function (record) {
      return record.date === todayText;
    });

    /** 이미 인증한 경우 */
    if (todayRecord) {
      alert("오늘은 이미 인증했어요.");

      return;
    }

    /** 인증 데이터 */
    const checkRecord = {
      date: todayText,
      success: true,
      type: type,
    };

    /** 글 인증 내용 저장 */
    if (type === "text") {
      checkRecord.text = checkText.value.trim();
    }

    /** 인증 기록 추가 */
    myParticipant.checkRecords.push(checkRecord);

    /** 성공 일수 */
    myParticipant.successDays = getMySuccessDays();

    /** 진행률 */
    myParticipant.progress = getMyProgress();

    /** 마지막 인증 날짜 */
    myParticipant.lastCheckDate = todayText;

    /** 참여자 정보 저장 */
    saveParticipants();

    /** 진행률 숫자 */
    const progressText = document.querySelector(".progress-header strong");

    /** 진행률 바 */
    const progressBar = document.querySelector(".progress-bar");

    /** 성공 일수 */
    const progressDescription = document.querySelector(".progress-section > p");

    /** 진행률 화면 갱신 */
    if (progressText) {
      progressText.innerText = myParticipant.progress + "%";
    }

    if (progressBar) {
      progressBar.style.width = myParticipant.progress + "%";
    }

    if (progressDescription) {
      progressDescription.innerText =
        myParticipant.successDays + "일 성공 / 총 " + challenge.period + "일";
    }

    /** 인증 완료 버튼 */
    checkButton.innerText = "✓ 오늘 인증 완료";

    checkButton.classList.add("active");

    alert("오늘 인증이 완료되었어요!");
  });
}

/** 오늘 이미 인증했는지 확인 */
function checkTodayCompleted() {
  if (
    !myParticipant ||
    !Array.isArray(myParticipant.checkRecords) ||
    !checkButton
  ) {
    return;
  }

  /** 현재 날짜 */
  const currentDate = new Date();

  const year = currentDate.getFullYear();

  const month = String(currentDate.getMonth() + 1).padStart(2, "0");

  const day = String(currentDate.getDate()).padStart(2, "0");

  const todayText = year + "-" + month + "-" + day;

  /** 오늘 인증 기록 */
  const todayRecord = myParticipant.checkRecords.find(function (record) {
    return record.date === todayText;
  });

  /** 인증 완료 상태 표시 */
  if (todayRecord) {
    checkButton.innerText = "✓ 오늘 인증 완료";

    checkButton.classList.add("active");
  }
}

/** 초대 코드 */
const codeText = document.querySelector(".code");

const copyButton = document.querySelector(".copy-button");

const inviteSection = document.querySelector(".invite-code");

let inviteCode = "";

/** 함께 도전 */
if (challenge && challenge.mode === "together") {
  inviteCode = challenge.inviteCode || "";

  if (codeText) {
    codeText.innerText = inviteCode || "-";
  }

  if (inviteSection) {
    inviteSection.style.display = "block";
  }
} else {
  /** 혼자 도전 */
  if (codeText) {
    codeText.innerText = "-";
  }

  if (inviteSection) {
    inviteSection.style.display = "none";
  }
}

/** 초대 코드 복사 */
if (copyButton) {
  copyButton.addEventListener("click", function () {
    if (!inviteCode) {
      alert("초대 코드가 없습니다.");

      return;
    }

    /** Clipboard API 사용 */
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(inviteCode)
        .then(function () {
          copyComplete();
        })
        .catch(function () {
          fallbackCopy(inviteCode);
        });
    } else {
      fallbackCopy(inviteCode);
    }
  });
}

/** 복사 대체 방법 */
function fallbackCopy(text) {
  const textArea = document.createElement("textarea");

  textArea.value = text;

  textArea.style.position = "fixed";

  textArea.style.opacity = "0";

  document.body.appendChild(textArea);

  textArea.select();

  document.execCommand("copy");

  textArea.remove();

  copyComplete();
}

/** 복사 완료 */
function copyComplete() {
  if (!copyButton) {
    return;
  }

  copyButton.innerText = "복사 완료";

  setTimeout(function () {
    copyButton.innerText = "복사";
  }, 1500);
}

/** 챌린지 삭제 버튼 */
const deleteButton = document.querySelector(".delete-button");

/** 방장만 삭제 버튼 표시 */
if (deleteButton && myParticipant && myParticipant.role !== "owner") {
  deleteButton.style.display = "none";
}

/** 챌린지 삭제 */
if (deleteButton) {
  deleteButton.addEventListener("click", function () {
    /** 챌린지 확인 */
    if (!challenge) {
      alert("삭제할 챌린지 정보를 찾을 수 없어요.");

      return;
    }

    /** 방장 확인 */
    if (!myParticipant || myParticipant.role !== "owner") {
      alert("챌린지를 만든 사람만 삭제할 수 있어요.");

      return;
    }

    /** 삭제 확인 */
    const result = confirm("챌린지를 삭제하시겠어요?");

    if (!result) {
      return;
    }

    /** 챌린지 삭제 */
    challenges = challenges.filter(function (item) {
      return String(item.id) !== String(challengeId);
    });

    /** 해당 챌린지 참여자 삭제 */
    participants = participants.filter(function (participant) {
      return String(participant.challengeId) !== String(challengeId);
    });

    /** 챌린지 저장 */
    localStorage.setItem("challenges", JSON.stringify(challenges));

    /** 참여자 저장 */
    localStorage.setItem("challengeParticipants", JSON.stringify(participants));

    alert("챌린지가 삭제되었어요.");

    location.href = "challenge-list.html";
  });
}

/** 처음 사진 인증 화면 표시 */
if (photoCheck) {
  photoCheck.style.display = "block";
}

/** 처음 글 인증 화면 숨김 */
if (textCheck) {
  textCheck.style.display = "none";
}

/** 실제 참여자 출력 */
renderParticipants();

/** 오늘 인증 상태 확인 */
checkTodayCompleted();
