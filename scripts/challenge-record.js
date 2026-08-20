/* 캘린더 */
const calendarDays = document.querySelector(".calendar-days");

const currentMonthText = document.querySelector(".current-month");

const prevMonthButton = document.querySelector(".prev-month-button");

const nextMonthButton = document.querySelector(".next-month-button");

/* 날짜 클릭 후 나타나는 기록 영역 */
const recordDetail = document.querySelector(".record-detail");

const selectedDateText = document.querySelector(".selected-date");

const todayButton = document.querySelector(".today-button");

/* 오늘 날짜 */
const today = new Date();

today.setHours(0, 0, 0, 0);

/* 현재 표시 중인 연도 / 월 */
let currentYear = today.getFullYear();

let currentMonth = today.getMonth();

/* 처음에는 날짜를 선택하지 않음 */
let selectedDate = null;

/* 날짜 형식 */
function formatDate(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

/* 선택 날짜 표시 형식 */
function formatSelectedDate(date) {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    date.getFullYear() +
    "년 " +
    (date.getMonth() + 1) +
    "월 " +
    date.getDate() +
    "일 (" +
    weekdays[date.getDay()] +
    ")"
  );
}

/* 문자열 날짜를 Date로 변환 */
function createDate(dateString) {
  return new Date(dateString + "T00:00:00");
}

/* 월 표시 */
function updateMonthText() {
  currentMonthText.innerText = currentYear + "년 " + (currentMonth + 1) + "월";
}

/* 개인 기록 가져오기 */
function getPersonalRecords() {
  return JSON.parse(localStorage.getItem("personalRecords")) || [];
}

/* 컨디션 이모지 */
const conditionEmojis = {
  1: "😡",
  2: "☹️",
  3: "😐",
  4: "🙂",
  5: "😄",
};

/* 컨디션 이름 */
const conditionNames = {
  1: "매우 나쁨",
  2: "나쁨",
  3: "보통",
  4: "좋음",
  5: "매우 좋음",
};

/* 월간 캘린더 출력 */
function renderCalendar() {
  calendarDays.innerHTML = "";

  updateMonthText();

  /* 이번 달 첫 날짜 */
  const firstDate = new Date(currentYear, currentMonth, 1);

  /* 이번 달 마지막 날짜 */
  const lastDate = new Date(currentYear, currentMonth + 1, 0);

  /* 캘린더 시작 날짜 */
  const calendarStart = new Date(firstDate);

  calendarStart.setDate(firstDate.getDate() - firstDate.getDay());

  /* 캘린더 마지막 날짜 */
  const calendarEnd = new Date(lastDate);

  calendarEnd.setDate(lastDate.getDate() + (6 - lastDate.getDay()));

  /* 저장된 개인 기록 */
  const personalRecords = getPersonalRecords();

  let date = new Date(calendarStart);

  while (date <= calendarEnd) {
    const dateValue = formatDate(date);

    /* 날짜 버튼 */
    const dayButton = document.createElement("button");

    dayButton.type = "button";

    dayButton.className = "calendar-day";

    dayButton.dataset.date = dateValue;

    /* 해당 날짜 기록 */
    const record = personalRecords.find(function (item) {
      return item.date === dateValue;
    });

    /* 다른 달 */
    if (date.getMonth() !== currentMonth) {
      dayButton.classList.add("other-month");
    }

    /* 오늘 */
    if (dateValue === formatDate(today)) {
      dayButton.classList.add("today");
    }

    /* 선택한 날짜 */
    if (dateValue === selectedDate) {
      dayButton.classList.add("active");
    }

    /* 미래 / 기록 있음 / 기록 없음 */
    if (date > today) {
      dayButton.classList.add("future");
    } else if (record) {
      dayButton.classList.add("recorded");
    } else {
      dayButton.classList.add("empty");
    }

    /* 날짜 숫자 */
    const dayNumber = document.createElement("span");

    dayNumber.className = "day-number";

    dayNumber.innerText = date.getDate();

    dayButton.append(dayNumber);

    /* 컨디션 표시 */
    const condition = document.createElement("span");

    condition.className = "day-condition";

    if (record && record.condition !== null && record.condition !== undefined) {
      condition.innerText = conditionEmojis[record.condition] || "";
    } else if (date > today) {
      condition.innerText = "";
    } else {
      condition.innerText = "·";
    }

    dayButton.append(condition);

    /* 날짜 클릭 */
    dayButton.addEventListener("click", function () {
      const clickedDate = createDate(dayButton.dataset.date);

      const clickedDateText = dayButton.dataset.date;

      /* 미래 날짜 선택 방지 */
      if (clickedDate > today) {
        return;
      }

      /*
          이미 선택된 날짜를
          다시 누르면 기록 영역 닫기
        */
      if (
        selectedDate === clickedDateText &&
        recordDetail &&
        recordDetail.classList.contains("active")
      ) {
        recordDetail.classList.remove("active");

        selectedDate = null;

        renderCalendar();

        return;
      }

      /* 새 날짜 선택 */
      selectedDate = clickedDateText;

      /*
          앞달 / 다음달 날짜를
          클릭한 경우 해당 월로 이동
        */
      if (
        clickedDate.getFullYear() !== currentYear ||
        clickedDate.getMonth() !== currentMonth
      ) {
        currentYear = clickedDate.getFullYear();

        currentMonth = clickedDate.getMonth();
      }

      /* 화면 갱신 */
      renderCalendar();

      updateSelectedDate();

      loadRecord(selectedDate);

      renderRecordGoals();

      /* 기록 영역 열기 */
      openRecordDetail();
    });

    calendarDays.append(dayButton);

    /* 다음 날짜 */
    date.setDate(date.getDate() + 1);
  }
}

