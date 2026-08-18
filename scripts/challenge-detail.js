/* 선택한 챌린지 */
const params =
new URLSearchParams(window.location.search);

const challengeId =
Number(params.get("id"));


/* 저장된 챌린지 */
const challenges =
JSON.parse(localStorage.getItem("challenges")) || [];


/* 선택한 챌린지 찾기 */
const challenge =
challenges.find(function(item){

return item.id === challengeId;

});


/* 오늘 날짜 */
const today =
new Date();

today.setHours(0, 0, 0, 0);


/* 챌린지를 찾지 못한 경우 */
if(!challenge){

alert(
"챌린지 정보를 찾을 수 없어요."
);

location.href =
"challenge-list.html";

}


/* 챌린지 종료 확인 */
if(challenge){

const endDate =
new Date(challenge.endDate);

endDate.setHours(0, 0, 0, 0);


if(today > endDate){

challenge.status =
"completed";


const challengeIndex =
challenges.findIndex(function(item){

return item.id === challengeId;

});


if(challengeIndex !== -1){

challenges[challengeIndex] =
challenge;


localStorage.setItem(
"challenges",
JSON.stringify(challenges)
);

}


/* 종료 리포트 이동 */
location.href =
"challenge-report.html?id=" +
challenge.id;

}

}


/* 선택한 챌린지 정보 표시 */
if(challenge){

const challengeImage =
document.querySelector(
".challenge-image span"
);

const challengeTitle =
document.querySelector(
".challenge-text h2"
);

const challengeDescription =
document.querySelector(
".challenge-text > p"
);

const challengeMeta =
document.querySelectorAll(
".challenge-meta span"
);

const challengeDday =
document.querySelector(
".challenge-dday strong"
);

const progressText =
document.querySelector(
".progress-header strong"
);

const progressBar =
document.querySelector(
".progress-bar"
);

const progressDescription =
document.querySelector(
".progress-section > p"
);

const infoItems =
document.querySelectorAll(
".info-item"
);


/* 제목 */
if(challengeImage){

challengeImage.innerText =
challenge.icon || "🎯";

}


if(challengeTitle){

challengeTitle.innerText =
challenge.title;

}


if(challengeDescription){

challengeDescription.innerText =
challenge.description ||
"설정된 설명이 없습니다.";

}


/* 기간 */
if(challengeMeta[0]){

challengeMeta[0].innerText =
challenge.startDate +
" ~ " +
challenge.endDate +
" (" +
challenge.period +
"일)";

}


/* 도전 방식 */
if(challengeMeta[1]){

if(challenge.mode === "solo"){

challengeMeta[1].innerText =
"혼자 도전";

}

else{

challengeMeta[1].innerText =
"함께 도전";

}

}


/* D-day */
const endDate =
new Date(challenge.endDate);

endDate.setHours(0, 0, 0, 0);


let remainingDays =
Math.ceil(
(endDate - today) /
(1000 * 60 * 60 * 24)
);


if(remainingDays < 0){

remainingDays =
0;

}


if(challengeDday){

challengeDday.innerText =
"D-" +
remainingDays;

}


/* 진행률 */
if(progressText){

progressText.innerText =
(challenge.progress || 0) +
"%";

}


if(progressBar){

progressBar.style.width =
(challenge.progress || 0) +
"%";

}


if(progressDescription){

progressDescription.innerText =
(challenge.successDays || 0) +
"일 성공 / 총 " +
challenge.period +
"일";

}


/* 챌린지 정보 - 기간 */
if(infoItems[0]){

const periodText =
infoItems[0].querySelector("p");


if(periodText){

periodText.innerText =
challenge.startDate +
" ~ " +
challenge.endDate +
" (" +
challenge.period +
"일)";

}

}


/* 챌린지 정보 - 목표 */
let goalText =
"";


if(challenge.customGoal){

goalText =
challenge.customGoal;

}

else{

goalText =
challenge.goalValue +
" " +
getGoalUnit(
challenge.goalUnit
);

}


if(infoItems[1]){

const goalElement =
infoItems[1].querySelector("p");


if(goalElement){

goalElement.innerText =
goalText;

}

}


/* 성공 보상 / 실패 약속 */
if(infoItems[2]){

const lastInfoTitle =
infoItems[2].querySelector(
".info-title"
);

const lastInfoText =
infoItems[2].querySelector(
"p"
);


/* 혼자 도전 */
if(challenge.mode === "solo"){

if(lastInfoTitle){

lastInfoTitle.innerText =
"성공 보상";

}


if(lastInfoText){

lastInfoText.innerText =
challenge.reward ||
"설정하지 않음";

}

}


/* 함께 도전 */
else{

if(lastInfoTitle){

lastInfoTitle.innerText =
"실패 시 약속";

}


if(lastInfoText){

lastInfoText.innerText =
challenge.promise ||
"설정하지 않음";

}

}

}

}


