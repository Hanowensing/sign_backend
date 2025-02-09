function displaySignature(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.getElementById("signatureCanvas");
            const ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = e.target.result;

        // ✅ 이미지 업로드 후 저장할 준비
        localStorage.setItem("uploadedSign", e.target.result);
    };
    reader.readAsDataURL(file);
}

// ✅ 게시하기 버튼 클릭 시 저장
function postSignature() {
    const title = document.getElementById("signatureTitle").value;
    const imageUrl = localStorage.getItem("uploadedSign"); // 업로드된 이미지 가져오기

    if (!title.trim()) {
        alert("제목을 입력해주세요!");
        return;
    }

    if (!imageUrl) {
        alert("이미지를 업로드해주세요!");
        return;
    }

    // 기존 저장된 사인 목록 불러오기
    let savedSigns = JSON.parse(localStorage.getItem("savedSigns")) || [];

    // 새로운 사인 데이터 추가
    const signData = {
        title: title,
        imageUrl: imageUrl
    };

    savedSigns.push(signData);
    localStorage.setItem("savedSigns", JSON.stringify(savedSigns)); // localStorage에 저장

    alert("✅ 사인이 저장되었습니다!");
    window.location.href = "mainpage.html"; // 저장 후 메인 페이지로 이동
}
