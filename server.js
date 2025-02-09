require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

// ✅ 허용할 도메인 설정 (Netlify & 로컬 테스트용)
const allowedOrigins = [
    "https://signcollector.netlify.app",  // Netlify 도메인 (프론트엔드)
    "http://localhost:3000"               // 로컬 테스트용
];

// ✅ CORS 옵션 설정
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors()); // ⚠️ 이 부분을 수정

// ✅ 환경 변수에서 Google OAuth 설정 불러오기
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || "https://signcollector.netlify.app/callback.html";

// ✅ 루트(`/`) 요청 시 JSON 응답 반환
app.get("/", (req, res) => {
    res.json({ message: "Backend is running!" });
});

// ✅ Google 로그인 요청 (OAuth URL 생성)
app.get("/login", (req, res) => {
    const scope = encodeURIComponent("openid email profile");
    const responseType = "code";

    // 🔥 Google OAuth 로그인 URL 생성
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${responseType}&scope=${scope}&access_type=offline`;

    console.log("✅ 생성된 Google OAuth URL:", authUrl);
    res.json({ authUrl });
});

// ✅ Google OAuth 콜백: Authorization Code를 받아 Access Token 요청
app.post("/auth/google", cors(corsOptions), async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "Authorization Code가 없습니다." });
    }

    try {
        const tokenResponse = await axios.post(
            "https://oauth2.googleapis.com/token",
            new URLSearchParams({
                code: code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: "authorization_code"
            }).toString(),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
        );

        const { access_token } = tokenResponse.data;
        console.log("🔑 Google Access Token:", access_token);

        if (access_token) {
            res.json({ access_token });
        } else {
            res.status(400).json({ error: "Google Access Token 요청 실패", details: tokenResponse.data });
        }

    } catch (error) {
        console.error("❌ Google OAuth 토큰 요청 오류:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "서버 오류", details: error.response ? error.response.data : error.message });
    }
});


// ✅ 서버 실행 (Render에서 자동으로 PORT 할당)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 백엔드 서버 실행 중: PORT=${PORT}`);
});
