
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Create Sign Page Loaded");

    // 캔버스 및 컨텍스트 설정
    const canvas = document.getElementById("signatureCanvas");
    const ctx = canvas.getContext("2d");
    let drawing = false;
    let points = []; // 그릴 점들을 저장할 배열
    let history = []; // Undo 기능을 위한 저장 배열

    // 캔버스 크기를 요소 크기에 맞게 설정
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    

    // 색상 및 굵기 input 요소
    const penColorInput = document.getElementById("penColor");
    const penSizeInput = document.getElementById("penSize");

    // 좌표 계산 함수 (마우스)
    function getMousePos(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    // 좌표 계산 함수 (터치)
    function getTouchPos(event) {
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }

    // 두 점의 중간점을 계산하는 함수
    function getMidPoint(p1, p2) {
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
        };
    }

    // 그리기 시작 시점
    function startDrawing(pos) {
        drawing = true;
        points = [pos];
        history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    // 부드러운 선 그리기
    function drawLine(pos) {
        if (!drawing) return;
        points.push(pos);

        if (points.length < 3) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(pos.x, pos.y);
            ctx.strokeStyle = penColorInput.value;
            ctx.lineWidth = penSizeInput.value;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke();
            ctx.closePath();
            return;
        }

        const len = points.length;
        const p0 = points[len - 3];
        const p1 = points[len - 2];
        const p2 = points[len - 1];
        const mid1 = getMidPoint(p0, p1);
        const mid2 = getMidPoint(p1, p2);

        ctx.beginPath();
        ctx.moveTo(mid1.x, mid1.y);
        ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
        ctx.strokeStyle = penColorInput.value;
        ctx.lineWidth = penSizeInput.value;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.closePath();
    }

    // 그리기 종료
    function stopDrawing() {
        drawing = false;
    }

    // 마우스 이벤트 추가
    canvas.addEventListener("mousedown", (event) => startDrawing(getMousePos(event)));
    canvas.addEventListener("mousemove", (event) => drawLine(getMousePos(event)));
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    // 터치 이벤트 추가
    canvas.addEventListener("touchstart", (event) => {
        event.preventDefault();
        startDrawing(getTouchPos(event));
    });
    canvas.addEventListener("touchmove", (event) => {
        event.preventDefault();
        drawLine(getTouchPos(event));
    });
    canvas.addEventListener("touchend", (event) => {
        event.preventDefault();
        stopDrawing();
    });

    // 캔버스 초기화 버튼
    document.getElementById("clearCanvas").addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        history = [];
    });

    // Undo 기능
    document.getElementById("undo").addEventListener("click", () => {
        if (history.length > 0) {
            const previousState = history.pop();
            ctx.putImageData(previousState, 0, 0);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });

    // ✅ 사인 저장 기능 (localStorage에 저장)
    document.getElementById("saveSign").addEventListener("click", function () {
        const title = document.getElementById("signatureTitle").value;
        const dataUrl = canvas.toDataURL("image/png"); // 캔버스를 이미지로 변환

        console.log("🖼️ 저장된 이미지 데이터:", dataUrl); // 디버깅용 로그

        if (!title.trim()) {
            alert("제목을 입력해주세요!");
            return;
        }

        if (dataUrl.length < 100) {
            alert("사인을 그려주세요! 빈 이미지는 저장되지 않습니다.");
            return;
        }

        // 기존 데이터 가져오기
        let savedSigns = JSON.parse(localStorage.getItem("savedSigns")) || [];

        // 새로운 사인 데이터 추가
        const signData = {
            title: title,
            imageUrl: dataUrl
        };

        savedSigns.push(signData);
        localStorage.setItem("savedSigns", JSON.stringify(savedSigns)); // localStorage에 저장

        console.log("✅ 저장된 데이터:", savedSigns); // 디버깅용 로그

        // mainpage.html로 이동
        window.location.href = "mainpage.html";
    });
});