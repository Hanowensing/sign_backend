let selectedProfile = null;
let isIdAvailable = false;
let isStudentIdAvailable = true;

document.querySelectorAll('.profile').forEach(profile => {
    profile.addEventListener('click', () => {
        document.querySelectorAll('.profile').forEach(p => p.style.border = 'none');
        profile.style.border = '2px solid #005bac';
        selectedProfile = profile.getAttribute('data-name');
    });
});

// 아이디 중복 확인
document.getElementById('checkIdBtn').addEventListener('click', () => {
    const userId = document.getElementById('userId').value;
    
    if (!userId) {
        alert('아이디를 입력해주세요.');
        return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const isUserExist = existingUsers.some(user => user.userId === userId);

    if (isUserExist) {
        alert('이미 사용 중인 아이디입니다.');
        isIdAvailable = false;
    } else {
        alert('사용 가능한 아이디입니다.');
        isIdAvailable = true;
    }
});

// 아이디 입력 필드 변경 시 중복 확인 초기화
document.getElementById('userId').addEventListener('input', () => {
    isIdAvailable = false;
});

// 회원가입 폼 제출
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const username = document.getElementById('username').value;
    const nickname = document.getElementById('nickname').value;
    const studentId = document.getElementById('studentId').value;
    const department = document.getElementById('department').value;

    // 모든 필드 검증
    if (!userId || !password || !passwordConfirm || !username || !nickname || !studentId || !department) {
        alert('모든 정보를 입력해주세요.');
        return;
    }

    // 아이디 중복 확인 여부 검증
    if (!isIdAvailable) {
        alert('아이디 중복 확인을 해주세요.');
        return;
    }
    // 비밀번호 일치 여부 확인
    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    // 기존 사용자 목록 가져오기
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 새 사용자 정보 추가
    const newUser = {
        userId,
        password,
        profile: selectedProfile,
        name: username,
        nickname: nickname,
        studentId,
        department
    };
    
    existingUsers.push(newUser);
    
    // localStorage에 저장
    localStorage.setItem('users', JSON.stringify(existingUsers));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    alert(`${username}님, 등록이 완료되었습니다!`);
    window.location.href = 'index.html';
});

// 프로필 선택 모달 표시 함수
function showProfileSelectionModal() {
    return new Promise((resolve, reject) => {
        const modalHTML = `
            <div id="profileModal" class="modal" style="display: block;">
                <div class="modal-content">
                    <h2>프로필 이미지를 선택해주세요</h2>
                    <div class="profiles">
                        <div class="profile" data-name="심슨_동원">
                            <img src="심슨_동원.jpg" alt="심슨_동원">
                            <span>심슨_동원</span>
                        </div>
                        <div class="profile" data-name="심슨_유빈">
                            <img src="심슨_유빈.jpg" alt="심슨_유빈">
                            <span>심슨_유빈</span>
                        </div>
                        <div class="profile" data-name="심슨_형준">
                            <img src="심슨_형준.jpg" alt="심슨_형준">
                            <span>심슨_형준</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 모달 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('profileModal');
        const profiles = modal.querySelectorAll('.profile');

        // 프로필 클릭 이벤트
        profiles.forEach(profile => {
            profile.addEventListener('click', () => {
                const selectedProfile = profile.getAttribute('data-name');
                modal.remove();
                resolve(selectedProfile);
            });
        });
    });
}

// 페이지 로드 시 구글 로그인 초기화
window.addEventListener('load', startApp);

// 토큰 검증 함수 추가
async function verifyGoogleToken(token) {
    try {
        const response = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + token);
        const payload = await response.json();
        
        // 발급자 확인
        if (payload.aud !== 'YOUR_CLIENT_ID') {
            throw new Error('Invalid token issuer');
        }
        
        // 토큰 만료 확인
        if (Date.now() >= payload.exp * 1000) {
            throw new Error('Token expired');
        }
        
        return payload;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

// CSRF 토큰 생성 및 검증
function generateStateToken() {
    const random = new Uint32Array(2);
    crypto.getRandomValues(random);
    const state = random.join('');
    sessionStorage.setItem('oauth_state', state);
    return state;
}

function verifyStateToken(receivedState) {
    const savedState = sessionStorage.getItem('oauth_state');
    sessionStorage.removeItem('oauth_state'); // 일회성 사용
    return savedState === receivedState;
}

// 사용자 정보 저장 시 민감 정보 필터링
function processSocialUserData(userData) {
    // 필요한 정보만 선택적으로 저장
    const sanitizedData = {
        id: userData.sub || userData.id,
        email: userData.email,
        name: userData.name,
        profile: userData.picture,
        provider: userData.provider
    };

    // 민감한 토큰 정보는 저장하지 않음
    delete sanitizedData.access_token;
    delete sanitizedData.id_token;

    return sanitizedData;
}

// 안전한 로그인 상태 관리
class SecureSession {
    static setUserSession(userData) {
        // 세션 만료 시간 설정 (예: 2시간)
        const expiresAt = Date.now() + (2 * 60 * 60 * 1000);
        
        const sessionData = {
            user: userData,
            expiresAt: expiresAt
        };
        
        sessionStorage.setItem('userSession', JSON.stringify(sessionData));
    }

    static checkSession() {
        const session = JSON.parse(sessionStorage.getItem('userSession'));
        if (!session) return null;

        if (Date.now() > session.expiresAt) {
            this.clearSession();
            return null;
        }

        return session.user;
    }

    static clearSession() {
        sessionStorage.removeItem('userSession');
    }
}

// 보안 관련 에러 처리
function handleAuthError(error, provider) {
    // 민감한 에러 정보는 사용자에게 노출하지 않음
    const userMessage = '로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.';
    
    // 개발자용 로그
    console.error(`Auth error (${provider}):`, {
        timestamp: new Date().toISOString(),
        error: error.message,
        provider: provider
    });

    alert(userMessage);
} 