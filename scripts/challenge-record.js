/* 날짜 */

const dayItems =
document.querySelectorAll(".day-item");

const monthText =
document.querySelector(".month-area strong");

let selectedDate = "";


/* 날짜 형식 */
function formatDate(date){

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


/* 현재 주 표시 */
function renderWeek(){

const today =
new Date();

today.setHours(0, 0, 0, 0);


/* 이번 주 일요일 */
const startDate =
new Date(today);

startDate.setDate(
today.getDate() - today.getDay()
);


/* 월 표시 */
monthText.innerText =
today.getFullYear() +
"년 " +
(today.getMonth() + 1) +
"월";


dayItems.forEach(function(item, index){

const date =
new Date(startDate);

date.setDate(
startDate.getDate() + index
);

const dateText =
item.querySelector("strong");

dateText.innerText =
date.getDate();


/* 날짜 저장 */
item.dataset.date =
formatDate(date);


/* 오늘 날짜 활성화 */
if(
formatDate(date) ===
formatDate(today)
){

item.classList.add("active");

selectedDate =
formatDate(date);

}

else{

item.classList.remove("active");

}

});

}


/* 날짜 선택 */
dayItems.forEach(function(day){

day.addEventListener("click", function(){

dayItems.forEach(function(item){

item.classList.remove("active");

});

day.classList.add("active");

selectedDate =
day.dataset.date;


/* 선택 날짜 기록 불러오기 */
loadRecord(selectedDate);


/* 선택 날짜 목표 출력 */
renderRecordGoals();

});

});


/* 컨디션 */

const conditionItems =
document.querySelectorAll(".condition-item");

const conditionResultText =
document.querySelector(
".condition-result strong"
);

const conditionResultScore =
document.querySelector(
".condition-result span"
);

let selectedCondition = null;


/* 컨디션 이름 */
const conditionNames = {

1: "매우 나쁨",
2: "나쁨",
3: "보통",
4: "좋음",
5: "매우 좋음"

};


conditionItems.forEach(function(item){

item.addEventListener("click", function(){

conditionItems.forEach(function(button){

button.classList.remove("active");

});

item.classList.add("active");

selectedCondition =
Number(item.dataset.value);

conditionResultText.innerText =
conditionNames[selectedCondition];

conditionResultScore.innerText =
selectedCondition + " / 5";

});

});


/* 체중 */

const weightInput =
document.querySelector(
'input[name="weight"]'
);


/* 메모 */

const memo =
document.querySelector(
'textarea[name="memo"]'
);

const memoCount =
document.querySelector(
".memo-count"
);


memo.addEventListener("input", function(){

memoCount.innerText =
memo.value.length;

});


/* 오늘 목표 */

const recordGoalList =
document.querySelector(
".record-goal-list"
);

const recordGoalCount =
document.querySelector(
".record-goal-count"
);

const recordGoalAddButton =
document.querySelector(
".record-goal-add-button"
);

const recordGoalAddForm =
document.querySelector(
".record-goal-add-form"
);

const recordGoalInput =
document.querySelector(
".record-goal-input"
);

const recordGoalSaveButton =
document.querySelector(
".record-goal-save-button"
);

const recordGoalCancelButton =
document.querySelector(
".record-goal-cancel-button"
);


/* 날짜별 목표 불러오기 */
let goals =
JSON.parse(
localStorage.getItem("goals")
) || [];


/* 목표 저장 */
function saveGoals(){

localStorage.setItem(
"goals",
JSON.stringify(goals)
);

}


/* 선택 날짜 목표 가져오기 */
function getSelectedGoals(){

return goals.filter(function(goal){

return goal.date === selectedDate;

});

}


/* 목표 화면 출력 */
function renderRecordGoals(){

recordGoalList.innerHTML = "";

const selectedGoals =
getSelectedGoals();


/* 목표가 없는 경우 */
if(selectedGoals.length === 0){

recordGoalList.innerHTML =
"<p>등록된 목표가 없습니다.</p>";

recordGoalCount.innerText =
"0 / 0";

return;

}


selectedGoals.forEach(function(goal){

const goalItem =
document.createElement("div");

goalItem.className =
"goal-item";


goalItem.innerHTML = `

<div class="goal-name">

<strong>
${goal.name}
</strong>

</div>


<div class="goal-progress">

<div
class="goal-progress-bar"
style="width:${goal.completed ? "100%" : "0%"}">
</div>

</div>


<p>
${goal.completed ? "완료" : "진행 중"}
</p>


<button
type="button"
class="goal-check ${goal.completed ? "active" : ""}"
data-id="${goal.id}">

${goal.completed ? "✓" : "○"}

</button>


<button
type="button"
class="goal-delete"
data-id="${goal.id}"
aria-label="목표 삭제">

×

</button>

`;


recordGoalList.append(
goalItem
);

});


updateGoalCount();

}


/* 목표 완료 개수 */
function updateGoalCount(){

const selectedGoals =
getSelectedGoals();

const completedCount =
selectedGoals.filter(function(goal){

return goal.completed;

}).length;


recordGoalCount.innerText =
completedCount +
" / " +
selectedGoals.length;

}


/* 목표 추가 버튼 */
recordGoalAddButton.addEventListener(
"click",
function(){

recordGoalAddForm.classList.add(
"active"
);

recordGoalInput.focus();

});


/* 목표 저장 */
recordGoalSaveButton.addEventListener(
"click",
function(){

const goalName =
recordGoalInput.value.trim();


if(goalName === ""){

alert("목표를 입력해주세요.");

return;

}


const newGoal = {

id:
Date.now(),

date:
selectedDate,

name:
goalName,

completed:
false

};


goals.push(
newGoal
);


saveGoals();

renderRecordGoals();


recordGoalInput.value = "";

recordGoalAddForm.classList.remove(
"active"
);

});


/* Enter로 목표 추가 */
recordGoalInput.addEventListener(
"keydown",
function(event){

if(event.key === "Enter"){

recordGoalSaveButton.click();

}

});


/* 목표 추가 취소 */
recordGoalCancelButton.addEventListener(
"click",
function(){

recordGoalInput.value = "";

recordGoalAddForm.classList.remove(
"active"
);

});


/* 목표 체크 / 삭제 */
recordGoalList.addEventListener(
"click",
function(event){


/* 목표 체크 */
if(
event.target.classList.contains(
"goal-check"
)
){

const goalId =
Number(
event.target.dataset.id
);


const goal =
goals.find(function(goal){

return (
goal.id === goalId &&
goal.date === selectedDate
);

});


if(!goal){

return;

}


goal.completed =
!goal.completed;


saveGoals();

renderRecordGoals();

return;

}


/* 목표 삭제 */
if(
event.target.classList.contains(
"goal-delete"
)
){

const goalId =
Number(
event.target.dataset.id
);


goals =
goals.filter(function(goal){

return goal.id !== goalId;

});


saveGoals();

renderRecordGoals();

}

});


/* 기록 불러오기 */

function loadRecord(date){

const personalRecords =
JSON.parse(
localStorage.getItem(
"personalRecords"
)
) || [];


const record =
personalRecords.find(function(item){

return item.date === date;

});


/* 입력 화면 초기화 */
weightInput.value = "";

memo.value = "";

memoCount.innerText = "0";

selectedCondition = null;


conditionItems.forEach(function(item){

item.classList.remove("active");

});


conditionResultText.innerText =
"선택해주세요";

conditionResultScore.innerText =
"- / 5";


/* 저장된 기록이 없으면 종료 */
if(!record){

return;

}


/* 체중 */
if(record.weight !== null){

weightInput.value =
record.weight;

}


/* 메모 */
memo.value =
record.memo || "";

memoCount.innerText =
memo.value.length;


/* 컨디션 */
if(record.condition !== null){

selectedCondition =
record.condition;


conditionItems.forEach(function(item){

if(
Number(item.dataset.value) ===
selectedCondition
){

item.classList.add("active");

}

});


conditionResultText.innerText =
conditionNames[selectedCondition];

conditionResultScore.innerText =
selectedCondition + " / 5";

}

}


/* 기록 저장 */

const saveButton =
document.querySelector(
".save-button"
);


saveButton.addEventListener(
"click",
function(){

const weight =
weightInput.value.trim();

const memoText =
memo.value.trim();

const selectedGoals =
getSelectedGoals();


/* 기록 데이터 */
const recordData = {

date:
selectedDate,

weight:
weight === ""
? null
: Number(weight),

condition:
selectedCondition,

memo:
memoText,

goals:
selectedGoals.map(function(goal){

return {
...goal
};

})

};


/* 기존 기록 */
const personalRecords =
JSON.parse(
localStorage.getItem(
"personalRecords"
)
) || [];


/* 같은 날짜 기록 찾기 */
const existingIndex =
personalRecords.findIndex(
function(record){

return (
record.date ===
selectedDate
);

});


/* 이미 기록 존재 */
if(existingIndex !== -1){

personalRecords[
existingIndex
] = recordData;

}


/* 새로운 기록 */
else{

personalRecords.push(
recordData
);

}


/* 날짜순 정렬 */
personalRecords.sort(
function(a, b){

return (
new Date(a.date) -
new Date(b.date)
);

});


/* 전체 기록 저장 */
localStorage.setItem(
"personalRecords",
JSON.stringify(personalRecords)
);


/* 오늘 날짜 */
const todayText =
formatDate(
new Date()
);


/* 오늘 기록 저장 */
if(
selectedDate ===
todayText
){

localStorage.setItem(
"todayRecord",
JSON.stringify(recordData)
);

}


/* 목표 저장 */
saveGoals();


alert(
selectedDate +
" 기록이 저장되었어요!"
);

});


/* 처음 화면 */

renderWeek();

loadRecord(
selectedDate
);

renderRecordGoals();