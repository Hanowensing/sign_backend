require('dotenv').config();
const express = require('express');

const cors = require('cors');
const path = require('path'); // path 모듈 추가

console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);

const app = express();
app.use(express.json());
app.use(cors()); // 프론트엔드 요청 허용

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // 환경 변수에서 클라이언트 ID 가져오기
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET; // 보안을 위해 환경 변수에서 가져오기
const REDIRECT_URI = 'http://localhost:3000/callback.html'; // 리디렉트 URI

// `public` 폴더를 정적 파일 제공 폴더로 설정
app.use(express.static(path.join(__dirname, 'public')));

// 루트(`/`) 요청 시 `index.html` 반환
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 로그인 요청을 처리하는 라우트 추가
app.get('/login', (req, res) => {
    const scope = encodeURIComponent('openid email profile');
    const responseType = 'code';

    // Google OAuth URL 생성
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${responseType}&scope=${scope}&access_type=offline`;

    // 생성된 URL을 콘솔에 출력
    console.log('Generated Google OAuth URL:', authUrl);  // 생성된 URL을 출력

    // 사용자를 Google 로그인 페이지로 리디렉트
    res.redirect(authUrl);
});

// Google OAuth 인증 후 callback을 처리하는 라우트
app.post('/auth/google', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Authorization Code가 없습니다.' });
    }

    try {
        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const bodyParams = new URLSearchParams({
            code: code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        });

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: bodyParams
        });

        const data = await response.json();
        console.log("🔑 Google 응답 데이터:", data);

        if (data.access_token) {
            res.json({ access_token: data.access_token });
        } else {
            res.status(400).json({ error: 'Google Access Token 요청 실패', details: data });
        }

    } catch (error) {
        console.error('토큰 요청 오류:', error);
        res.status(500).json({ error: '서버 오류' });
    }
});

app.listen(3000, () => {
    console.log('✅ 백엔드 서버 실행 중: http://localhost:3000');
});
