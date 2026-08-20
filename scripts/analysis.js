/* 저장된 챌린지 */
const challenges = JSON.parse(localStorage.getItem("challenges")) || [];

/* 저장된 개인 기록 */
const personalRecords =
  JSON.parse(localStorage.getItem("personalRecords")) || [];

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

/* 모든 인증 기록 가져오기 */
let allCheckRecords = [];

challenges.forEach(function (challenge) {
  const records = Array.isArray(challenge.checkRecords)
    ? challenge.checkRecords
    : [];

  records.forEach(function (record) {
    allCheckRecords.push({
      date: record.date,
      success: record.success,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
    });
  });
});

/* 분석 요약 */
const summaryCards = document.querySelectorAll(".summary-card");

/* 완료한 챌린지 */
const completedChallenges = challenges.filter(function (challenge) {
  return challenge.status === "completed";
});

/* 평균 달성률 */
let averageRate = 0;

if (challenges.length > 0) {
  const totalRate = challenges.reduce(function (sum, challenge) {
    const successDays = challenge.successDays || 0;
    const period = challenge.period || 1;

    const rate = Math.round((successDays / period) * 100);

    return sum + rate;
  }, 0);

  averageRate = Math.round(totalRate / challenges.length);
}

/* 연속 성공 계산 */
const successDates = allCheckRecords
  .filter(function (record) {
    return record.success === true;
  })
  .map(function (record) {
    return record.date;
  });

/* 중복 날짜 제거 */
const uniqueSuccessDates = [...new Set(successDates)];

/* 날짜 순서 정렬 */
uniqueSuccessDates.sort();

/* 현재 연속 성공 */
let streak = 0;

if (uniqueSuccessDates.length > 0) {
  const sortedDates = uniqueSuccessDates.slice().sort().reverse();

  const todayText = getDateText(today);

  let checkDate = new Date(today);

  /* 오늘 성공 기록이 없으면 어제부터 확인 */
  if (!sortedDates.includes(todayText)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const expectedDate = getDateText(checkDate);

    if (sortedDates.includes(expectedDate)) {
      streak++;

      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
}

/* 연속 성공 화면 */
if (summaryCards[0]) {
  summaryCards[0].querySelector("strong").innerHTML =
    streak + "<span>일</span>";
}

/* 평균 달성률 화면 */
if (summaryCards[1]) {
  summaryCards[1].querySelector("strong").innerHTML =
    averageRate + "<span>%</span>";
}

/* 완료한 챌린지 화면 */
if (summaryCards[2]) {
  summaryCards[2].querySelector("strong").innerHTML =
    completedChallenges.length + "<span>개</span>";
}

/* 이번 주 요일 */
const weekLabels = ["월", "화", "수", "목", "금", "토", "일"];

const currentDay = today.getDay();
const monday = new Date(today);

const mondayDifference = currentDay === 0 ? -6 : 1 - currentDay;

monday.setDate(today.getDate() + mondayDifference);

const weekRates = [];

/* 주간 달성률 계산 */
for (let i = 0; i < 7; i++) {
  const date = new Date(monday);

  date.setDate(monday.getDate() + i);

  const dateText = getDateText(date);

  /* 미래 날짜 */
  if (date > today) {
    weekRates.push(null);
    continue;
  }

  /* 해당 날짜 진행 중 챌린지 */
  const activeChallenges = challenges.filter(function (challenge) {
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return date >= start && date <= end;
  });

  /* 챌린지가 없는 날짜 */
  if (activeChallenges.length === 0) {
    weekRates.push(null);
    continue;
  }

  /* 해당 날짜 성공 챌린지 */
  let successCount = 0;

  activeChallenges.forEach(function (challenge) {
    const records = Array.isArray(challenge.checkRecords)
      ? challenge.checkRecords
      : [];

    const successRecord = records.find(function (record) {
      return record.date === dateText && record.success === true;
    });

    if (successRecord) {
      successCount++;
    }
  });

  /* 날짜별 달성률 */
  const rate = Math.round((successCount / activeChallenges.length) * 100);

  weekRates.push(rate);
}

/* 주간 달성률 차트 */
const weekChart = document.querySelector("#weekChart");

if (weekChart) {
  new Chart(weekChart, {
    type: "bar",

    data: {
      labels: weekLabels,

      datasets: [
        {
          data: weekRates,
          backgroundColor: "#2bb24c",
          borderRadius: 7,
          barThickness: 36,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },

        tooltip: {
          callbacks: {
            label: function (context) {
              if (context.raw === null) {
                return "미기록";
              }

              return context.raw + "%";
            },
          },
        },
      },

      scales: {
        y: {
          beginAtZero: true,
          max: 100,

          ticks: {
            stepSize: 25,

            callback: function (value) {
              return value + "%";
            },
          },

          grid: {
            color: "#eeeeee",
          },

          border: {
            display: false,
          },
        },

        x: {
          grid: {
            display: false,
          },

          border: {
            display: false,
          },
        },
      },
    },
  });
}

/* 체중 기록 가져오기 */
function getWeightRecords(days) {
  const startDate = new Date(today);

  startDate.setDate(today.getDate() - (days - 1));

  return personalRecords
    .filter(function (record) {
      if (!record.date) {
        return false;
      }

      if (
        record.weight === null ||
        record.weight === undefined ||
        record.weight === ""
      ) {
        return false;
      }

      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);

      return recordDate >= startDate && recordDate <= today;
    })
    .map(function (record) {
      return {
        date: record.date,
        weight: Number(record.weight),
      };
    })
    .filter(function (record) {
      return Number.isFinite(record.weight);
    })
    .sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });
}

