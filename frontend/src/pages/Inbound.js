import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Form, InputGroup, Button, Spinner, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api'; 
import styles from './Inbound.module.css';

const Inbound = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [serviceList, setServiceList] = useState([]); 
    const [selectedServiceId, setSelectedServiceId] = useState("");
    
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [imgData, setImgData] = useState(null); 
    const [imageBlob, setImageBlob] = useState(null); 
    const [isUploading, setIsUploading] = useState(false);
    const [tempQR, setTempQR] = useState("");
    const [daysToAdd, setDaysToAdd] = useState("");

    const [formData, setFormData] = useState({ 
        name: '', 
        category: '', 
        stock: 1, 
        location: '', 
        url: '', 
        timeType: 'EXPIRATION', 
        referenceDate: new Date().toISOString().split('T')[0],
        expiryDate: '', 
        description: '',
        status: '정상', 
        size: 'MEDIUM',
        weight: 0,
        autoDelete: false
    });

    const [newCat, setNewCat] = useState("");
    const [newLoc, setNewLoc] = useState(""); 
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const qrPreviewRef = useRef(null);

    // 초기 로드
    useEffect(() => {
        api.get('/api/user-settings')
            .then(res => {
                const cats = res.data.categories || [];
                const locs = res.data.locations || [];
                setCategories(cats);
                setLocations(locs);
                
                setFormData(prev => ({
                    ...prev,
                    category: prev.category || (cats[0] || ''),
                    location: prev.location || (locs[0] || '')
                }));
            })
            .catch(() => console.log("사용자 설정 로드 실패"));
    }, []);

    // 카메라 제어
    useEffect(() => {
        let stream = null;
        if (isCameraOpen && videoRef.current) {
            const startCamera = async () => {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ 
                        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } 
                    });
                    if (videoRef.current) videoRef.current.srcObject = stream;
                } catch (err) {
                    alert("카메라 권한을 확인해주세요.");
                    setIsCameraOpen(false);
                }
            };
            startCamera();
        }
        return () => { 
            if (stream) stream.getTracks().forEach(track => track.stop()); 
        };
    }, [isCameraOpen]);

    // 서비스 목록 로드
    useEffect(() => {
        api.get('/api/services')
            .then(res => setServiceList(res.data))
            .catch(() => console.log("서비스 로드 실패"));
    }, []);

    // 날짜 계산
    useEffect(() => {
        if (formData.timeType === 'AGING' && daysToAdd) {
            const refDate = new Date(formData.referenceDate);
            refDate.setDate(refDate.getDate() + parseInt(daysToAdd));
            setFormData(prev => ({ ...prev, expiryDate: refDate.toISOString().split('T')[0] }));
        }
    }, [daysToAdd, formData.referenceDate, formData.timeType]);

    // QR 생성
    useEffect(() => {
        if (formData.name && window.QRCode) {
            const qrValue = `RS-${Date.now()}`;
            setTempQR(qrValue);
            if (qrPreviewRef.current) {
                qrPreviewRef.current.innerHTML = "";
                new window.QRCode(qrPreviewRef.current, { 
                    text: qrValue, 
                    width: 100, 
                    height: 100,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : window.QRCode.CorrectLevel.H
                });
            }
        }
    }, [formData.name]);
//카테고리 생성
    const addCategory = async () => {
        const trimmed = newCat.trim();
        if(trimmed && !categories.includes(trimmed)) {
            try {
                const res = await api.post('/api/user-settings/categories', { name: trimmed });
                setCategories(res.data); 
                setFormData(prev => ({...prev, category: trimmed}));
                setNewCat("");
            } catch (err) {
                alert("카테고리 저장 실패");
            }
        }
    };