/* 기록 영역 열기 */
function openRecordDetail() {
  if (!recordDetail) {
    return;
  }

  recordDetail.classList.add("active");

  /* 기록 영역으로 부드럽게 이동 */
  setTimeout(function () {
    recordDetail.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
}

/* 선택 날짜 표시 */
function updateSelectedDate() {
  if (!selectedDate) {
    return;
  }

  const date = createDate(selectedDate);

  selectedDateText.innerText = formatSelectedDate(date);
}

/* 이전 달 */
prevMonthButton.addEventListener("click", function () {
  currentMonth--;

  if (currentMonth < 0) {
    currentMonth = 11;

    currentYear--;
  }

  /* 날짜 선택 해제 */
  selectedDate = null;

  /* 기록 영역 닫기 */
  if (recordDetail) {
    recordDetail.classList.remove("active");
  }

  renderCalendar();
});

/* 다음 달 */
nextMonthButton.addEventListener("click", function () {
  currentMonth++;

  if (currentMonth > 11) {
    currentMonth = 0;

    currentYear++;
  }

  /* 날짜 선택 해제 */
  selectedDate = null;

  /* 기록 영역 닫기 */
  if (recordDetail) {
    recordDetail.classList.remove("active");
  }

  renderCalendar();
});

/* 오늘 버튼 */
todayButton.addEventListener("click", function () {
  currentYear = today.getFullYear();

  currentMonth = today.getMonth();

  const todayText = formatDate(today);

  /*
      이미 오늘이 열려 있으면
      다시 눌렀을 때 닫기
    */
  if (
    selectedDate === todayText &&
    recordDetail &&
    recordDetail.classList.contains("active")
  ) {
    recordDetail.classList.remove("active");

    selectedDate = null;

    renderCalendar();

    return;
  }

  selectedDate = todayText;

  renderCalendar();

  updateSelectedDate();

  loadRecord(selectedDate);

  renderRecordGoals();

  openRecordDetail();
});

/* 컨디션 */
const conditionItems = document.querySelectorAll(".condition-item");

const conditionResultText = document.querySelector(".condition-result strong");

const conditionResultScore = document.querySelector(".condition-result span");

let selectedCondition = null;

/* 컨디션 선택 */
conditionItems.forEach(function (item) {
  item.addEventListener("click", function () {
    /*
          이미 선택한 컨디션을
          다시 누르면 선택 해제
        */
    if (item.classList.contains("active")) {
      item.classList.remove("active");

      selectedCondition = null;

      conditionResultText.innerText = "선택해주세요";

      conditionResultScore.innerText = "- / 5";

      return;
    }

    /* 기존 선택 해제 */
    conditionItems.forEach(function (button) {
      button.classList.remove("active");
    });

    /* 새 컨디션 선택 */
    item.classList.add("active");

    selectedCondition = Number(item.dataset.value);

    conditionResultText.innerText = conditionNames[selectedCondition];

    conditionResultScore.innerText = selectedCondition + " / 5";
  });
});

/* 체중 */
const weightInput = document.querySelector('input[name="weight"]');

/* 메모 */
const memo = document.querySelector('textarea[name="memo"]');

const memoCount = document.querySelector(".memo-count");

/* 메모 글자 수 */
memo.addEventListener("input", function () {
  memoCount.innerText = memo.value.length;
});

/* 오늘 목표 */
const recordGoalList = document.querySelector(".record-goal-list");

const recordGoalCount = document.querySelector(".record-goal-count");

const recordGoalAddButton = document.querySelector(".record-goal-add-button");

const recordGoalAddForm = document.querySelector(".record-goal-add-form");

const recordGoalInput = document.querySelector(".record-goal-input");

const recordGoalSaveButton = document.querySelector(".record-goal-save-button");

const recordGoalCancelButton = document.querySelector(
  ".record-goal-cancel-button",
);

const goalEmpty = document.querySelector(".goal-empty");

/* 날짜별 목표 */
let goals = JSON.parse(localStorage.getItem("goals")) || [];

/* 목표 저장 */
function saveGoals() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

/* 선택 날짜 목표 가져오기 */
function getSelectedGoals() {
  if (!selectedDate) {
    return [];
  }

  return goals.filter(function (goal) {
    return goal.date === selectedDate;
  });
}

/* 목표 화면 출력 */
function renderRecordGoals() {
  recordGoalList.innerHTML = "";

  const selectedGoals = getSelectedGoals();

  /* 목표 없음 */
  if (selectedGoals.length === 0) {
    recordGoalCount.innerText = "0 / 0";

    if (goalEmpty) {
      goalEmpty.style.display = "flex";
    }

    return;
  }

  /* 목표 있음 */
  if (goalEmpty) {
    goalEmpty.style.display = "none";
  }

  selectedGoals.forEach(function (goal) {
    const goalItem = document.createElement("div");

    goalItem.className = "goal-item";

    goalItem.innerHTML = `
        <button
          type="button"
          class="goal-check ${goal.completed ? "active" : ""}"
          data-id="${goal.id}"
          aria-label="목표 완료"
        >
          ${goal.completed ? "✓" : ""}
        </button>

        <div class="goal-name">
          <strong>
            ${goal.name}
          </strong>
        </div>

        <button
          type="button"
          class="goal-delete"
          data-id="${goal.id}"
          aria-label="목표 삭제"
        >
          ×
        </button>
      `;

    recordGoalList.append(goalItem);
  });

  updateGoalCount();
}

/* 완료 목표 개수 */
function updateGoalCount() {
  const selectedGoals = getSelectedGoals();

  const completedCount = selectedGoals.filter(function (goal) {
    return goal.completed;
  }).length;

  recordGoalCount.innerText = completedCount + " / " + selectedGoals.length;
}

/* 목표 추가 버튼 */
recordGoalAddButton.addEventListener("click", function () {
  if (!selectedDate) {
    return;
  }

  recordGoalAddForm.classList.add("active");

  recordGoalAddButton.style.display = "none";

  recordGoalInput.focus();
});

/* 목표 저장 */
recordGoalSaveButton.addEventListener("click", function () {
  const goalName = recordGoalInput.value.trim();

  if (goalName === "") {
    alert("목표를 입력해주세요.");

    return;
  }

  const newGoal = {
    id: Date.now(),

    date: selectedDate,

    name: goalName,

    completed: false,
  };

  goals.push(newGoal);

  saveGoals();

  renderRecordGoals();

  recordGoalInput.value = "";

  recordGoalAddForm.classList.remove("active");

  recordGoalAddButton.style.display = "block";
});

/* Enter로 목표 추가 */
recordGoalInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    recordGoalSaveButton.click();
  }
});

/* 목표 추가 취소 */
recordGoalCancelButton.addEventListener("click", function () {
  recordGoalInput.value = "";

  recordGoalAddForm.classList.remove("active");

  recordGoalAddButton.style.display = "block";
});

/* 목표 체크 / 삭제 */
recordGoalList.addEventListener("click", function (event) {
  /* 목표 체크 */
  if (event.target.classList.contains("goal-check")) {
    const goalId = Number(event.target.dataset.id);

    const goal = goals.find(function (goal) {
      return goal.id === goalId && goal.date === selectedDate;
    });

    if (!goal) {
      return;
    }

    goal.completed = !goal.completed;

    saveGoals();

    renderRecordGoals();

    return;
  }

  /* 목표 삭제 */
  if (event.target.classList.contains("goal-delete")) {
    const goalId = Number(event.target.dataset.id);

    goals = goals.filter(function (goal) {
      return goal.id !== goalId;
    });

    saveGoals();

    renderRecordGoals();
  }
});

/* 기록 불러오기 */
function loadRecord(date) {
  const personalRecords = getPersonalRecords();

  const record = personalRecords.find(function (item) {
    return item.date === date;
  });

  /* 입력 화면 초기화 */
  weightInput.value = "";

  memo.value = "";

  memoCount.innerText = "0";

  selectedCondition = null;

  conditionItems.forEach(function (item) {
    item.classList.remove("active");
  });

  conditionResultText.innerText = "선택해주세요";

  conditionResultScore.innerText = "- / 5";

  /* 저장된 기록 없음 */
  if (!record) {
    return;
  }

  /* 체중 */
  if (record.weight !== null && record.weight !== undefined) {
    weightInput.value = record.weight;
  }

  /* 메모 */
  memo.value = record.memo || "";

  memoCount.innerText = memo.value.length;

  /* 컨디션 */
  if (record.condition !== null && record.condition !== undefined) {
    selectedCondition = Number(record.condition);

    conditionItems.forEach(function (item) {
      if (Number(item.dataset.value) === selectedCondition) {
        item.classList.add("active");
      }
    });

    conditionResultText.innerText = conditionNames[selectedCondition];

    conditionResultScore.innerText = selectedCondition + " / 5";
  }
}

