import React, { useEffect, useState, useRef } from 'react';
import { Modal, Col, Card, Row, Form, Button, Alert, Image, Spinner, Badge, Table, Tabs, Tab } from 'react-bootstrap';
import { FaSave, FaTrash, FaPlus, FaBoxes, FaInfoCircle, FaCamera, FaImages, FaListUl, FaExclamationTriangle } from 'react-icons/fa';

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
    const mainImageInputRef = useRef(null);
    const extraImageInputRef = useRef(null);
    const [currentGroupIdx, setCurrentGroupIdx] = useState(null);

    // Veritabanından gelen veriyi Frontend'e uygun gruplanmış hale getir
    useEffect(() => {
        if (show && editProduct && !editProduct.colorGroups) {
            const variants = editProduct.variants || [];
            const groups = {};

            variants.forEach(v => {
                const groupKey = typeof v.color_name === 'object'
                    ? (v.color_name.tr || v.color_name.en || 'Standart Seçenekler')
                    : (v.color_name || 'Standart Seçenekler');
                if (!groups[groupKey]) {
                    groups[groupKey] = {
                        group_name: groupKey,  // Bu zaten düzgün olacak
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
                extraImages: prev?.extraImages?.map(img => (typeof img === 'string' ? { preview: img, file: null } : img)) || [],
                translations: {
                    tr: { name: prev?.translations?.tr?.name || '', description: prev?.translations?.tr?.description || '', features: prev?.translations?.tr?.features || [] },
                    en: { name: prev?.translations?.en?.name || '', description: prev?.translations?.en?.description || '', features: prev?.translations?.en?.features || [] }
                }
            }));
        }
    }, [show, editProduct?._id, setEditProduct]);

    // --- YARDIMCI ETİKET (Category-Based Label) ---
    const getOptionLabel = () => {
        return editProduct?.category_key === 'electronics' ? 'Hafıza / Model' : 'Beden / Boyut';
    };

    // --- DOSYA VE VARYANT YÖNETİMİ ---
    const addNewVariantGroup = () => {
        const isColor = editProduct.variantType === 'color';
        const newG = {
            group_name: isColor ? 'Yeni Renk' : 'Seçenek Grubu',
            color_code: isColor ? '#000000' : null,
            images: [],
            sizes: [{ variant_id: `v_${Date.now()}`, size: '', stock: 0, sku: '', price: 0 }]
        };
        setEditProduct({
            ...editProduct,
            colorGroups: [...(editProduct.colorGroups || []), newG]
        });
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditProduct({ ...editProduct, image: URL.createObjectURL(file), newMainImage: file });
        }
        e.target.value = null;
    };

    const triggerVariantUpload = (groupIdx) => {
        setCurrentGroupIdx(groupIdx);
        fileInputRef.current?.click();
    };

    const handleVariantImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0 || currentGroupIdx === null) return;
        const updatedGroups = [...editProduct.colorGroups];
        files.forEach(file => {
            updatedGroups[currentGroupIdx].images.push({ file, preview: URL.createObjectURL(file) });
        });
        setEditProduct({ ...editProduct, colorGroups: updatedGroups });
        e.target.value = null;
    };

    const handleFinalSave = async () => {
        setValidationError(null);
        if (!editProduct.translations.tr.name?.trim()) return setValidationError("Ürün adı zorunludur!");

        const formData = new FormData();
        const productId = editProduct._id;

        formData.append('category_key', editProduct.category_key);
        formData.append('price', editProduct.price || 0);
        formData.append('variantType', editProduct.variantType || 'none');
        formData.append('translations', JSON.stringify(editProduct.translations));

        if (editProduct.newMainImage) formData.append('mainImage', editProduct.newMainImage);

        if (editProduct.variantType !== 'none') {
            const processed = editProduct.colorGroups.map((group, gIdx) => {
                const oldUrls = [];
                group.images.forEach((img, iIdx) => {
                    if (img.file) formData.append(`color_${gIdx}_img_${iIdx}`, img.file);
                    else {
                        const url = typeof img === 'string' ? img : img.preview;
                        if (url && !url.startsWith('blob:')) oldUrls.push(url);
                    }
                });
                return { ...group, images: oldUrls };
            });
            formData.append('colorGroups', JSON.stringify(processed));
        } else {
            formData.append('stock', editProduct.stock || 0);
            formData.append('sku', editProduct.sku || "");
            const extras = [];
            editProduct.extraImages.forEach((img, idx) => {
                if (img.file) formData.append(`extraImage_${idx}`, img.file);
                else {
                    const url = typeof img === 'string' ? img : img.preview;
                    if (url && !url.startsWith('blob:')) extras.push(url);
                }
            });
            formData.append('extraImages', JSON.stringify(extras));
        }

        onUpdate(productId, formData);
    };

    if (!editProduct || !editProduct.colorGroups) return null;

    return (
        <Modal show={show} onHide={onHide} size="xl" backdrop="static" centered scrollable>
            <input type="file" multiple ref={fileInputRef} hidden onChange={handleVariantImageUpload} />
            <input type="file" ref={mainImageInputRef} hidden onChange={handleMainImageChange} />
            <input type="file" multiple ref={extraImageInputRef} hidden onChange={(e) => {
                const files = Array.from(e.target.files);
                const newImgs = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
                setEditProduct({ ...editProduct, extraImages: [...editProduct.extraImages, ...newImgs] });
            }} />

            <Modal.Header closeButton className="bg-white border-bottom shadow-sm text-primary">
                <Modal.Title className="fs-5 fw-bold"><FaBoxes className="me-2" /> Ürün Özellik Düzenleyici</Modal.Title>
            </Modal.Header>

            <Modal.Body className="bg-light p-0">
                {(updateError || validationError) && (
                    <Alert variant="danger" className="m-3 border-0 shadow-sm"><FaExclamationTriangle className="me-2" /> {updateError || validationError}</Alert>
                )}

                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="px-3 pt-2 bg-white sticky-top shadow-sm">
                    <Tab eventKey="general" title={<span><FaInfoCircle className="me-1" /> Genel Bilgiler</span>} className="p-4">
                        <Row className="g-4">
                            <Col lg={editProduct.variantType !== 'none' ? 8 : 7}>
                                <Card className="border-0 shadow-sm p-4 h-100">
                                    <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Kimlik & Fiyatlandırma</h6>
                                    <Row className="g-3">
                                        <Col md={12}>
                                            <Form.Label className="small fw-bold">Ürün Adı (TR)</Form.Label>
                                            <Form.Control value={editProduct.translations.tr.name} onChange={e => setEditProduct({ ...editProduct, translations: { ...editProduct.translations, tr: { ...editProduct.translations.tr, name: e.target.value } } })} />
                                        </Col>
                                        <Col md={6}>
                                            <Form.Label className="small fw-bold">Kategori Anahtarı</Form.Label>
                                            <Form.Control value={editProduct.category_key} onChange={e => setEditProduct({ ...editProduct, category_key: e.target.value })} />
                                        </Col>
                                        <Col md={3}><Form.Label className="small fw-bold">Baz Fiyat ($)</Form.Label><Form.Control type="number" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: e.target.value })} /></Col>
                                        {editProduct.variantType === 'none' && (
                                            <Col md={3}><Form.Label className="small fw-bold">Stok</Form.Label><Form.Control type="number" value={editProduct.stock} onChange={e => setEditProduct({ ...editProduct, stock: e.target.value })} /></Col>
                                        )}
                                        <Col md={12}><Form.Label className="small fw-bold">Açıklama (TR)</Form.Label><Form.Control as="textarea" rows={4} value={editProduct.translations.tr.description} onChange={e => setEditProduct({ ...editProduct, translations: { ...editProduct.translations, tr: { ...editProduct.translations.tr, description: e.target.value } } })} /></Col>
                                    </Row>
                                </Card>
                            </Col>

                            <Col lg={editProduct.variantType !== 'none' ? 4 : 5}>
                                <Card className="border-0 shadow-sm p-4 text-center h-100">
                                    <h6 className="fw-bold mb-3 border-bottom pb-2">Ana Görsel</h6>
                                    <div className="mb-4">
                                        <Image src={editProduct.image} fluid rounded className="border mb-3 shadow-sm bg-light" style={{ maxHeight: '220px', objectFit: 'contain' }} />
                                        <Button variant="outline-primary" size="sm" className="w-100 fw-bold" onClick={() => mainImageInputRef.current.click()}><FaCamera className="me-1" /> Kapak Değiştir</Button>
                                    </div>

                                    {editProduct.variantType === 'none' && (
                                        <div className="text-start border-top pt-3">
                                            <div className="d-flex justify-content-between mb-2 align-items-center"><span className="small fw-bold text-muted">GALERİ GÖRSELLERİ</span><Button variant="link" size="sm" onClick={() => extraImageInputRef.current.click()}><FaPlus /> Ekle</Button></div>
                                            <div className="d-flex flex-wrap gap-2 p-2 bg-light rounded shadow-inner" style={{ minHeight: '80px' }}>
                                                {editProduct.extraImages?.map((img, idx) => (
                                                    <div key={idx} className="position-relative bg-white p-1 rounded border shadow-sm">
                                                        <Image src={img.preview || img} width={60} height={60} style={{ objectFit: 'cover' }} rounded />
                                                        <Badge bg="danger" className="position-absolute top-0 end-0 cursor-pointer" onClick={() => { const cp = { ...editProduct }; cp.extraImages.splice(idx, 1); setEditProduct(cp); }}>×</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </Col>
                        </Row>
                    </Tab>

                    <Tab eventKey="variants" title={<span><FaBoxes className="me-1" /> Varyantlar</span>} className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm">
                            <div className="d-flex align-items-center gap-3">
                                <div>
                                    <span className="small fw-bold text-muted d-block mb-1 text-uppercase" style={{ fontSize: '10px' }}>Satış Yapısı</span>
                                    <Form.Select size="sm" className="fw-bold text-primary" value={editProduct.variantType} onChange={(e) => setEditProduct({ ...editProduct, variantType: e.target.value })}>
                                        <option value="none">Varyantsız (Tek Tip Ürün)</option>
                                        <option value="size">Sadece Seçenekler (Hafıza / Beden)</option>
                                        <option value="color">Renk + Seçenekler</option>
                                    </Form.Select>
                                </div>
                            </div>
                            {editProduct.variantType !== 'none' && (
                                <Button variant="success" size="sm" onClick={addNewVariantGroup}>
                                    <FaPlus className="me-1" /> {editProduct.variantType === 'color' ? 'Yeni Renk Ekle' : 'Seçenek Grubu Ekle'}
                                </Button>
                            )}
                        </div>

                        {editProduct.variantType !== 'none' && editProduct.colorGroups.map((group, gIdx) => (
                            <Card key={gIdx} className="border-0 shadow-sm mb-5 overflow-hidden border-start border-primary border-4">
                                <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-4">
                                        {editProduct.variantType === 'color' ? (
                                            <div className="d-flex gap-2">
                                                <Form.Control size="sm" className="fw-bold" style={{ width: '200px' }} placeholder="Renk Adı" value={group.group_name} onChange={(e) => {
                                                    const up = [...editProduct.colorGroups]; up[gIdx].group_name = e.target.value; setEditProduct({ ...editProduct, colorGroups: up });
                                                }} />
                                                <Form.Control type="color" size="sm" style={{ width: '50px' }} value={group.color_code} onChange={(e) => {
                                                    const up = [...editProduct.colorGroups]; up[gIdx].color_code = e.target.value; setEditProduct({ ...editProduct, colorGroups: up });
                                                }} />
                                            </div>
                                        ) : <h6 className="mb-0 fw-bold">Varyant Grup #{gIdx + 1}</h6>}
                                    </div>
                                    <Button variant="outline-danger" size="sm" onClick={() => { const up = editProduct.colorGroups.filter((_, i) => i !== gIdx); setEditProduct({ ...editProduct, colorGroups: up }); }}><FaTrash /></Button>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        {editProduct.variantType === 'color' && (
                                            <Col lg={4} className="border-end text-center">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="small fw-bold uppercase text-muted">GRUP RESİMLERİ</span>
                                                    <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => triggerVariantUpload(gIdx)}>+ Foto Ekle</Button>
                                                </div>
                                                <div className="d-flex flex-wrap gap-2 border p-3 bg-light rounded shadow-inner" style={{ minHeight: '120px' }}>
                                                    {group.images.map((img, iIdx) => (
                                                        <div key={iIdx} className="position-relative bg-white p-1 border rounded shadow-sm">
                                                            <Image src={img.preview || img} width={65} height={65} style={{ objectFit: 'cover' }} rounded />
                                                            <Badge bg="danger" className="position-absolute top-0 end-0 cursor-pointer shadow-sm" style={{ marginTop: '-10px', marginRight: '-10px' }} onClick={() => { const up = [...editProduct.colorGroups]; up[gIdx].images.splice(iIdx, 1); setEditProduct({ ...editProduct, colorGroups: up }); }}>×</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Col>
                                        )}
                                        <Col lg={editProduct.variantType === 'color' ? 8 : 12}>
                                            <Table hover size="sm" className="align-middle text-center">
                                                <thead className="small text-muted bg-light border-bottom text-uppercase">
                                                    <tr><th>{getOptionLabel()}</th><th width="120">STOK</th><th>SKU</th><th width="120">FİYAT FARKI</th><th width="40"></th></tr>
                                                </thead>
                                                <tbody>
                                                    {group.sizes.map((s, sIdx) => (
                                                        <tr key={sIdx} className="bg-white">
                                                            <td><Form.Control size="sm" className="border-0 shadow-none text-center" value={s.size} placeholder="S, XL, 256GB..." onChange={e => { const up = [...editProduct.colorGroups]; up[gIdx].sizes[sIdx].size = e.target.value; setEditProduct({ ...editProduct, colorGroups: up }); }} /></td>
                                                            <td><Form.Control size="sm" type="number" className="border-0 shadow-none bg-light text-center" value={s.stock} onChange={e => { const up = [...editProduct.colorGroups]; up[gIdx].sizes[sIdx].stock = e.target.value; setEditProduct({ ...editProduct, colorGroups: up }); }} /></td>
                                                            <td><Form.Control size="sm" className="border-0 shadow-none text-center text-muted x-small" value={s.sku} placeholder="Barkod" onChange={e => { const up = [...editProduct.colorGroups]; up[gIdx].sizes[sIdx].sku = e.target.value; setEditProduct({ ...editProduct, colorGroups: up }); }} /></td>
                                                            <td><Form.Control size="sm" type="number" className="border-0 shadow-none text-success fw-bold text-center" value={s.price} onChange={e => { const up = [...editProduct.colorGroups]; up[gIdx].sizes[sIdx].price = e.target.value; setEditProduct({ ...editProduct, colorGroups: up }); }} /></td>
                                                            <td className="text-danger cursor-pointer opacity-75" onClick={() => { const up = [...editProduct.colorGroups]; up[gIdx].sizes.splice(sIdx, 1); setEditProduct({ ...editProduct, colorGroups: up }); }}>×</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                            <Button variant="link" className="w-100 mt-2 text-decoration-none bg-light rounded border py-1 x-small fw-bold" onClick={() => {
                                                const up = [...editProduct.colorGroups]; up[gIdx].sizes.push({ variant_id: `v_${Date.now()}`, size: '', stock: 0, sku: '', price: 0 }); setEditProduct({ ...editProduct, colorGroups: up });
                                            }}>+ Seçenek Satırı Ekle</Button>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                    </Tab>

                    <Tab eventKey="features" title={<span><FaListUl className="me-1" /> Özellikler</span>} className="p-4">
                        <Card className="border-0 shadow-sm p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                <h6 className="fw-bold mb-0">Özellik Listesi (TR & EN Senkron)</h6>
                                <Button variant="primary" size="sm" onClick={() => { const cp = { ...editProduct }; cp.translations.tr.features.push(''); cp.translations.en.features.push(''); setEditProduct(cp); }}>+ Yeni Satır</Button>
                            </div>
                            {editProduct.translations.tr.features.map((feat, idx) => (
                                <Row key={idx} className="mb-2 g-2 pb-2 border-bottom border-light">
                                    <Col md={5}><Form.Label className="x-small text-muted mb-0 fw-bold">TR</Form.Label><Form.Control size="sm" value={feat} placeholder="Malzeme, Watt, Model yılı..." onChange={e => { const cp = { ...editProduct }; cp.translations.tr.features[idx] = e.target.value; setEditProduct(cp); }} /></Col>
                                    <Col md={6}><Form.Label className="x-small text-muted mb-0 fw-bold">EN</Form.Label><Form.Control size="sm" value={editProduct.translations.en.features[idx] || ''} placeholder="English equivalent..." onChange={e => { const cp = { ...editProduct }; cp.translations.en.features[idx] = e.target.value; setEditProduct(cp); }} /></Col>
                                    <Col md={1} className="d-flex align-items-end"><Button variant="outline-danger" size="sm" className="w-100" onClick={() => { const cp = { ...editProduct }; cp.translations.tr.features.splice(idx, 1); cp.translations.en.features.splice(idx, 1); setEditProduct(cp); }}>×</Button></Col>
                                </Row>
                            ))}
                        </Card>
                    </Tab>
                </Tabs>
            </Modal.Body>

            <Modal.Footer className="bg-white border-top">
                <Button variant="link" className="text-secondary fw-bold text-decoration-none" onClick={onHide}>Kapat</Button>
                <Button variant="primary" className="px-5 fw-bold shadow rounded-pill" onClick={handleFinalSave} disabled={updating}>
                    {updating ? <Spinner size="sm" className="me-2" /> : <FaSave className="me-2" />} Değişiklikleri Tamamla
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditProductModal;