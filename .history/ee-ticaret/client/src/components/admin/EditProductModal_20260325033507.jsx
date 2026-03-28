import React, { useEffect, useState, useRef } from 'react';
import { Modal, Col, Card, Row, Form, Button, Alert, Image, Spinner, Badge, Table, Tabs, Tab } from 'react-bootstrap';
import { FaSave, FaTrash, FaPlus, FaBoxes, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const EditProductModal = ({
    show,
    onHide,
    editProduct,
    setEditProduct,
    updating,
    updateError,
    onUpdate
}) => {
    const [activeTab, setActiveTab] = useState('general');
    const [validationError, setValidationError] = useState(null);
    const fileInputRef = useRef(null);
    const [currentGroupIdx, setCurrentGroupIdx] = useState(null);

    // --- AKILLI RENK VERİTABANI ---
    const colorDatabase = [
        { tr: "sarı", en: "yellow", hex: "#FFFF00" },
        { tr: "kırmızı", en: "red", hex: "#FF0000" },
        { tr: "mavi", en: "blue", hex: "#0000FF" },
        { tr: "yeşil", en: "green", hex: "#008000" },
        { tr: "siyah", en: "black", hex: "#000000" },
        { tr: "beyaz", en: "white", hex: "#FFFFFF" },
        { tr: "mor", en: "purple", hex: "#800080" },
        { tr: "turuncu", en: "orange", hex: "#FFA500" },
        { tr: "pembe", en: "pink", hex: "#FFC0CB" },
        { tr: "gri", en: "gray", hex: "#808080" },
        { tr: "lacivert", en: "darkblue", hex: "#000080" },
        { tr: "kahverengi", en: "brown", hex: "#A52A2A" }
    ];

    useEffect(() => {
        if (show && editProduct && !editProduct.colorGroups) {
            const variants = editProduct.variants || [];
            const groups = {};

            variants.forEach(v => {
                const groupKey = typeof v.color_name === 'object'
                    ? (v.color_name.tr || v.color_name.en || 'Standart')
                    : (v.color_name || 'Standart');
                
                if (!groups[groupKey]) {
                    groups[groupKey] = {
                        group_name: groupKey,
                        color_code: v.color_code || '#000000',
                        images: v.images || [],
                        sizes: []
                    };
                }
                groups[groupKey].sizes.push({
                    variant_id: v.variant_id || v._id,
                    size: v.size || '',
                    stock: v.stock || 0,
                    sku: v.sku || '',
                    price: v.price || 0
                });
            });

            setEditProduct(prev => ({
                ...prev,
                colorGroups: Object.values(groups),
                variantType: prev?.variantType || 'none',
                translations: {
                    tr: { name: prev?.translations?.tr?.name || prev?.name || '', description: prev?.translations?.tr?.description || prev?.description || '' },
                    en: { name: prev?.translations?.en?.name || '', description: prev?.translations?.en?.description || '' }
                }
            }));
        }
    }, [show, editProduct?._id]);

    // --- AKILLI INPUT MANTIĞI ---
    const handleSmartColorChange = (gIdx, val) => {
        const up = [...editProduct.colorGroups];
        const lowerVal = val.toLowerCase().trim();
        
        // Veritabanında eşleşme ara
        const match = colorDatabase.find(c => c.tr === lowerVal || c.en === lowerVal);

        up[gIdx].group_name = val; 

        if (match) {
            up[gIdx].detected_tr = match.tr;
            up[gIdx].detected_en = match.en;
            up[gIdx].color_code = match.hex; // Hex kodunu da otomatik çekiyoruz
        } else {
            up[gIdx].detected_tr = val;
            up[gIdx].detected_en = val;
        }

        setEditProduct({ ...editProduct, colorGroups: up });
    };

    const handleFinalSave = async () => {
        setValidationError(null);
        if (!editProduct.translations.tr.name?.trim()) return setValidationError("Ürün adı zorunludur!");

        const formData = new FormData();
        formData.append('translations', JSON.stringify(editProduct.translations));
        formData.append('variantType', editProduct.variantType);

        if (editProduct.variantType !== 'none') {
            const processed = editProduct.colorGroups.map((group, gIdx) => {
                const existingUrls = [];
                group.images.forEach((img, iIdx) => {
                    if (img.file) formData.append(`color_${gIdx}_img_${iIdx}`, img.file);
                    else {
                        const url = typeof img === 'string' ? img : img.preview;
                        if (url && !url.startsWith('blob:')) existingUrls.push(url);
                    }
                });
                return {
                    ...group,
                    images: existingUrls,
                    // Kaydedilirken hem TR hem EN değerlerini gönderiyoruz
                    color_name: { 
                        tr: group.detected_tr || group.group_name, 
                        en: group.detected_en || group.group_name 
                    }
                };
            });
            formData.append('colorGroups', JSON.stringify(processed));
        }

        onUpdate(editProduct._id, formData);
    };

    if (!editProduct || !editProduct.colorGroups) return null;

    return (
        <Modal show={show} onHide={onHide} size="xl" centered scrollable>
            {/* Gizli Dosya Inputu */}
            <input type="file" multiple ref={fileInputRef} hidden onChange={(e) => {
                const files = Array.from(e.target.files);
                const updated = [...editProduct.colorGroups];
                files.forEach(file => updated[currentGroupIdx].images.push({ file, preview: URL.createObjectURL(file) }));
                setEditProduct({ ...editProduct, colorGroups: updated });
            }} />

            <Modal.Header closeButton className="bg-white border-bottom shadow-sm">
                <Modal.Title className="fs-5 fw-bold text-primary"><FaBoxes className="me-2" /> Ürün Düzenle</Modal.Title>
            </Modal.Header>

            <Modal.Body className="bg-light p-0">
                {(updateError || validationError) && <Alert variant="danger" className="m-3 border-0 shadow-sm"><FaExclamationTriangle className="me-2" /> {updateError || validationError}</Alert>}

                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="px-3 pt-2 bg-white sticky-top shadow-sm border-0">
                    <Tab eventKey="general" title={<span><FaInfoCircle className="me-1" /> Genel</span>} className="p-4">
                        <Row>
                            <Col md={12}>
                                <Card className="border-0 shadow-sm p-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Ürün Adı (TR)</Form.Label>
                                        <Form.Control 
                                            value={editProduct.translations.tr.name} 
                                            onChange={e => setEditProduct({ ...editProduct, translations: { ...editProduct.translations, tr: { ...editProduct.translations.tr, name: e.target.value } } })} 
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-muted">Açıklama (TR)</Form.Label>
                                        <Form.Control 
                                            as="textarea" rows={3}
                                            value={editProduct.translations.tr.description} 
                                            onChange={e => setEditProduct({ ...editProduct, translations: { ...editProduct.translations, tr: { ...editProduct.translations.tr, description: e.target.value } } })} 
                                        />
                                    </Form.Group>
                                </Card>
                            </Col>
                        </Row>
                    </Tab>

                    <Tab eventKey="variants" title={<span><FaBoxes className="me-1" /> Varyantlar & Renkler</span>} className="p-4">
                        <div className="d-flex justify-content-between mb-4 bg-white p-3 rounded shadow-sm align-items-center">
                            <Form.Select size="sm" style={{ width: '220px' }} value={editProduct.variantType} onChange={(e) => setEditProduct({ ...editProduct, variantType: e.target.value })}>
                                <option value="none">Varyantsız Ürün</option>
                                <option value="color">Renk + Beden/Boyut</option>
                            </Form.Select>
                            {editProduct.variantType !== 'none' && <Button variant="success" size="sm" className="rounded-pill px-3" onClick={() => setEditProduct({...editProduct, colorGroups: [...editProduct.colorGroups, { group_name: '', color_code: '#000000', images: [], sizes: [] }]})}><FaPlus /> Yeni Renk Grubu Ekle</Button>}
                        </div>

                        {editProduct.variantType !== 'none' && editProduct.colorGroups.map((group, gIdx) => (
                            <Card key={gIdx} className="border-0 shadow-sm mb-4 border-start border-primary border-4 overflow-hidden">
                                <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3 border-0">
                                    <div className="d-flex gap-3 align-items-center flex-wrap">
                                        <div className="position-relative">
                                            <Form.Control 
                                                size="sm" 
                                                style={{ width: '200px' }} 
                                                placeholder="Sarı veya Yellow yazın..." 
                                                value={group.group_name} 
                                                onChange={(e) => handleSmartColorChange(gIdx, e.target.value)} 
                                            />
                                        </div>
                                        <Form.Control 
                                            type="color" 
                                            size="sm" 
                                            style={{ width: '45px', height: '31px', padding: '2px' }} 
                                            value={group.color_code} 
                                            onChange={(e) => {
                                                const up = [...editProduct.colorGroups]; up[gIdx].color_code = e.target.value; setEditProduct({ ...editProduct, colorGroups: up });
                                            }} 
                                        />
                                        {group.detected_tr && (
                                            <Badge bg="info" className="p-2 fw-normal opacity-75">
                                                Tanındı: {group.detected_tr} / {group.detected_en}
                                            </Badge>
                                        )}
                                    </div>
                                    <Button variant="outline-danger" size="sm" className="border-0" onClick={() => {
                                        const up = editProduct.colorGroups.filter((_, i) => i !== gIdx); setEditProduct({ ...editProduct, colorGroups: up });
                                    }}><FaTrash /></Button>
                                </Card.Header>
                                <Card.Body className="bg-white pt-0">
                                    <Row className="g-4">
                                        <Col lg={3} className="border-end">
                                            <Form.Label className="small fw-bold text-muted mb-2">Grup Fotoğrafları</Form.Label>
                                            <div className="d-flex flex-wrap gap-2 mb-2 p-2 bg-light rounded shadow-inner" style={{ minHeight: '100px' }}>
                                                {group.images.map((img, iIdx) => (
                                                    <div key={iIdx} className="position-relative border rounded bg-white p-1 shadow-sm">
                                                        <Image src={img.preview || img} width={50} height={50} style={{ objectFit: 'cover' }} className="rounded" />
                                                        <Badge bg="danger" className="position-absolute top-0 end-0 cursor-pointer" style={{ transform: 'translate(30%, -30%)' }} onClick={() => {
                                                            const up = [...editProduct.colorGroups]; up[gIdx].images.splice(iIdx, 1); setEditProduct({ ...editProduct, colorGroups: up });
                                                        }}>×</Badge>
                                                    </div>
                                                ))}
                                                <div 
                                                    className="d-flex align-items-center justify-content-center border border-dashed rounded cursor-pointer text-muted bg-white" 
                                                    style={{ width: '50px', height: '50px' }}
                                                    onClick={() => { setCurrentGroupIdx(gIdx); fileInputRef.current.click(); }}
                                                >
                                                    <FaPlus size={12} />
                                                </div>
                                            </div>
                                        </Col>
                                        <Col lg={9}>
                                            <Form.Label className="small fw-bold text-muted mb-2">Beden / Stok Seçenekleri</Form.Label>
                                            <Table borderless hover size="sm" className="align-middle">
                                                <thead className="bg-light text-muted small">
                                                    <tr>
                                                        <th>BOYUT</th>
                                                        <th>STOK</th>
                                                        <th>SKU</th>
                                                        <th>FİYAT FARK</th>
                                                        <th width="40"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.sizes.map((s, sIdx) => (
                                                        <tr key={sIdx} className="border-bottom">
                                                            <td><Form.Control size="sm" className="border-0 bg-transparent" placeholder="S, M, 42..." value={s.size} onChange={e => { const up = [...editProduct.colorGroups]; up[gIdx].sizes[sIdx].size = e.target.value; setEditProduct({ ...editProduct, colorGroups: up }); }} /></td>
                                                            <td><Form.Control size="sm" type="number" className="border-0 bg-transparent" value={s.stock} onChange={e => { const up = [...editProduct.colorGroups]; up[gIdx].sizes[sIdx].stock = e.target.value; setEditProduct({ ...editProduct, colorGroups: up }); }} /></td>
                                                            <td><Form.Control size="sm" className="border-0 bg-transparent text-muted" value={s.sku} onChange={e => { const up = [...editProduct.colorGroups]; up[gIdx].sizes[sIdx].sku = e.target.value; setEditProduct({ ...editProduct, colorGroups: up }); }} /></td>
                                                            <td><Form.Control size="sm" type="number" className="border-0 bg-transparent text-success fw-bold" value={s.price} onChange={e => { const up = [...editProduct.colorGroups]; up[gIdx].sizes[sIdx].price = e.target.value; setEditProduct({ ...editProduct, colorGroups: up }); }} /></td>
                                                            <td className="text-danger text-center cursor-pointer" onClick={() => { const up = [...editProduct.colorGroups]; up[gIdx].sizes.splice(sIdx, 1); setEditProduct({ ...editProduct, colorGroups: up }); }}>×</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                            <Button variant="link" className="w-100 x-small fw-bold text-decoration-none py-2 text-primary" onClick={() => {
                                                const up = [...editProduct.colorGroups]; up[gIdx].sizes.push({ variant_id: `v_${Date.now()}`, size: '', stock: 0, sku: '', price: 0 }); setEditProduct({ ...editProduct, colorGroups: up });
                                            }}>+ Yeni Beden/Seçenek Ekle</Button>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                    </Tab>
                </Tabs>
            </Modal.Body>

            <Modal.Footer className="bg-white border-top p-3">
                <Button variant="link" className="text-muted fw-bold text-decoration-none" onClick={onHide}>İptal Et</Button>
                <Button variant="primary" className="px-5 fw-bold shadow-sm rounded-pill" onClick={handleFinalSave} disabled={updating}>
                    {updating ? <Spinner size="sm" className="me-2" /> : <FaSave className="me-2" />} Değişiklikleri Kaydet
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditProductModal;