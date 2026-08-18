/* 저장된 챌린지 */
const challenges =
JSON.parse(localStorage.getItem("challenges")) || [];


/* 오늘 날짜 */
const today =
new Date();

today.setHours(0, 0, 0, 0);


/* 날짜 문자열 만들기 */
function getDateText(date){

const year =
date.getFullYear();

const month =
String(
date.getMonth() + 1
).padStart(2, "0");

const day =
String(
date.getDate()
).padStart(2, "0");

return (
year +
"-" +
month +
"-" +
day
);

}


/* 오늘 날짜 문자열 */
const todayText =
getDateText(today);


/* 모든 성공 날짜 가져오기 */
let successDates = [];

challenges.forEach(function(challenge){

const records =
Array.isArray(challenge.checkRecords)
? challenge.checkRecords
: [];


records.forEach(function(record){

if(record.success === true){

successDates.push(
record.date
);

}

});

});


/* 중복 날짜 제거 */
successDates =
[...new Set(successDates)];

successDates.sort();


/* 연속 기록 계산 */
let streak = 0;

if(successDates.length > 0){

const sortedDates =
successDates
.slice()
.sort()
.reverse();

let checkDate =
new Date(today);


/* 오늘 인증이 없으면 어제부터 확인 */
if(sortedDates[0] !== todayText){

checkDate.setDate(
checkDate.getDate() - 1
);

}


while(true){

const expectedDate =
getDateText(checkDate);


if(
successDates.includes(
expectedDate
)
){

streak++;

checkDate.setDate(
checkDate.getDate() - 1
);

}

else{

break;

}

}

}


/* 최고 연속 기록 계산 */
let currentStreak = 0;
let maxStreak = 0;


for(
let i = 0;
i < successDates.length;
i++
){

if(i === 0){

currentStreak = 1;
maxStreak = 1;

continue;

}


const previousDate =
new Date(
successDates[i - 1]
);

const currentDate =
new Date(
successDates[i]
);


previousDate.setHours(
0,
0,
0,
0
);

currentDate.setHours(
0,
0,
0,
0
);


const difference =
Math.round(
(currentDate - previousDate) /
(1000 * 60 * 60 * 24)
);


if(difference === 1){

currentStreak++;

}

else{

currentStreak = 1;

}


if(currentStreak > maxStreak){

maxStreak =
currentStreak;

}

}


/* 연속 기록 화면 */
const streakCount =
document.querySelector(
".streak-count"
);

const recordItems =
document.querySelectorAll(
".record-item"
);

const streakBest =
recordItems[0]
.querySelector(
".record-text > span"
);


streakCount.innerText =
streak;

streakBest.innerText =
"최고 " +
maxStreak +
"일";


/* 이번 주 시작일 */
const currentDay =
today.getDay();

const monday =
new Date(today);

const mondayDifference =
currentDay === 0
? -6
: 1 - currentDay;


monday.setDate(
today.getDate() +
mondayDifference
);


/* 이번 주 달성률 계산 */
let weekTotalCount = 0;
let weekSuccessCount = 0;

const checkDate =
new Date(monday);


while(checkDate <= today){

const dateText =
getDateText(checkDate);


/* 해당 날짜 진행 중 챌린지 */
const activeChallenges =
challenges.filter(function(challenge){

const startDate =
new Date(
challenge.startDate
);

const endDate =
new Date(
challenge.endDate
);


startDate.setHours(
0,
0,
0,
0
);

endDate.setHours(
0,
0,
0,
0
);


return (
checkDate >= startDate &&
checkDate <= endDate
);

});


activeChallenges.forEach(function(challenge){

weekTotalCount++;


const records =
Array.isArray(
challenge.checkRecords
)
? challenge.checkRecords
: [];


const success =
records.some(function(record){

return (
record.date === dateText &&
record.success === true
);

});


if(success){

weekSuccessCount++;

}

});


checkDate.setDate(
checkDate.getDate() + 1
);

}


/* 이번 주 달성률 */
let weekPercent = 0;

if(weekTotalCount > 0){

weekPercent =
Math.round(
(
weekSuccessCount /
weekTotalCount
) *
100
);

}


/* 이번 주 달성률 화면 */
const weekPercentText =
document.querySelector(
".week-percent"
);

const weekProgressBar =
document.querySelector(
".week-progress-bar"
);

const weekCountText =
recordItems[1]
.querySelector(
".record-text > span"
);


weekPercentText.innerText =
weekPercent +
"%";

weekProgressBar.style.width =
weekPercent +
"%";

weekCountText.innerText =
"목표 " +
weekSuccessCount +
"/" +
weekTotalCount;