/* 목표 단위 */
function getGoalUnit(unit){

if(unit === "step"){

return "보";

}


if(unit === "minute"){

return "분";

}


if(unit === "time"){

return "회";

}


if(unit === "ml"){

return "ml";

}


if(unit === "hour"){

return "시간";

}


return "";

}


/* 인증 방식 */
const checkTypes =
document.querySelectorAll(
".check-type"
);

const photoCheck =
document.querySelector(
".photo-check"
);

const textCheck =
document.querySelector(
".text-check"
);


checkTypes.forEach(function(button){

button.addEventListener(
"click",
function(){

checkTypes.forEach(function(item){

item.classList.remove(
"active"
);

});


button.classList.add(
"active"
);


const type =
button.dataset.type;


if(type === "photo"){

if(photoCheck){

photoCheck.style.display =
"block";

}


if(textCheck){

textCheck.style.display =
"none";

}

}


if(type === "text"){

if(photoCheck){

photoCheck.style.display =
"none";

}


if(textCheck){

textCheck.style.display =
"block";

}

}

});

});


/* 글자 수 */
const checkText =
document.querySelector(
'textarea[name="checkText"]'
);

const checkTextCount =
document.querySelector(
".check-text-count"
);


if(
checkText &&
checkTextCount
){

checkText.addEventListener(
"input",
function(){

checkTextCount.innerText =
checkText.value.length;

});

}


/* 사진 선택 */
const photoInput =
document.querySelector(
'.photo-check input[type="file"]'
);

const photoPreview =
document.querySelector(
".photo-preview"
);

let selectedPhoto =
null;


if(photoInput){

photoInput.addEventListener(
"change",
function(){

const file =
photoInput.files[0];


if(!file){

return;

}


if(
!file.type.startsWith(
"image/"
)
){

alert(
"이미지 파일을 선택해주세요."
);

photoInput.value =
"";

return;

}


selectedPhoto =
file;


const reader =
new FileReader();


reader.addEventListener(
"load",
function(){

if(!photoPreview){

return;

}


photoPreview.innerHTML =
"";


const image =
document.createElement(
"img"
);

image.src =
reader.result;

image.alt =
"인증 사진";


photoPreview.appendChild(
image
);

});


reader.readAsDataURL(
file
);

});

}


/* 오늘 인증 */
const checkButton =
document.querySelector(
".check-button"
);


if(checkButton){

checkButton.addEventListener(
"click",
function(){

const activeType =
document.querySelector(
".check-type.active"
);


if(!activeType){

alert(
"인증 방식을 선택해주세요."
);

return;

}


const type =
activeType.dataset.type;


/* 챌린지 확인 */
if(!challenge){

alert(
"챌린지 정보를 찾을 수 없어요."
);

return;

}


/* 현재 날짜 */
const currentDate =
new Date();

currentDate.setHours(
0,
0,
0,
0
);


/* 종료일 */
const endDate =
new Date(
challenge.endDate
);

endDate.setHours(
0,
0,
0,
0
);


/* 종료된 챌린지 */
if(currentDate > endDate){

alert(
"이미 종료된 챌린지입니다."
);


location.href =
"challenge-report.html?id=" +
challenge.id;

return;

}


/* 시작일 */
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


/* 시작 전 */
if(currentDate < startDate){

alert(
"아직 시작하지 않은 챌린지입니다."
);

return;

}


/* 사진 인증 확인 */
if(type === "photo"){

if(selectedPhoto === null){

alert(
"인증할 사진을 선택해주세요."
);

return;

}

}


/* 글 인증 확인 */
if(type === "text"){

if(
!checkText ||
checkText.value.trim() === ""
){

alert(
"인증 내용을 입력해주세요."
);

return;

}

}


/* 오늘 날짜 문자열 */
const year =
currentDate.getFullYear();

const month =
String(
currentDate.getMonth() + 1
).padStart(2, "0");

const day =
String(
currentDate.getDate()
).padStart(2, "0");


const todayText =
year +
"-" +
month +
"-" +
day;


/* 인증 기록 배열 */
if(
!Array.isArray(
challenge.checkRecords
)
){

challenge.checkRecords =
[];

}


/* 오늘 인증 기록 확인 */
const todayRecord =
challenge.checkRecords.find(
function(record){

return (
record.date ===
todayText
);

});


/* 이미 인증 */
if(todayRecord){

alert(
"오늘은 이미 인증했어요."
);

return;

}


/* 인증 데이터 */
const checkRecord = {

date:
todayText,

success:
true,

type:
type

};


/* 글 인증 내용 */
if(type === "text"){

checkRecord.text =
checkText.value.trim();

}


/* 인증 기록 추가 */
challenge.checkRecords.push(
checkRecord
);


/* 성공 일수 계산 */
challenge.successDays =
challenge.checkRecords.filter(
function(record){

return (
record.success === true
);

}).length;


/* 진행률 계산 */
challenge.progress =
Math.round(
(
challenge.successDays /
challenge.period
) *
100
);


/* 최대 100% */
if(challenge.progress > 100){

challenge.progress =
100;

}


/* 마지막 인증 날짜 */
challenge.lastCheckDate =
todayText;


/* 챌린지 위치 */
const challengeIndex =
challenges.findIndex(
function(item){

return (
item.id ===
challengeId
);

});


/* 저장 */
if(challengeIndex !== -1){

challenges[challengeIndex] =
challenge;


localStorage.setItem(
"challenges",
JSON.stringify(challenges)
);

}


/* 화면 진행률 변경 */
const progressText =
document.querySelector(
".progress-header strong"
);

const progressBar =
document.querySelector(
".progress-bar"
);

const progressDescription =
document.querySelector(
".progress-section > p"
);


if(progressText){

progressText.innerText =
challenge.progress +
"%";

}


if(progressBar){

progressBar.style.width =
challenge.progress +
"%";

}


if(progressDescription){

progressDescription.innerText =
challenge.successDays +
"일 성공 / 총 " +
challenge.period +
"일";

}


/* 인증 완료 */
checkButton.innerText =
"✓ 오늘 인증 완료";

checkButton.classList.add(
"active"
);


alert(
"오늘 인증이 완료되었어요!"
);

});

}