/* 체중 날짜 표시 */
function getWeightDateLabel(dateText) {
  const date = new Date(dateText);

  return date.getMonth() + 1 + "/" + date.getDate();
}

/* 체중 변화 차트 */
const weightCanvas = document.querySelector("#weightChart");

const weightPeriodSelect = document.querySelector(".weight-period-select");

const weightChange = document.querySelector(".weight-change");

let weightChartInstance = null;

/* 체중 그래프 출력 */
function renderWeightChart(days) {
  if (!weightCanvas) {
    return;
  }

  const records = getWeightRecords(days);

  const labels = records.map(function (record) {
    return getWeightDateLabel(record.date);
  });

  const weights = records.map(function (record) {
    return record.weight;
  });

  /* 기존 차트 제거 */
  if (weightChartInstance) {
    weightChartInstance.destroy();
  }

  /* 체중 기록 없음 */
  if (records.length === 0) {
    if (weightChange) {
      weightChange.innerText = "기록 없음";
    }

    weightChartInstance = new Chart(weightCanvas, {
      type: "line",

      data: {
        labels: [],

        datasets: [
          {
            data: [],
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false,
          },
        },

        scales: {
          y: {
            display: true,

            grid: {
              color: "#eeeeee",
            },

            border: {
              display: false,
            },
          },

          x: {
            display: true,

            grid: {
              display: false,
            },

            border: {
              display: false,
            },
          },
        },
      },
    });

    return;
  }

  /* 기간 변화 */
  if (weightChange) {
    if (records.length < 2) {
      weightChange.innerText = "비교 기록 부족";
    } else {
      const firstWeight = records[0].weight;
      const lastWeight = records[records.length - 1].weight;

      const difference = Number((lastWeight - firstWeight).toFixed(1));

      if (difference > 0) {
        weightChange.innerText = "+" + difference.toFixed(1) + "kg";
      } else if (difference < 0) {
        weightChange.innerText = difference.toFixed(1) + "kg";
      } else {
        weightChange.innerText = "0.0kg";
      }
    }
  }

  weightChartInstance = new Chart(weightCanvas, {
    type: "line",

    data: {
      labels: labels,

      datasets: [
        {
          data: weights,
          borderColor: "#2bb24c",
          backgroundColor: "rgba(43,178,76,0.08)",
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#2bb24c",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          tension: 0.3,
          fill: true,
          spanGaps: true,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      layout: {
        padding: {
          bottom: 12,
        },
      },

      plugins: {
        legend: {
          display: false,
        },

        tooltip: {
          callbacks: {
            label: function (context) {
              return context.raw + "kg";
            },
          },
        },
      },

      scales: {
        y: {
          ticks: {
            callback: function (value) {
              return value + "kg";
            },
          },

          grid: {
            color: "#eeeeee",
          },

          border: {
            display: false,
          },
        },

        x: {
          grid: {
            display: false,
          },

          ticks: {
            padding: 8,
          },

          border: {
            display: false,
          },
        },
      },
    },
  });
}

/* 최초 체중 그래프 */
renderWeightChart(7);

/* 체중 조회 기간 변경 */
if (weightPeriodSelect) {
  weightPeriodSelect.addEventListener("change", function () {
    const days = Number(weightPeriodSelect.value);

    renderWeightChart(days);
  });
}

/* 실패가 가장 잦은 요일 */
const dayNames = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
];

const dayStats = [0, 0, 0, 0, 0, 0, 0];
const dayTotal = [0, 0, 0, 0, 0, 0, 0];

challenges.forEach(function (challenge) {
  const start = new Date(challenge.startDate);
  const end = new Date(challenge.endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const lastDate = end < today ? end : today;

  const date = new Date(start);

  while (date <= lastDate) {
    const dateText = getDateText(date);
    const dayIndex = date.getDay();

    dayTotal[dayIndex]++;

    const records = Array.isArray(challenge.checkRecords)
      ? challenge.checkRecords
      : [];

    const success = records.some(function (record) {
      return record.date === dateText && record.success === true;
    });

    if (!success) {
      dayStats[dayIndex]++;
    }

    date.setDate(date.getDate() + 1);
  }
});

let worstDayIndex = -1;
let highestFailRate = 0;

for (let i = 0; i < 7; i++) {
  if (dayTotal[i] === 0) {
    continue;
  }

  const failRate = Math.round((dayStats[i] / dayTotal[i]) * 100);

  if (worstDayIndex === -1 || failRate > highestFailRate) {
    worstDayIndex = i;
    highestFailRate = failRate;
  }
}

/* 실패 요일 화면 */
const failValue = document.querySelector(".fail-value");

const failRateText = document.querySelector(
  ".result-card:first-child .result-text p strong",
);

if (worstDayIndex === -1) {
  failValue.innerText = "기록 없음";
  failRateText.innerText = "-";
} else {
  failValue.innerText = dayNames[worstDayIndex];
  failRateText.innerText = highestFailRate + "%";
}

/* 가장 성공률 높은 챌린지 */
let bestChallenge = null;
let bestRate = -1;

challenges.forEach(function (challenge) {
  const successDays = challenge.successDays || 0;
  const period = challenge.period || 1;

  const rate = Math.round((successDays / period) * 100);

  if (rate > bestRate) {
    bestRate = rate;
    bestChallenge = challenge;
  }
});

const successValue = document.querySelector(".success-value");

const successRateText = document.querySelector(
  ".result-card:nth-child(2) .result-text p strong",
);

const successEmoji = document.querySelector(
  ".result-card:nth-child(2) .result-emoji",
);

if (bestChallenge) {
  successValue.innerText = bestChallenge.title;
  successRateText.innerText = bestRate + "%";
  successEmoji.innerText = bestChallenge.icon || "🎯";
} else {
  successValue.innerText = "기록 없음";
  successRateText.innerText = "-";
  successEmoji.innerText = "🎯";
}

/* 최근 4주 달성률 */
const rateLabels = ["3주 전", "2주 전", "1주 전", "이번 주"];

const rateValues = [];

for (let week = 3; week >= 0; week--) {
  const weekStart = new Date(monday);

  weekStart.setDate(monday.getDate() - week * 7);

  const weekEnd = new Date(weekStart);

  weekEnd.setDate(weekStart.getDate() + 6);

  if (weekEnd > today) {
    weekEnd.setTime(today.getTime());
  }

  let totalCount = 0;
  let successCount = 0;

  challenges.forEach(function (challenge) {
    const challengeStart = new Date(challenge.startDate);
    const challengeEnd = new Date(challenge.endDate);

    challengeStart.setHours(0, 0, 0, 0);
    challengeEnd.setHours(0, 0, 0, 0);

    const start = challengeStart > weekStart ? challengeStart : weekStart;

    const end = challengeEnd < weekEnd ? challengeEnd : weekEnd;

    if (start > end) {
      return;
    }

    const date = new Date(start);

    while (date <= end) {
      totalCount++;

      const dateText = getDateText(date);

      const records = Array.isArray(challenge.checkRecords)
        ? challenge.checkRecords
        : [];

      const success = records.some(function (record) {
        return record.date === dateText && record.success === true;
      });

      if (success) {
        successCount++;
      }

      date.setDate(date.getDate() + 1);
    }
  });

  if (totalCount === 0) {
    rateValues.push(null);
  } else {
    const rate = Math.round((successCount / totalCount) * 100);

    rateValues.push(rate);
  }
}

/* 달성률 추이 차트 */
const rateChart = document.querySelector("#rateChart");

if (rateChart) {
  new Chart(rateChart, {
    type: "line",

    data: {
      labels: rateLabels,

      datasets: [
        {
          data: rateValues,
          borderColor: "#2bb24c",
          backgroundColor: "rgba(43,178,76,0.08)",
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#2bb24c",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          tension: 0.3,
          fill: true,
          spanGaps: false,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      /* 차트 내부 아래쪽 여백 */
      layout: {
        padding: {
          bottom: 12,
        },
      },

      plugins: {
        legend: {
          display: false,
        },

        tooltip: {
          callbacks: {
            label: function (context) {
              if (context.raw === null) {
                return "기록 없음";
              }

              return context.raw + "%";
            },
          },
        },
      },

      scales: {
        y: {
          beginAtZero: true,
          max: 100,

          ticks: {
            stepSize: 25,

            callback: function (value) {
              return value + "%";
            },
          },

          grid: {
            color: "#eeeeee",
          },

          border: {
            display: false,
          },
        },

        x: {
          grid: {
            display: false,
          },

          ticks: {
            padding: 8,
          },

          border: {
            display: false,
          },
        },
      },
    },
  });
}
