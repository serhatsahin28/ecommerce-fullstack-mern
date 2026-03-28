

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card, Image, Alert, Spinner, InputGroup, Badge } from 'react-bootstrap';
import {
    FaTrash, FaImages, FaCloudUploadAlt, FaLayerGroup,
    FaPalette, FaRulerCombined, FaBox, FaPlus, FaTag, FaCogs
} from 'react-icons/fa';

const AddProductModal = ({ show, onHide, onNotification }) => {
    // variantType: 'none' (Standart), 'size' (Sadece Beden), 'color' (Renk ve Beden)
    const [variantType, setVariantType] = useState('none');

    const initialState = {
        category_key: '',
        price: '',
        global_stock: '',
        global_sku: '',
        translations: {
            tr: { name: '', description: '', features: [''] },
            en: { name: '', description: '', features: [''] }
        },
        mainImage: null,
        extraImages: [null, null, null],
        sizeOnlyVariants: [], // Sadece bedenli mod için
        colorGroups: [] // Renkli ve bedenli mod için
    };

    const [newProduct, setNewProduct] = useState(initialState);
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState(null);

    // Modal kapandığında formu sıfırla
    useEffect(() => {
        if (!show) {
            setNewProduct(initialState);
            setVariantType('none');
            setAddError(null);
        }
    }, [show]);

    // --- YARDIMCI FONKSİYONLAR ---

    // Renk Grubu Ekle (Kırmızı, Mavi vb.)
    const addColorGroup = () => {
        const newGroup = {
            id: Date.now(),
            color_name: {
                tr: '',
                en: ''
            },
            color_code: '#4f46e5',
            images: [null, null, null, null],
            previews: [null, null, null, null],
            sizes: [{ id: Date.now() + 1, size: '', stock: '', sku: '' }]
        };
        setNewProduct(prev => ({ ...prev, colorGroups: [...prev.colorGroups, newGroup] }));
    };

    // Bir Rengin Altına Yeni Beden Ekle
    const addSizeToColor = (colorIdx) => {
        const updatedGroups = [...newProduct.colorGroups];
        updatedGroups[colorIdx].sizes.push({ id: Date.now(), size: '', stock: '', sku: '' });
        setNewProduct({ ...newProduct, colorGroups: updatedGroups });
    };

    // Sadece Beden Varyantı Ekle (Renk yokken)
    const addSizeOnlyVariant = () => {
        setNewProduct(prev => ({
            ...prev,
            sizeOnlyVariants: [...prev.sizeOnlyVariants, { id: Date.now(), size: '', stock: '', sku: '' }]
        }));
    };

    // --- KAYIT İŞLEMİ ---
    const handleSave = async () => {
        try {
            if (!newProduct.category_key) throw new Error("Lütfen kategori seçiniz.");
            if (!newProduct.translations.tr.name) throw new Error("Türkçe ürün adı zorunludur.");

            setAdding(true);
            const formData = new FormData();

            formData.append('category_key', newProduct.category_key);
            formData.append('price', newProduct.price);
            formData.append('variantType', variantType);
            formData.append('translations', JSON.stringify(newProduct.translations));

            if (variantType !== 'color') {
                // Standart veya Bedenli: Ana Resimler
                if (newProduct.mainImage) formData.append('mainImage', newProduct.mainImage);
                newProduct.extraImages.forEach((img, i) => { if (img) formData.append(`extraImage_${i}`, img); });

                if (variantType === 'none') {
                    formData.append('stock', newProduct.global_stock);
                    formData.append('sku', newProduct.global_sku);
                } else {
                    formData.append('variants', JSON.stringify(newProduct.sizeOnlyVariants));
                }
            } else {
                // Renkli: Gruplandırılmış varyantlar
                const cleanGroups = newProduct.colorGroups.map((group, gIdx) => {
                    group.images.forEach((img, i) => {
                        if (img) formData.append(`color_${gIdx}_img_${i}`, img);
                    });
                    const { images, previews, ...rest } = group;
                    return rest;
                });
                formData.append('colorGroups', JSON.stringify(cleanGroups));
            }

            const res = await fetch('http://localhost:5000/admin/addProduct', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Sunucu hatası oluştu.");

            onNotification("Ürün başarıyla eklendi", "success");
            onHide();
        } catch (err) {
            setAddError(err.message);
        } finally {
            setAdding(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered scrollable>
            <Modal.Header closeButton className="bg-white border-bottom-0 pt-4 px-4">
                <Modal.Title className="fw-bold text-dark d-flex align-items-center">
                    <div className="bg-primary text-white p-2 rounded-3 me-3 shadow-sm"><FaCogs size={20} /></div>
                    Yeni Ürün Yapılandırma
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4 pb-4 bg-light">
                {addError && <Alert variant="danger" className="rounded-3 shadow-sm">{addError}</Alert>}

                <Row className="g-4">
                    {/* SOL PANEL: ÜRÜN DETAYLARI */}
                    <Col lg={6}>
                        <Card className="border-0 shadow-sm rounded-4 mb-4">
                            <Card.Body className="p-4">
                                <h6 className="fw-bold mb-4 text-uppercase small text-primary"><FaTag className="me-2" />Temel Bilgiler</h6>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">Kategori</Form.Label>
                                    <Form.Select
                                        className="form-control-lg border-0 bg-light"
                                        value={newProduct.category_key}
                                        onChange={e => setNewProduct({ ...newProduct, category_key: e.target.value })}
                                    >
                                        <option value="">Seçiniz...</option>
                                        <option value="electronics">Electronics (Elektronik)</option>
                                        <option value="fashion">Fashion (Moda & Giyim)</option>
                                        <option value="home_office">Home & Office (Ev & Ofis)</option>
                                        <option value="books">Books (Kitap & Kırtasiye)</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">Satış Modeli (Varyasyon)</Form.Label>
                                    <div className="d-flex gap-2 p-1 bg-light rounded-3">
                                        {[
                                            { id: 'none', n: 'Standart (Varyantsız)' },
                                            { id: 'size', n: 'Beden Varyantlı' },
                                            { id: 'color', n: 'Renk & Beden' }
                                        ].map(t => (
                                            <Button
                                                key={t.id}
                                                variant={variantType === t.id ? 'white' : 'transparent'}
                                                size="sm"
                                                className={`flex-grow-1 border-0 shadow-none ${variantType === t.id ? 'shadow-sm fw-bold text-primary' : 'text-muted'}`}
                                                onClick={() => setVariantType(t.id)}
                                            >
                                                {t.n}
                                            </Button>
                                        ))}
                                    </div>
                                </Form.Group>

                                <Row className="mb-4">
                                    <Col md={12}>
                                        <Form.Label className="small fw-bold">Taban Fiyat ($)</Form.Label>
                                        <InputGroup className="bg-light rounded-3 overflow-hidden border-0 shadow-sm">
                                            <InputGroup.Text className="bg-transparent border-0"><FaBox size={14} /></InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder="0.00"
                                                className="bg-transparent border-0 py-2"
                                                value={newProduct.price}
                                                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                            />
                                        </InputGroup>
                                    </Col>
                                </Row>

                                <hr className="my-4 opacity-50" />

                                {/* DİL SEKMELERİ */}
                                <div className="mb-4">
                                    <Badge bg="primary" className="mb-2 px-3 py-2 rounded-pill shadow-sm">Türkçe İçerik</Badge>
                                    <Form.Control placeholder="Ürün Adı" className="mb-2 fw-bold border-0 bg-light py-2" value={newProduct.translations.tr.name} onChange={e => { let t = { ...newProduct.translations }; t.tr.name = e.target.value; setNewProduct({ ...newProduct, translations: t }) }} />
                                    <Form.Control as="textarea" rows={3} placeholder="Ürün açıklaması..." className="border-0 bg-light" value={newProduct.translations.tr.description} onChange={e => { let t = { ...newProduct.translations }; t.tr.description = e.target.value; setNewProduct({ ...newProduct, translations: t }) }} />
                                </div>

                                <div>
                                    <Badge bg="secondary" className="mb-2 px-3 py-2 rounded-pill shadow-sm">English Content</Badge>
                                    <Form.Control placeholder="Product Name" className="mb-2 fw-bold border-0 bg-light py-2" value={newProduct.translations.en.name} onChange={e => { let t = { ...newProduct.translations }; t.en.name = e.target.value; setNewProduct({ ...newProduct, translations: t }) }} />
                                    <Form.Control as="textarea" rows={3} placeholder="Product description..." className="border-0 bg-light" value={newProduct.translations.en.description} onChange={e => { let t = { ...newProduct.translations }; t.en.description = e.target.value; setNewProduct({ ...newProduct, translations: t }) }} />
                                </div>
                            </Card.Body>
                        </Card>

                        {/* ÖZELLİKLER */}
                        <Card className="border-0 shadow-sm rounded-4">
                            <Card.Body className="p-4">
                                <h6 className="fw-bold mb-3 text-uppercase small text-muted">Teknik Özellikler</h6>
                                {newProduct.translations.tr.features.map((_, idx) => (
                                    <div key={idx} className="mb-2 p-2 bg-light rounded-3 border-start border-primary border-4 shadow-sm">
                                        <div className="d-flex gap-2">
                                            <div className="flex-grow-1">
                                                <Form.Control size="sm" className="mb-1 border-0 fw-bold bg-transparent shadow-none" placeholder="Özellik (TR)" value={newProduct.translations.tr.features[idx]} onChange={e => {
                                                    const upd = [...newProduct.translations.tr.features]; upd[idx] = e.target.value;
                                                    setNewProduct({ ...newProduct, translations: { ...newProduct.translations, tr: { ...newProduct.translations.tr, features: upd } } });
                                                }} />
                                                <Form.Control size="sm" className="border-0 text-muted bg-transparent shadow-none small" placeholder="Feature (EN)" value={newProduct.translations.en.features[idx]} onChange={e => {
                                                    const upd = [...newProduct.translations.en.features]; upd[idx] = e.target.value;
                                                    setNewProduct({ ...newProduct, translations: { ...newProduct.translations, en: { ...newProduct.translations.en, features: upd } } });
                                                }} />
                                            </div>
                                            <Button variant="link" className="text-danger" onClick={() => {
                                                const tr = newProduct.translations.tr.features.filter((_, i) => i !== idx);
                                                const en = newProduct.translations.en.features.filter((_, i) => i !== idx);
                                                setNewProduct({ ...newProduct, translations: { tr: { ...newProduct.translations.tr, features: tr }, en: { ...newProduct.translations.en, features: en } } });
                                            }}><FaTrash size={12} /></Button>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline-primary" size="sm" className="w-100 border-dashed mt-2" onClick={() => {
                                    setNewProduct(prev => ({
                                        ...prev,
                                        translations: {
                                            tr: { ...prev.translations.tr, features: [...prev.translations.tr.features, ''] },
                                            en: { ...prev.translations.en, features: [...prev.translations.en.features, ''] }
                                        }
                                    }));
                                }}>+ Özellik Ekle</Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* SAĞ PANEL: GÖRSELLER VE VARYANTLAR */}
                    <Col lg={6}>

                        {/* 1. GÖRSELLER (Sadece Renk Varyantı Yoksa) */}
                        {variantType !== 'color' && (
                            <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                                <Card.Body className="p-4 text-center">
                                    <h6 className="fw-bold mb-3 text-uppercase small text-muted text-start"><FaImages className="me-2" />Ürün Resimleri</h6>
                                    <div className="ratio ratio-16x9 border border-2 border-dashed rounded-4 bg-white d-flex align-items-center justify-content-center position-relative mb-3">
                                        {newProduct.mainImage ?
                                            <Image src={URL.createObjectURL(newProduct.mainImage)} className="object-fit-contain p-2 h-100 w-100" /> :
                                            <div className="text-muted"><FaCloudUploadAlt size={40} className="text-primary" /><br />Ana Kapak Resmi</div>
                                        }
                                        <input type="file" className="position-absolute w-100 h-100 opacity-0 cursor-pointer" onChange={e => setNewProduct({ ...newProduct, mainImage: e.target.files[0] })} />
                                    </div>
                                    <div className="d-flex justify-content-between gap-2">
                                        {newProduct.extraImages.map((img, i) => (
                                            <div key={i} className="flex-grow-1 border border-2 border-dashed rounded-3 bg-white d-flex align-items-center justify-content-center position-relative overflow-hidden" style={{ height: '70px' }}>
                                                {img ? <Image src={URL.createObjectURL(img)} className="w-100 h-100 object-fit-cover" /> : <FaImages className="text-muted opacity-50" />}
                                                <input type="file" className="position-absolute w-100 h-100 opacity-0 cursor-pointer" onChange={e => {
                                                    const upd = [...newProduct.extraImages]; upd[i] = e.target.files[0];
                                                    setNewProduct({ ...newProduct, extraImages: upd });
                                                }} />
                                            </div>
                                        ))}
                                    </div>
                                </Card.Body>
                            </Card>
                        )}

                        {/* 2. STOK VE VARYANT YÖNETİMİ */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold text-uppercase small text-muted mb-0"><FaLayerGroup className="me-2" />Varyant ve Envanter</h6>
                            {variantType === 'size' && <Button variant="dark" size="sm" className="rounded-pill px-3 shadow" onClick={addSizeOnlyVariant}><FaPlus size={10} className="me-1" /> Beden Ekle</Button>}
                            {variantType === 'color' && <Button variant="dark" size="sm" className="rounded-pill px-3 shadow" onClick={addColorGroup}><FaPlus size={10} className="me-1" /> Renk Grubu Ekle</Button>}
                        </div>

                        {/* A. STANDART ÜRÜN STOK */}
                        {variantType === 'none' && (
                            <Card className="border-0 shadow-sm rounded-4">
                                <Card.Body className="d-flex gap-3 p-4">
                                    <div className="flex-grow-1">
                                        <Form.Label className="small fw-bold">Toplam Stok</Form.Label>
                                        <Form.Control type="number" placeholder="Adet" className="bg-light border-0 py-2 fw-bold" value={newProduct.global_stock} onChange={e => setNewProduct({ ...newProduct, global_stock: e.target.value })} />
                                    </div>
                                    <div className="flex-grow-1">
                                        <Form.Label className="small fw-bold">SKU (Barkod)</Form.Label>
                                        <Form.Control placeholder="PRO-1001" className="bg-light border-0 py-2" value={newProduct.global_sku} onChange={e => setNewProduct({ ...newProduct, global_sku: e.target.value })} />
                                    </div>
                                </Card.Body>
                            </Card>
                        )}

                        {/* B. SADECE BEDENLİ STOK */}
                        {variantType === 'size' && newProduct.sizeOnlyVariants.map((v, idx) => (
                            <div key={v.id} className="d-flex gap-2 mb-2 bg-white p-3 rounded-4 border shadow-sm align-items-end animate-fade-in">
                                <div style={{ flex: 2 }}><Form.Label className="x-small fw-bold">Beden</Form.Label><Form.Control size="sm" placeholder="S, M, 42 vb." className="bg-light border-0" value={v.size} onChange={e => { const upd = [...newProduct.sizeOnlyVariants]; upd[idx].size = e.target.value; setNewProduct({ ...newProduct, sizeOnlyVariants: upd }) }} /></div>
                                <div style={{ flex: 1 }}><Form.Label className="x-small fw-bold">Stok</Form.Label><Form.Control size="sm" type="number" className="bg-light border-0" value={v.stock} onChange={e => { const upd = [...newProduct.sizeOnlyVariants]; upd[idx].stock = e.target.value; setNewProduct({ ...newProduct, sizeOnlyVariants: upd }) }} /></div>
                                <div style={{ flex: 2 }}><Form.Label className="x-small fw-bold">SKU</Form.Label><Form.Control size="sm" className="bg-light border-0" value={v.sku} onChange={e => { const upd = [...newProduct.sizeOnlyVariants]; upd[idx].sku = e.target.value; setNewProduct({ ...newProduct, sizeOnlyVariants: upd }) }} /></div>
                                <Button variant="link" className="text-danger p-1" onClick={() => setNewProduct({ ...newProduct, sizeOnlyVariants: newProduct.sizeOnlyVariants.filter((_, i) => i !== idx) })}><FaTrash /></Button>
                            </div>
                        ))}

                        {/* C. RENKLİ VE BEDENLİ (Gruplandırılmış) */}
                        {variantType === 'color' && newProduct.colorGroups.map((group, gIdx) => (
                            <Card key={group.id} className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden border-start border-primary border-5">
                                <Card.Body className="p-4">
                                    <Row className="g-3 mb-4 align-items-center">
                                        <Col xs={6}>
                                            <Form.Label className="x-small fw-bold text-muted">Renk Tanımı</Form.Label>
                                            <InputGroup size="sm" className="bg-light rounded-3 overflow-hidden border">
                                                {/* <Form.Control type="color" className="p-1 border-0" style={{ maxWidth: '45px', height: '34px' }} value={group.color_code} onChange={e => { const upd = [...newProduct.colorGroups]; upd[gIdx].color_code = e.target.value; setNewProduct({ ...newProduct, colorGroups: upd }) }} />
                                                <Form.Control placeholder="Renk İsmi" className="fw-bold border-0 bg-transparent" value={group.color_name} onChange={e => { const upd = [...newProduct.colorGroups]; upd[gIdx].color_name = e.target.value; setNewProduct({ ...newProduct, colorGroups: upd }) }} /> */}

                                                
                                            </InputGroup>
                                        </Col>
                                        <Col xs={6} className="d-flex gap-1 justify-content-end">
                                            {[0, 1, 2, 3].map(i => (
                                                <div key={i} className="border border-dashed rounded bg-light position-relative overflow-hidden" style={{ width: '40px', height: '40px' }}>
                                                    {group.previews[i] ? <Image src={group.previews[i]} className="w-100 h-100 object-fit-cover" /> : <FaImages className="text-muted opacity-50" size={12} />}
                                                    <input type="file" className="position-absolute w-100 h-100 opacity-0 cursor-pointer" onChange={e => {
                                                        const file = e.target.files[0];
                                                        const upd = [...newProduct.colorGroups];
                                                        upd[gIdx].images[i] = file;
                                                        upd[gIdx].previews[i] = URL.createObjectURL(file);
                                                        setNewProduct({ ...newProduct, colorGroups: upd });
                                                    }} />
                                                </div>
                                            ))}
                                            <Button variant="link" className="text-danger ms-2 p-0 shadow-none" onClick={() => setNewProduct({ ...newProduct, colorGroups: newProduct.colorGroups.filter((_, i) => i !== gIdx) })}><FaTrash /></Button>
                                        </Col>
                                    </Row>

                                    <div className="bg-light p-3 rounded-4 border">
                                        <h6 className="x-small fw-bold text-muted mb-3">Bu Renk İçin Bedenler ve Stoklar</h6>
                                        {group.sizes.map((s, sIdx) => (
                                            <Row key={s.id} className="g-2 mb-2 align-items-center">
                                                <Col xs={3}><Form.Control size="sm" className="border-0 shadow-sm" placeholder="Beden" value={s.size} onChange={e => { const upd = [...newProduct.colorGroups]; upd[gIdx].sizes[sIdx].size = e.target.value; setNewProduct({ ...newProduct, colorGroups: upd }) }} /></Col>
                                                <Col xs={3}><Form.Control size="sm" className="border-0 shadow-sm" type="number" placeholder="Stok" value={s.stock} onChange={e => { const upd = [...newProduct.colorGroups]; upd[gIdx].sizes[sIdx].stock = e.target.value; setNewProduct({ ...newProduct, colorGroups: upd }) }} /></Col>
                                                <Col xs={4}><Form.Control size="sm" className="border-0 shadow-sm" placeholder="Barkod/SKU" value={s.sku} onChange={e => { const upd = [...newProduct.colorGroups]; upd[gIdx].sizes[sIdx].sku = e.target.value; setNewProduct({ ...newProduct, colorGroups: upd }) }} /></Col>
                                                <Col xs={2} className="text-end"><Button variant="link" className="text-muted p-0 shadow-none" onClick={() => {
                                                    const upd = [...newProduct.colorGroups];
                                                    upd[gIdx].sizes = upd[gIdx].sizes.filter((_, i) => i !== sIdx);
                                                    setNewProduct({ ...newProduct, colorGroups: upd });
                                                }}><FaTrash size={12} /></Button></Col>
                                            </Row>
                                        ))}
                                        <Button variant="outline-primary" size="sm" className="w-100 mt-2 py-1 border-dashed rounded-pill" onClick={() => addSizeToColor(gIdx)}><FaPlus size={10} className="me-1" /> Bu Renge Beden Ekle</Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </Col>
                </Row>
            </Modal.Body>

            <Modal.Footer className="border-0 px-4 pb-4 bg-light">
                <Button variant="white" className="px-4 fw-bold text-muted rounded-pill shadow-sm" onClick={onHide}>Vazgeç</Button>
                <Button variant="primary" className="px-5 fw-bold rounded-pill shadow" onClick={handleSave} disabled={adding}>{adding ? <Spinner size="sm" className="me-2" /> : 'Ürünü Kaydet'}</Button>
            </Modal.Footer>

            <style>{`
                .border-dashed { border-style: dashed !important; border-width: 2px !important; }
                .x-small { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
                .object-fit-cover { object-fit: cover; }
                .object-fit-contain { object-fit: contain; }
                .animate-fade-in { animation: fadeIn 0.3s ease-in; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .modal-content { border-radius: 20px; border: none; }
                .form-control:focus, .form-select:focus { shadow-none; border-color: #4f46e5; }
            `}</style>
        </Modal>
    );
};

export default AddProductModal;