/* ============================= */
/* 초대 코드 */
/* ============================= */

const codeText =
document.querySelector(
".code"
);

const copyButton =
document.querySelector(
".copy-button"
);

const inviteSection =
document.querySelector(
".invite-code"
);

const inviteButton =
document.querySelector(
".invite-member"
);


let inviteCode =
"";


/* 함께 도전 */
if(
challenge &&
challenge.mode === "together"
){

inviteCode =
challenge.inviteCode ||
"";


/* 초대 코드 표시 */
if(codeText){

codeText.innerText =
inviteCode ||
"-";

}


/* 초대 영역 표시 */
if(inviteSection){

inviteSection.style.display =
"block";

}


/* 초대 버튼 표시 */
if(inviteButton){

inviteButton.style.display =
"block";

}

}


/* 혼자 도전 */
else{

if(codeText){

codeText.innerText =
"-";

}


/* 혼자 도전이면 초대 코드 영역 숨김 */
if(inviteSection){

inviteSection.style.display =
"none";

}


/* 참여자 초대 버튼 숨김 */
if(inviteButton){

inviteButton.style.display =
"none";

}

}


/* 초대 코드 복사 */
if(copyButton){

copyButton.addEventListener(
"click",
function(){

if(!inviteCode){

alert(
"초대 코드가 없습니다."
);

return;

}


/* Clipboard API */
if(
navigator.clipboard &&
window.isSecureContext
){

navigator.clipboard
.writeText(
inviteCode
)
.then(function(){

copyComplete();

})
.catch(function(){

fallbackCopy(
inviteCode
);

});

}


/* Clipboard API 사용 불가 */
else{

fallbackCopy(
inviteCode
);

}

});

}


/* 복사 대체 방법 */
function fallbackCopy(text){

const textArea =
document.createElement(
"textarea"
);

textArea.value =
text;

textArea.style.position =
"fixed";

textArea.style.opacity =
"0";


document.body.appendChild(
textArea
);


textArea.select();


document.execCommand(
"copy"
);


textArea.remove();


copyComplete();

}


/* 복사 완료 */
function copyComplete(){

if(!copyButton){

return;

}


copyButton.innerText =
"복사 완료";


setTimeout(function(){

copyButton.innerText =
"복사";

}, 1500);

}


/* 참여자 초대 */
if(inviteButton){

inviteButton.addEventListener(
"click",
function(){

if(!inviteCode){

alert(
"초대 코드가 없습니다."
);

return;

}


alert(
"초대 코드 : " +
inviteCode
);

});

}


/* 챌린지 삭제 */
const deleteButton =
document.querySelector(
".delete-button"
);


if(deleteButton){

deleteButton.addEventListener(
"click",
function(){

if(!challenge){

alert(
"삭제할 챌린지 정보를 찾을 수 없어요."
);

return;

}


const result =
confirm(
"챌린지를 삭제하시겠어요?"
);


if(result === false){

return;

}


/* 선택한 챌린지를 제외 */
const newChallenges =
challenges.filter(
function(item){

return (
item.id !==
challengeId
);

});


/* 다시 저장 */
localStorage.setItem(
"challenges",
JSON.stringify(
newChallenges
)
);


alert(
"챌린지가 삭제되었어요."
);


location.href =
"challenge-list.html";

});

}


/* 처음 화면 */
if(photoCheck){

photoCheck.style.display =
"block";

}


if(textCheck){

textCheck.style.display =
"none";

}