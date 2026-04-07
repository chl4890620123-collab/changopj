import axios from 'axios';

const api = axios.create({
    // 환경 변수만 사용 
    baseURL: process.env.REACT_APP_API_URL, 
    withCredentials: true 
});

// 서버로 데이터를 보내기 직전 실행
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); 
    
    // 유효한 토큰이 있을 때만 Authorization 헤더에 Bearer 토큰 주입
    if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
    } 
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 서버에서 응답을 받은 직후 실행
api.interceptors.response.use(
    (response) => response,
    (error) => {
        //  인증 실패 시 처리
        if (error.response?.status === 401) {
            console.error("❌ 인증 실패: 세션이 만료되었습니다.");
            
            //  잘못된 토큰 정보 삭제
            localStorage.removeItem('token'); 
            
            //  무한 리다이렉트를 방지하며 로그인 페이지로 이동
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath === '/login' || currentPath.includes('/auth/callback');

            if (!isAuthPage) {
                alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
