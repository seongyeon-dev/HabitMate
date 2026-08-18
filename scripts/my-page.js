/* 회원 정보 */
const user = JSON.parse(localStorage.getItem("user"));


/* 저장된 챌린지 */
const challenges = JSON.parse(localStorage.getItem("challenges")) || [];


/* 프로필 화면 */
const profileImage = document.querySelector(".profile-image");
const profileName = document.querySelector(".profile-text h2");
const profileEmail = document.querySelector(".profile-text p");


/* 회원 정보 표시 */
if(user) {
    profileName.innerText = user.nickname;
    profileEmail.innerText = user.email;

    /* 프로필 첫 글자 */
    if(user.nickname) {
        profileImage.innerText = user.nickname.charAt(0);
    }
}


/* 챌린지 통계 */
const statisticItems = document.querySelectorAll(".statistic-item");


/* 총 참여 챌린지 */
const totalChallenges = challenges.length;


/* 완료한 챌린지 */
const completedChallenges = challenges.filter(function(challenge) {
    return challenge.status === "completed";
});

const completedCount = completedChallenges.length;


/* 완주율 */
let completionRate = 0;

if(totalChallenges > 0) {
    completionRate = Math.round(
        (completedCount / totalChallenges) * 100
    );
}


/* 모든 챌린지 인증 날짜 */
let successDates = [];

challenges.forEach(function(challenge) {
    const records = Array.isArray(challenge.checkRecords)
        ? challenge.checkRecords
        : [];

    records.forEach(function(record) {
        if(record.success === true) {
            successDates.push(record.date);
        }
    });
});


/* 중복 날짜 제거 */
successDates = [...new Set(successDates)];


/* 날짜 순서 정렬 */
successDates.sort();


/* 최고 연속 성공 계산 */
let maxStreak = 0;
let currentStreak = 0;

for(let i = 0; i < successDates.length; i++) {
    if(i === 0) {
        currentStreak = 1;
        maxStreak = 1;
        continue;
    }

    const previousDate = new Date(successDates[i - 1]);
    const currentDate = new Date(successDates[i]);

    previousDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    const difference = Math.round(
        (currentDate - previousDate) / (1000 * 60 * 60 * 24)
    );

    if(difference === 1) {
        currentStreak++;
    }
    else {
        currentStreak = 1;
    }

    if(currentStreak > maxStreak) {
        maxStreak = currentStreak;
    }
}


/* 현재 연속 성공 계산 */
let streak = 0;

if(successDates.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedDates = successDates.slice().sort().reverse();
    let checkDate = new Date(today);


    /* 날짜 문자열 */
    function getDateText(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return year + "-" + month + "-" + day;
    }


    const todayText = getDateText(today);


    /* 오늘 성공 기록이 없으면 어제부터 계산 */
    if(sortedDates[0] !== todayText) {
        checkDate.setDate(checkDate.getDate() - 1);
    }


    while(true) {
        const expectedDate = getDateText(checkDate);

        if(successDates.includes(expectedDate)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }
        else {
            break;
        }
    }
}


/* 총 참여 챌린지 표시 */
statisticItems[0]
    .querySelector("strong")
    .innerHTML = totalChallenges + "<span>개</span>";


/* 완료한 챌린지 표시 */
statisticItems[1]
    .querySelector("strong")
    .innerHTML = completedCount + "<span>개</span>";


/* 완주율 표시 */
statisticItems[2]
    .querySelector("strong")
    .innerHTML = completionRate + "<span>%</span>";


/* 현재 연속 성공 표시 */
statisticItems[3]
    .querySelector("strong")
    .innerHTML = streak + "<span>일</span>";


/* 최고 연속 성공 표시 */
statisticItems[3]
    .querySelector("small")
    .innerText = "최고 " + maxStreak + "일";


/* 프로필 수정 버튼 */
const editButton = document.querySelector(".edit-button");


/* 설정 메뉴 */
const settingItems = document.querySelectorAll(".setting-item");


/* 로그아웃 버튼 */
const logoutButton = document.querySelector(".logout");


/* 프로필 수정 */
editButton.addEventListener("click", function() {
    alert("프로필 수정 기능은 준비 중입니다.");
});


/* 설정 메뉴 */
settingItems.forEach(function(item) {
    item.addEventListener("click", function() {
        const menuName = item.querySelector("span").textContent;

        if(item.classList.contains("logout")) {
            return;
        }

        alert(menuName + " 기능은 준비 중입니다.");
    });
});


/* 로그아웃 */
logoutButton.addEventListener("click", function() {
    const isLogout = confirm("로그아웃하시겠습니까?");

    if(isLogout) {
        /* 로그인 상태만 삭제 */
        localStorage.removeItem("isLogin");

        /* 로그인 화면으로 이동 */
        window.location.href = "login.html";
    }
});