/* 기록 저장 */
const saveButton = document.querySelector(".save-button");

saveButton.addEventListener("click", function () {
  if (!selectedDate) {
    alert("날짜를 선택해주세요.");

    return;
  }

  const selectedDateObject = createDate(selectedDate);

  /* 미래 날짜 저장 방지 */
  if (selectedDateObject > today) {
    alert("미래 날짜에는 기록할 수 없어요.");

    return;
  }

  /* 체중 */
  const weight = weightInput.value.trim();

  if (weight !== "" && (Number.isNaN(Number(weight)) || Number(weight) <= 0)) {
    alert("체중을 올바르게 입력해주세요.");

    weightInput.focus();

    return;
  }

  /* 메모 */
  const memoText = memo.value.trim();

  /* 목표 */
  const selectedGoals = getSelectedGoals();

  /* 아무 기록도 없는 경우 */
  if (
    weight === "" &&
    selectedCondition === null &&
    memoText === "" &&
    selectedGoals.length === 0
  ) {
    alert("기록할 내용을 하나 이상 입력해주세요.");

    return;
  }

  /* 기록 데이터 */
  const recordData = {
    date: selectedDate,

    weight: weight === "" ? null : Number(weight),

    condition: selectedCondition,

    memo: memoText,

    goals: selectedGoals.map(function (goal) {
      return {
        ...goal,
      };
    }),
  };

  /* 기존 기록 */
  const personalRecords = getPersonalRecords();

  /* 같은 날짜 기록 찾기 */
  const existingIndex = personalRecords.findIndex(function (record) {
    return record.date === selectedDate;
  });

  /* 기존 기록 수정 */
  if (existingIndex !== -1) {
    personalRecords[existingIndex] = recordData;
  } else {
    /* 새로운 기록 */
    personalRecords.push(recordData);
  }

  /* 날짜순 정렬 */
  personalRecords.sort(function (a, b) {
    return createDate(a.date) - createDate(b.date);
  });

  /* 전체 기록 저장 */
  localStorage.setItem("personalRecords", JSON.stringify(personalRecords));

  /* 오늘 기록 저장 */
  if (selectedDate === formatDate(today)) {
    localStorage.setItem("todayRecord", JSON.stringify(recordData));
  }

  /* 목표 저장 */
  saveGoals();

  /* 캘린더 갱신 */
  renderCalendar();

  alert(selectedDate + " 기록이 저장되었어요!");
});

/* 처음 화면 */

/* 캘린더만 출력 */
renderCalendar();

/* 기록 입력 영역 닫기 */
if (recordDetail) {
  recordDetail.classList.remove("active");
}