//위치 생성
    const removeCategory = async (e, target) => {
        e.stopPropagation();
        try {
            const res = await api.delete(`/api/user-settings/categories/${target}`);
            setCategories(res.data);
            if (formData.category === target) {
                setFormData(prev => ({...prev, category: res.data[0] || ''}));
            }
        } catch (err) {
            alert("카테고리 삭제 실패");
        }
    };

    const addLocation = async () => {
        const trimmed = newLoc.trim();
        if(trimmed && !locations.includes(trimmed)) {
            try {
                const res = await api.post('/api/user-settings/locations', { name: trimmed });
                setLocations(res.data);
                setFormData(prev => ({...prev, location: trimmed}));
                setNewLoc("");
            } catch (err) {
                alert("위치 저장 실패");
            }
        }
    };

    const removeLocation = async (e, target) => {
        e.stopPropagation();
        try {
            const res = await api.delete(`/api/user-settings/locations/${target}`);
            setLocations(res.data);
            if (formData.location === target) {
                setFormData(prev => ({...prev, location: res.data[0] || ''}));
            }
        } catch (err) {
            alert("위치 삭제 실패");
        }
    };

    // 필수 값 지정
    const handleSave = async () => {
        if (!imageBlob) return alert("사진을 촬영하거나 등록해 주세요.");
        if (!formData.name.trim()) return alert("품목 이름을 입력해 주세요.");
        if (!formData.expiryDate) return alert("만료 예정일을 선택해 주세요.");

        setIsUploading(true);
        const sendData = new FormData();
        
        // 1. 이미지 추가 (키값: "image")
        const fileName = `product_${Date.now()}.jpg`;
        sendData.append("image", imageBlob, fileName); 

        // 2. 데이터 가공
        const selectedService = serviceList.find(s => String(s.id) === String(selectedServiceId));
        const { url, ...restData } = formData; 

        const finalData = { 
            ...restData, 
            serviceName: selectedService ? selectedService.name : "일반",
            customUrl: selectedService ? selectedService.url : formData.url, 
            qrCodeData: tempQR 
        };

        // 3. JSON 데이터 추가 (키값: "data")
        // 백엔드 컨트롤러의 @RequestPart("data")와 일치시킵니다.
        sendData.append("data", new Blob([JSON.stringify(finalData)], { type: "application/json" }));

        try {
            // 경로: /api/inventory/with-image (POST)
            await api.post('/api/inventory/with-image', sendData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("입고 완료!");
            navigate('/inventory');
        } catch (e) { 
            console.error("저장 실패 상세:", e.response?.data);
            alert("저장 실패: " + (e.response?.data?.message || "서버 에러가 발생했습니다.")); 
        } finally { 
            setIsUploading(false); 
        }
    };

    return (
        <div className={styles.container}>
            <Container fluid>
                <h1 className={styles.title}>
                    <span className={styles.highlight}>RE</span>STOCK INBOUND
                </h1>

                <div className={`${styles.customCard} mb-4`}>
                    <Row className="g-4 align-items-end">
                        <Col lg={8}>
                            <label className={styles.sectionLabel}> 품목 명칭</label>
                            <Form.Control 
                                className={styles.giantInput} 
                                placeholder="제품 이름을 입력하세요" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                            />
                        </Col>
                        <Col lg={4}>
                            <label className={styles.sectionLabel}> 입고 수량</label>
                            <InputGroup className={styles.quantityGroup}>
                                <Button className={styles.quantityBtn} onClick={() => setFormData({...formData, stock: Math.max(1, formData.stock - 1)})}>-</Button>
                                <Form.Control className={styles.quantityInput} value={formData.stock} readOnly />
                                <Button className={styles.quantityBtn} onClick={() => setFormData({...formData, stock: formData.stock + 1})}>+</Button>
                            </InputGroup>
                        </Col>
                    </Row>
                </div>

                <Row className="g-4">
                    <Col xl={5}>
                        <div className={styles.customCard}>
                            <label className={styles.sectionLabel}> 실물 사진 및 QR</label>
                            <div className={styles.mediaBox}>
                                {isCameraOpen ? (
                                    <video ref={videoRef} autoPlay playsInline className="w-100 h-100 object-fit-cover" />
                                ) : imgData ? (
                                    <img src={imgData} className="w-100 h-100 object-fit-cover" alt="preview" />
                                ) : (
                                    <div className={styles.mediaPlaceholder}>
                                        <span className={styles.mediaIcon}>📸</span>
                                        <div>사진을 등록해 주세요</div>
                                    </div>
                                )}
                            </div>
                            <div className="d-flex gap-2 mt-3">
                                {isCameraOpen ? (
                                    <Button variant="danger" className="flex-grow-1 py-3 fw-bold rounded-4 shadow-sm" onClick={() => {
                                        const canvas = canvasRef.current;
                                        canvas.width = videoRef.current.videoWidth;
                                        canvas.height = videoRef.current.videoHeight;
                                        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
                                        const data = canvas.toDataURL('image/jpeg', 0.8);
                                        setImgData(data);
                                        canvas.toBlob(blob => setImageBlob(blob), 'image/jpeg', 0.8);
                                        setIsCameraOpen(false);
                                    }}>촬영하기</Button>
                                ) : (
                                    <Button variant="dark" className="flex-grow-1 py-3 fw-bold rounded-4 shadow-sm" onClick={() => setIsCameraOpen(true)}>카메라 열기</Button>
                                )}
                                <Button variant="outline-dark" className="px-4 rounded-4 fw-bold shadow-sm" onClick={() => fileInputRef.current.click()}>불러오기</Button>
                                <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if(file) {
                                        setImageBlob(file);
                                        const r = new FileReader(); 
                                        r.onload = ev => setImgData(ev.target.result); 
                                        r.readAsDataURL(file);
                                    }
                                }} />
                            </div>
                            
                            <div className={styles.qrContainer}>
                                <div className={styles.qrWrapper}>
                                    <div ref={qrPreviewRef} className={styles.qrBox}></div>
                                    <div className={styles.qrInfo}>
                                        <small>AUTO-QR GENERATED</small>
                                        <h6 className={styles.qrText}>{tempQR || "대기 중..."}</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col xl={7}>
                        <div className={styles.customCard}>
                            <label className={styles.sectionLabel}> 카테고리 및 위치 설정</label>
                            
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {categories.map(c => (
                                    <div key={c} className={styles.tagWrapper}>
                                        <Button 
                                            variant={formData.category === c ? "dark" : "outline-secondary"} 
                                            className="rounded-pill px-4 py-2 fw-bold pe-5"
                                            onClick={() => setFormData({...formData, category: c})}
                                        >
                                            {c}
                                        </Button>
                                        <span className={styles.deleteBadge} onClick={(e) => removeCategory(e, c)}>✕</span>
                                    </div>
                                ))}
                            </div>
                            <InputGroup className="mb-4">
                                <Form.Control placeholder="새 카테고리 명칭" value={newCat} onChange={e => setNewCat(e.target.value)} className="py-2 px-3 rounded-start-4 border-2" />
                                <Button variant="dark" className="rounded-end-4 px-4 fw-bold" onClick={addCategory}>추가</Button>
                            </InputGroup>

                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {locations.map(l => (
                                    <div key={l} className={styles.tagWrapper}>
                                        <Button 
                                            variant={formData.location === l ? "warning" : "outline-secondary"} 
                                            className={`rounded-pill px-4 py-2 fw-bold pe-5 ${formData.location === l ? 'text-dark' : ''}`}
                                            onClick={() => setFormData({...formData, location: l})}
                                        >
                                            {l}
                                        </Button>
                                        <span className={styles.deleteBadge} onClick={(e) => removeLocation(e, l)}>✕</span>
                                    </div>
                                ))}
                            </div>
                            <InputGroup className="mb-4">
                                <Form.Control placeholder="새 보관 장소 명칭" value={newLoc} onChange={e => setNewLoc(e.target.value)} className="py-2 px-3 rounded-start-4 border-2" />
                                <Button variant="secondary" className="rounded-end-4 px-4 fw-bold" onClick={addLocation}>추가</Button>
                            </InputGroup>

                            <label className={styles.sectionLabel}> 처리 사이트 연동</label>
                            <Form.Select 
                                className="mb-3 py-2 rounded-4 border-2"
                                value={selectedServiceId}
                                onChange={e => setSelectedServiceId(e.target.value)}
                            >
                                <option value="">직접 URL 입력 또는 선택 안함</option>
                                {serviceList.map(s => (
                                    <option key={s.id} value={s.id}>[{s.type}] {s.name}</option>
                                ))}
                            </Form.Select>
                            
                            {!selectedServiceId && (
                                <Form.Control 
                                    className="mb-3 rounded-4 border-2 px-3 py-2"
                                    placeholder="연결할 외부 URL (https://...)" 
                                    value={formData.url}
                                    onChange={e => setFormData({...formData, url: e.target.value})}
                                />
                            )}

                            <Form.Control as="textarea" rows={4} className="rounded-4 border-2 shadow-sm p-3" placeholder="추가 정보를 입력하세요 (메모, 특이사항 등)" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                        </div>
                    </Col>
                </Row>

                <div className={styles.timeSection}>
                    <div className="d-flex gap-3 mb-4">
                        <Button variant={formData.timeType === 'EXPIRATION' ? "dark" : "outline-dark"} onClick={() => setFormData({...formData, timeType: 'EXPIRATION'})} className="rounded-pill px-4 py-2 fw-bold">유통기한 </Button>
                        <Button variant={formData.timeType === 'AGING' ? "dark" : "outline-dark"} onClick={() => setFormData({...formData, timeType: 'AGING'})} className="rounded-pill px-4 py-2 fw-bold">숙성</Button>
                    </div>
                    <Row className="g-3">
                        <Col md={4}>
                            <label className="fw-bold mb-2 text-muted small ms-2">기준 날짜 (입고일)</label>
                            <Form.Control type="date" className={styles.dateControl} value={formData.referenceDate} onChange={e => setFormData({...formData, referenceDate: e.target.value})} />
                        </Col>
                        {formData.timeType === 'AGING' && (
                            <Col md={4}>
                                <label className="fw-bold text-primary mb-2 small ms-2">숙성 소요 (일)</label>
                                <Form.Control type="number" className={styles.dateControl} placeholder="Day" value={daysToAdd} onChange={e => setDaysToAdd(e.target.value)} />
                            </Col>
                        )}
                        <Col md={formData.timeType === 'AGING' ? 4 : 8}>
                            <label className="fw-bold text-danger mb-2 small ms-2">최종 유효일</label>
                            <Form.Control type="date" className={styles.dateControl} value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} readOnly={formData.timeType === 'AGING'} />
                        </Col>
                    </Row>
                </div>

                <Button className={`${styles.submitButton} w-100 shadow-lg mb-5`} onClick={handleSave} disabled={isUploading}>
                    {isUploading ? <Spinner animation="border" size="sm" /> : "입고 완료 및 시스템 등록"}
                </Button>
            </Container>
            <canvas ref={canvasRef} className="d-none"></canvas>
        </div>
    );
};

export default Inbound;
