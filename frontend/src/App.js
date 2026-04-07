import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'; 
import { Container, Nav } from 'react-bootstrap';
import api from './api'; 
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import InventoryEdit from './pages/InventoryEdit';
import Inbound from './pages/Inbound';
import Scanner from './pages/Scanner';
import ServiceConfig from './pages/ServiceConfig';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AiChat from './pages/AiChat';
import './App.css';

function App() {
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const savedToken = localStorage.getItem('token');
  
  // 구글 로그인
  const params = new URLSearchParams(location.search);
  const hasUrlToken = params.has('token');

  //  로그아웃 함수]
  const handleLogout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      try {
        // 1. 서버에 로그아웃 요청 (세션/쿠키 제거)
     
        await api.post('/api/auth/logout');
      } catch (error) {
        console.error("로그아웃 서버 통신 실패:", error);
      } finally {
        // 2. 통신 성공 여부와 상관없이 로컬 토큰 삭제
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // 유저 정보가 있다면 함께 삭제
        
        // 8080 주소가 아닌 프런트엔드 내의 /login으로 이동
     
        window.location.href = '/login';
      }
    }
  };

  // 인증 로직
  if (!savedToken && !isAuthPage && !hasUrlToken) {
    return <Navigate to="/login" replace />;
  }
// 처음 대시보드쪽 시작
  return (
    <div className="app-container">
      {!isAuthPage && (
        <aside className="sidebar">
          <div className="sidebar-logo mb-4">
            <h2 style={{ color: '#ff8a3d', fontWeight: '800' }}>ReStock</h2>
    //색
            <p className="text-muted small">AI 스마트 재고관리 시스템</p>
          </div>
          <Nav className="flex-column gap-2 flex-grow-1">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={location.pathname === '/' || location.pathname === '/dashboard' ? 'active' : ''}
            >
              대시보드
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/inventory" 
              className={location.pathname.startsWith('/inventory') ? 'active' : ''}
            >
              재고 현황
            </Nav.Link>
      //링크로 이동하는로직      
            <Nav.Link as={Link} to="/inbound" className={location.pathname === '/inbound' ? 'active' : ''}> 신규 입고</Nav.Link>
            <Nav.Link as={Link} to="/scanner" className={location.pathname === '/scanner' ? 'active' : ''}> QR 스캐너</Nav.Link>
            <Nav.Link as={Link} to="/chat" className={location.pathname === '/chat' ? 'active' : ''}> AI 챗봇</Nav.Link>
            
            <div className="menu-divider my-3" style={{ height: '1px', backgroundColor: '#eee' }}></div>
            <p className="px-3 small fw-bold text-muted mb-2" style={{ fontSize: '0.75rem' }}>SYSTEM CONFIG</p>
            
            <Nav.Link as={Link} to="/services" className={location.pathname === '/services' ? 'active' : ''}> 처리 사이트 관리</Nav.Link>
            
            <Nav.Link 
              onClick={handleLogout} 
              className="mt-2 text-danger fw-bold" 
              style={{ cursor: 'pointer' }}
            >
              로그아웃
            </Nav.Link>
          </Nav>
        </aside>
      )}

      <main className="main-content" style={{ 
        marginLeft: isAuthPage ? '0' : '280px', 
        width: isAuthPage ? '100%' : 'calc(100% - 280px)',
        minHeight: '100vh'
      }}>
        <Container fluid className="py-2">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/inventory/edit/:id" element={<InventoryEdit />} />
            <Route path="/inventory" element={<Inventory />} />
            
            <Route path="/inbound" element={<Inbound />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/services" element={<ServiceConfig />} />
            <Route path="/chat" element={<AiChat />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Container>
      </main>
    </div>
  );
}

export default App;