/* 오늘 목표 영역 */
const goalList =
document.querySelector(
".goal-list"
);

const goalPercent =
document.querySelector(
".goal-percent"
);

const goalProgressBar =
document.querySelector(
".goal-progress-bar"
);

const summaryCount =
document.querySelector(
".summary-count"
);

const summaryMessage =
document.querySelector(
".summary-message"
);


/* 저장된 목표 불러오기 */
const goals =
JSON.parse(
localStorage.getItem("goals")
) || [];


/* 오늘 날짜 목표 */
const todayGoals =
goals.filter(function(goal){

return (
goal.date === todayText
);

});


/* 오늘 목표 화면 출력 */
function renderGoals(){

goalList.innerHTML = "";


/* 오늘 목표가 없는 경우 */
if(todayGoals.length === 0){

goalList.innerHTML =
"<p>오늘 등록된 목표가 없습니다.</p>";

updateGoalProgress();

return;

}


todayGoals.forEach(function(goal){

const goalItem =
document.createElement("div");

goalItem.className =
"goal-item display-flex align-items-center";


if(goal.completed){

goalItem.classList.add(
"complete"
);

}


goalItem.innerHTML = `

<span class="goal-name">
${goal.name}
</span>

<span class="goal-state">
${goal.completed ? "완료" : "진행 중"}
</span>

`;


goalList.append(
goalItem
);

});


updateGoalProgress();

}


/* 오늘 목표 달성률 계산 */
function updateGoalProgress(){

const totalCount =
todayGoals.length;


const completedCount =
todayGoals.filter(function(goal){

return goal.completed;

}).length;


let percent = 0;


if(totalCount > 0){

percent =
Math.round(
(
completedCount /
totalCount
) *
100
);

}


/* 달성률 숫자 */
goalPercent.textContent =
percent +
"%";


/* 진행률 */
goalProgressBar.style.width =
percent +
"%";


/* 오늘 요약 */
summaryCount.textContent =
"오늘 목표 " +
totalCount +
"개 중 " +
completedCount +
"개 완료했어요!";


/* 요약 메시지 */
if(totalCount === 0){

summaryMessage.textContent =
"기록에서 오늘의 목표를 추가해보세요!";

}

else if(percent === 100){

summaryMessage.textContent =
"오늘 목표를 모두 달성했어요! 🎉";

}

else if(completedCount > 0){

summaryMessage.textContent =
"좋아요! 남은 목표도 이어서 해보세요.";

}

else{

summaryMessage.textContent =
"오늘도 하나씩 시작해보세요!";

}

}


/* 진행 중인 챌린지 */
const challengeList =
document.querySelector(
".challenge-list"
);


/* 현재 진행 중인 챌린지 */
const ongoingChallenges =
challenges.filter(function(challenge){

const startDate =
new Date(
challenge.startDate
);

const endDate =
new Date(
challenge.endDate
);


startDate.setHours(
0,
0,
0,
0
);

endDate.setHours(
0,
0,
0,
0
);


return (
challenge.status !== "completed" &&
today >= startDate &&
today <= endDate
);

});


/* 챌린지 화면 출력 */
function renderChallenges(){

challengeList.innerHTML = "";


/* 진행 중 챌린지가 없는 경우 */
if(ongoingChallenges.length === 0){

challengeList.innerHTML =
"<p>현재 진행 중인 챌린지가 없습니다.</p>";

return;

}


/* 홈에는 최대 2개 표시 */
const homeChallenges =
ongoingChallenges.slice(
0,
2
);


homeChallenges.forEach(function(challenge){

const challengeCard =
document.createElement(
"article"
);


challengeCard.className =
"challenge-card display-flex align-items-center";


/* 진행 일차 */
const startDate =
new Date(
challenge.startDate
);

startDate.setHours(
0,
0,
0,
0
);


let challengeDay =
Math.floor(
(today - startDate) /
(1000 * 60 * 60 * 24)
) + 1;


if(challengeDay < 1){

challengeDay = 1;

}


if(
challengeDay >
challenge.period
){

challengeDay =
challenge.period;

}


/* 도전 방식 */
const challengeType =
challenge.mode === "together"
? "함께"
: "혼자";


/* 진행률 */
const progress =
challenge.progress || 0;


/* 챌린지 카드 */
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
style="width:${progress}%;">
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


/* 챌린지 상세 이동 */
challengeCard.addEventListener(
"click",
function(){

location.href =
"./html/challenge-detail.html?id=" +
challenge.id;

}
);


challengeList.append(
challengeCard
);

});

}


/* 처음 화면 */
renderGoals();

renderChallenges();