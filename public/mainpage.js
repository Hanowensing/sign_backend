document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Main page loaded");

    // ✅ Google 로그인한 사용자 정보 가져오기
    const userInfo = JSON.parse(localStorage.getItem("googleUser"));
    const access_token = localStorage.getItem("access_token");

    if (!userInfo) {
        // 로그인하지 않았다면 로그인 페이지로 리디렉트
        window.location.href = "index.html";
    } else {
        console.log("👤 로그인한 사용자:", userInfo);
        console.log(access_token)

        // ✅ 사용자 정보 UI에 표시
        const header = document.querySelector("header");
        const userProfile = document.createElement("div");
        userProfile.classList.add("user-profile");
        userProfile.innerHTML = `
            <img src="${userInfo.picture}" alt="User Profile" class="user-img">
        `;

        // 프로필 클릭 시 로그아웃 버튼 토글
        userProfile.addEventListener("click", function () {
            const logoutButton = document.querySelector(".logout-btn");
            // 로그아웃 버튼이 이미 있으면 제거하고, 없으면 추가
            if (logoutButton) {
                logoutButton.style.display = logoutButton.style.display === "block" ? "none" : "block";
            } else {
                const logoutBtn = document.createElement("button");
                logoutBtn.textContent = "로그아웃";
                logoutBtn.classList.add("logout-btn");
                logoutBtn.addEventListener("click", function (event) {
                    event.stopPropagation(); // 클릭 이벤트가 프로필로 전파되지 않도록 방지
                    logout(userInfo);
                });
                header.appendChild(logoutBtn);
            }
        });

        header.appendChild(userProfile);
    }

  // ✅ "+" 버튼 클릭 시 '새로운 사인 생성'과 '사인 인식' 버튼 표시
  const plusButton = document.createElement("button");
  plusButton.classList.add("plus-btn");
  plusButton.textContent = "+";
  document.querySelector("header").appendChild(plusButton);

  plusButton.addEventListener("click", function () {
      const newSignBtn = document.createElement("button");
      newSignBtn.textContent = "New Sign";
      newSignBtn.classList.add("action-btn");
      newSignBtn.addEventListener("click", () => window.location.href = "create.html");

      const recognizeSignBtn = document.createElement("button");
      recognizeSignBtn.textContent = "Upload";
      recognizeSignBtn.classList.add("action-btn");
      recognizeSignBtn.addEventListener("click", () => window.location.href = "recognize.html");

      // 메뉴를 보여줌
      const menu = document.querySelector(".action-menu");
      if (!menu) {
          const menuDiv = document.createElement("div");
          menuDiv.classList.add("action-menu");
          menuDiv.appendChild(newSignBtn);
          menuDiv.appendChild(recognizeSignBtn);
          document.querySelector("header").appendChild(menuDiv);
      } else {
          menu.style.display = menu.style.display === "block" ? "none" : "block";
      }
  });

  // ✅ 저장된 사인 불러오기
  loadSavedSigns();
});

/**
 * ✅ 로그아웃 함수
 */
function logout(userInfo) {
    localStorage.removeItem("googleUser");
    const access_token = localStorage.getItem("access_token");

    // ✅ Google 로그아웃 URL로 이동 (OAuth 세션 해제)
    fetch("https://accounts.google.com/o/oauth2/revoke?token=" + access_token, {
        method: "GET",
        mode: "no-cors",
    }).then(() => {
        window.location.href = "index.html"; // 로그인 페이지로 이동
    }).catch(error => console.error("❌ Google 로그아웃 실패:", error));
}

// ✅ 로그아웃 버튼 클릭 시 logout() 실행
const logoutButton = document.querySelector(".logout-btn");
    
if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        console.log("🔴 로그아웃 버튼 클릭됨");
        logout();
    });
} else {
    console.warn("⚠️ 로그아웃 버튼(.logout-btn)을 찾을 수 없습니다.");
}

/**
 * ✅ 저장된 사인을 불러와 화면에 표시하는 함수
 */
function loadSavedSigns() {
    const container = document.getElementById("savedSignContainer");
    if (!container) {
        console.error("❌ 오류: savedSignContainer 요소가 mainpage.html에 없음");
        return;
    }

    let savedSigns = JSON.parse(localStorage.getItem("savedSigns")) || [];
    console.log("📂 불러온 데이터:", savedSigns);

    // ✅ "저장된 사인이 없습니다" h3 생성
    let noSignMessage = document.querySelector(".no-sign-message");
    if (!noSignMessage) {
        noSignMessage = document.createElement("h3");
        noSignMessage.textContent = "저장된 사인이 없습니다.";
        noSignMessage.classList.add("no-sign-message");
        container.parentElement.insertBefore(noSignMessage, container);
    }

    // ✅ 사진이 없으면 메시지 표시, 있으면 숨김
    noSignMessage.style.display = savedSigns.length === 0 ? "block" : "none";

    // ✅ 기존 카드 초기화
    container.innerHTML = "";

    savedSigns.forEach((signData, index) => {
        console.log(`🖼️ 이미지 추가: ${signData.imageUrl}`);

        // ✅ 사인 카드 생성
        const signCard = document.createElement("div");
        signCard.classList.add("sign-card");

        // ✅ 제목 추가
        const titleElem = document.createElement("h3");
        titleElem.textContent = signData.title || "제목 없음";
        titleElem.classList.add("sign-title");

        // ✅ 이미지 추가
        const imgElem = document.createElement("img");
        imgElem.src = signData.imageUrl;
        imgElem.alt = "Saved Signature";
        imgElem.classList.add("sign-image");

        // ✅ 이미지 로드 실패 시 기본 이미지 표시
        imgElem.onerror = function () {
            console.error(`❌ 이미지 로드 실패: ${signData.imageUrl}`);
            this.src = "default-sign.png";
            this.alt = "이미지 로드 실패";
        };

        // ✅ 삭제 버튼 추가 (새로고침 없이 동작)
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "삭제";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.style.display = "block";
        deleteBtn.addEventListener("click", function () {
            deleteSign(index);
        });

        // ✅ 요소 추가
        signCard.appendChild(titleElem);
        signCard.appendChild(imgElem);

        const signWrapper = document.createElement("div");
        signWrapper.classList.add("sign-wrapper");
        signWrapper.appendChild(signCard);
        signWrapper.appendChild(deleteBtn);

        container.appendChild(signWrapper);
    });
}

/**
 * ✅ 저장된 사인을 삭제하는 함수 (새로고침 없이 UI 업데이트)
 */
function deleteSign(index) {
    let savedSigns = JSON.parse(localStorage.getItem("savedSigns")) || [];
    savedSigns.splice(index, 1);
    localStorage.setItem("savedSigns", JSON.stringify(savedSigns));

    // ✅ 삭제 후 UI 업데이트
    loadSavedSigns();
}
