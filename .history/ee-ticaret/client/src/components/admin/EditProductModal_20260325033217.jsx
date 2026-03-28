import React, { useEffect, useState, useRef } from 'react';
import { Modal, Col, Card, Row, Form, Button, Alert, Image, Spinner, Badge, Table, Tabs, Tab } from 'react-bootstrap';
import { FaSave, FaTrash, FaPlus, FaBoxes, FaInfoCircle, FaCamera, FaListUl, FaExclamationTriangle, FaLanguage } from 'react-icons/fa';

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

    const colorMap = {
        "kırmızı": "#FF0000", "mavi": "#0000FF", "yeşil": "#008000", "siyah": "#000000", "beyaz": "#FFFFFF",
        "sarı": "#FFFF00", "mor": "#800080", "turuncu": "#FFA500", "pembe": "#FFC0CB", "gri": "#808080",
        "lacivert": "#000080", "kahverengi": "#A52A2A", "altın": "#FFD700", "gümüş": "#C0C0C0"
    };

    // Veri Dönüştürme: Backend'den gelen düz listeyi Frontend gruplanmış yapısına çevirir
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
                extraImages: prev?.extraImages?.map(img => (typeof img === 'string' ? { preview: img, file: null } : img)) || [],
                translations: {
                    tr: { name: prev?.translations?.tr?.name || prev?.name || '', description: prev?.translations?.tr?.description || prev?.description || '', features: prev?.translations?.tr?.features || [] },
                    en: { name: prev?.translations?.en?.name || '', description: prev?.translations?.en?.description || '', features: prev?.translations?.en?.features || [] }
                }
            }));
        }
    }, [show, editProduct?._id]);

    const getOptionLabel = () => editProduct?.category_key === 'electronics' ? 'Model / Hafıza' : 'Beden / Ölçü';

    // Renk ismi yazıldığında kodu otomatik bulur
    const handleColorNameChange = (gIdx, val) => {
        const up = [...editProduct.colorGroups];
        up[gIdx].group_name = val;
        const normalizedVal = val.toLowerCase().trim();
        if (colorMap[normalizedVal]) {
            up[gIdx].color_code = colorMap[normalizedVal];
        }
        setEditProduct({ ...editProduct, colorGroups: up });
    };

    const handleFinalSave = async () => {
        setValidationError(null);
        if (!editProduct.translations.tr.name?.trim()) return setValidationError("Ürün adı (TR) zorunludur!");

        const formData = new FormData();
        formData.append('category_key', editProduct.category_key);
        formData.append('price', editProduct.price || 0);
        formData.append('variantType', editProduct.variantType || 'none');
        formData.append('translations', JSON.stringify(editProduct.translations));

        if (editProduct.newMainImage) formData.append('mainImage', editProduct.newMainImage);

        if (editProduct.variantType !== 'none') {
            const processedGroups = editProduct.colorGroups.map((group, gIdx) => {
                const existingUrls = [];
                group.images.forEach((img, iIdx) => {
                    if (img.file) {
                        formData.append(`color_${gIdx}_img_${iIdx}`, img.file);
                    } else {
                        const url = typeof img === 'string' ? img : img.preview;
                        if (url && !url.startsWith('blob:')) existingUrls.push(url);
                    }
                });
                return {
                    ...group,
                    images: existingUrls,
                    color_name: { tr: group.group_name, en: group.group_name_en || group.group_name }
                };
            });
            formData.append('colorGroups', JSON.stringify(processedGroups));
        } else {
            formData.append('stock', editProduct.stock || 0);
            formData.append('sku', editProduct.sku || "");
            const existingExtras = [];
            editProduct.extraImages.forEach((img, idx) => {
                if (img.file) formData.append(`extraImage_${idx}`, img.file);
                else {
                    const url = typeof img === 'string' ? img : img.preview;
                    if (url && !url.startsWith('blob:')) existingExtras.push(url);
                }
            });
            formData.append('extraImages', JSON.stringify(existingExtras));
        }

        onUpdate(editProduct._id, formData);
    };

    if (!editProduct || !editProduct.colorGroups) return null;

    return (
        <Modal show={show} onHide={onHide} size="xl" backdrop="static" centered scrollable className="admin-modal">
            {/* Hidden File Inputs */}
            <input type="file" multiple ref={fileInputRef} hidden onChange={(e) => {
                const files = Array.from(e.target.files);
                if (!files.length || currentGroupIdx === null) return;
                const updated = [...editProduct.colorGroups];
                files.forEach(file => updated[currentGroupIdx].images.push({ file, preview: URL.createObjectURL(file) }));
                setEditProduct({ ...editProduct, colorGroups: updated });
                e.target.value = null;
            }} />
            <input type="file" ref={mainImageInputRef} hidden onChange={(e) => {
                const file = e.target.files[0];
                if (file) setEditProduct({ ...editProduct, image: URL.createObjectURL(file), newMainImage: file });
                e.target.value = null;
            }} />

            <Modal.Header closeButton className="bg-white border-bottom shadow-sm">
                <Modal.Title className="fs-5 fw-bold text-primary d-flex align-items-center">
                    <FaBoxes className="me-2" /> Ürün Düzenleme Paneli
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="bg-light p-0">
                {(updateError || validationError) && (
                    <Alert variant="danger" className="m-3 border-0 shadow-sm d-flex align-items-center">
                        <FaExclamationTriangle className="me-2" /> {updateError || validationError}
                    </Alert>
                )}

                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="px-3 pt-2 bg-white sticky-top shadow-sm border-0">
                    <Tab eventKey="general" title={<span><FaInfoCircle className="me-1" /> Temel Bilgiler</span>} className="p-4">
                        <Row className="g-4">
                            <Col lg={7}>
                                <Card className="border-0 shadow-sm p-4">
                                    <h6 className="fw-bold mb-3 text-secondary text-uppercase" style={{ letterSpacing: '1px' }}>Ürün Kimliği</h6>
                                    <Row className="g-3">
                                        <Col md={12}>
                                            <Form.Label className="small fw-bold">Ürün Başlığı (TR)</Form.Label>
                                            <Form.Control 
                                                className="border-2"
                                                value={editProduct.translations.tr.name} 
                                                onChange={e => setEditProduct({ ...editProduct, translations: { ...editProduct.translations, tr: { ...editProduct.translations.tr, name: e.target.value } } })} 
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <Form.Label className="small fw-bold">Kategori</Form.Label>
                                            <Form.Select value={editProduct.category_key} onChange={e => setEditProduct({ ...editProduct, category_key: e.target.value })}>
                                                <option value="electronics">Elektronik</option>
                                                <option value="clothing">Giyim</option>
                                                <option value="home">Ev & Yaşam</option>
                                            </Form.Select>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Label className="small fw-bold">Baz Fiyat ($)</Form.Label>
                                            <Form.Control type="number" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: e.target.value })} />
                                        </Col>
                                        <Col md={12}>
                                            <Form.Label className="small fw-bold">Ürün Açıklaması (TR)</Form.Label>
                                            <Form.Control as="textarea" rows={4} value={editProduct.translations.tr.description} onChange={e => setEditProduct({ ...editProduct, translations: { ...editProduct.translations, tr: { ...editProduct.translations.tr, description: e.target.value } } })} />
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>

                            <Col lg={5}>
                                <Card className="border-0 shadow-sm p-4 text-center h-100">
                                    <h6 className="fw-bold mb-3 text-secondary text-uppercase">Görsel Yönetimi</h6>
                                    <div className="position-relative d-inline-block mx-auto mb-3">
                                        <Image src={editProduct.image} fluid rounded className="border shadow-sm bg-white" style={{ maxHeight: '250px', minWidth: '200px', objectFit: 'contain' }} />
                                        <Button variant="primary" size="sm" className="position-absolute bottom-0 end-0 m-2 rounded-circle shadow" onClick={() => mainImageInputRef.current.click()}>
                                            <FaCamera />
                                        </Button>
                                    </div>
                                    
                                    {editProduct.variantType === 'none' && (
                                        <div className="mt-4 border-top pt-3 text-start">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="small fw-bold text-muted">EK GALERİ</span>
                                                <Button variant="link" size="sm" onClick={() => extraImageInputRef.current.click()}><FaPlus /> Foto Ekle</Button>
                                            </div>
                                            <div className="d-flex flex-wrap gap-2 p-2 bg-light rounded shadow-inner" style={{ minHeight: '80px' }}>
                                                {editProduct.extraImages?.map((img, idx) => (
                                                    <div key={idx} className="position-relative bg-white p-1 rounded border shadow-sm">
                                                        <Image src={img.preview || img} width={60} height={60} style={{ objectFit: 'cover' }} rounded />
                                                        <Badge bg="danger" className="position-absolute top-0 end-0 cursor-pointer" onClick={() => {
                                                            const cp = { ...editProduct }; cp.extraImages.splice(idx, 1); setEditProduct(cp);
                                                        }}>×</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </Col>
                        </Row>
                    </Tab>

                    <Tab eventKey="variants" title={<span><FaBoxes className="me-1" /> Varyant & Stok</span>} className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border-start border-primary border-4">
                            <div>
                                <span className="small fw-bold text-muted d-block text-uppercase">Varyant Yapısı</span>
                                <Form.Select size="sm" className="fw-bold mt-1" style={{ width: '250px' }} value={editProduct.variantType} onChange={(e) => setEditProduct({ ...editProduct, variantType: e.target.value })}>
                                    <option value="none">Varyantsız (Tek Tip)</option>
                                    <option value="size">Sadece Seçenekler (Beden/Hafıza)</option>
                                    <option value="color">Renk + Seçenekler</option>
                                </Form.Select>
                            </div>
                            {editProduct.variantType !== 'none' && (
                                <Button variant="success" className="fw-bold" onClick={() => {
                                    const isColor = editProduct.variantType === 'color';
                                    const newG = { group_name: isColor ? 'Yeni Renk' : 'Yeni Grup', color_code: isColor ? '#000000' : null, images: [], sizes: [{ variant_id: `v_${Date.now()}`, size: '', stock: 0, sku: '', price: 0 }] };
                                    setEditProduct({ ...editProduct, colorGroups: [...editProduct.colorGroups, newG] });
                                }}>
                                    <FaPlus className="me-2" /> {editProduct.variantType === 'color' ? 'Renk Grubu Ekle' : 'Seçenek Grubu Ekle'}
                                </Button>
                            )}
                        </div>

                        {editProduct.variantType !== 'none' && editProduct.colorGroups.map((group, gIdx) => (
                            <Card key={gIdx} className="border-0 shadow-sm mb-4 overflow-hidden border-start border-primary border-4">
                                <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-0">
                                    <div className="d-flex align-items-center gap-3">
                                        {editProduct.variantType === 'color' ? (
                                            <>
                                                <Form.Control size="sm" className="fw-bold shadow-sm" style={{ width: '200px' }} placeholder="Renk Adı (Örn: Mavi)" value={group.group_name} onChange={(e) => handleColorNameChange(gIdx, e.target.value)} />
                                                <Form.Control type="color" size="sm" className="p-1" style={{ width: '45px', height: '31px' }} value={group.color_code} onChange={(e) => {
                                                    const up = [...editProduct.colorGroups]; up[gIdx].color_code = e.target.value; setEditProduct({ ...editProduct, colorGroups: up });
                                                }} />
                                            </>
                                        ) : <Badge bg="primary" className="p-2">Grup #{gIdx + 1}</Badge>}
                                    </div>
                                    <Button variant="outline-danger" size="sm" className="border-0" onClick={() => {
                                        const up = editProduct.colorGroups.filter((_, i) => i !== gIdx); setEditProduct({ ...editProduct, colorGroups: up });
                                    }}><FaTrash /></Button>
                                </Card.Header>
                                <Card.Body className="pt-0">
                                    <Row className="g-3">
                                        {editProduct.variantType === 'color' && (
                                            <Col lg={3} className="border-end">
                                                <div className="d-flex justify-content-between mb-2 align-items-center">
                                                    <span className="x-small fw-bold text-muted">GRUP FOTOLARI</span>
                                                    <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => { setCurrentGroupIdx(gIdx); fileInputRef.current.click(); }}>+ Ekle</Button>
                                                </div>
                                                <div className="d-flex flex-wrap gap-2 p-2 bg-light rounded" style={{ minHeight: '100px' }}>
                                                    {group.images.map((img, iIdx) => (
                                                        <div key={iIdx} className="position-relative shadow-sm border rounded bg-white p-1">
                                                            <Image src={img.preview || img} width={50} height={50} style={{ objectFit: 'cover' }} rounded />
                                                            <Badge bg="danger" className="position-absolute top-0 end-0 cursor-pointer" style={{ marginTop: '-8px' }} onClick={() => {
                                                                const up = [...editProduct.colorGroups]; up[gIdx].images.splice(iIdx, 1); setEditProduct({ ...editProduct, colorGroups: up });
                                                            }}>×</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Col>
                                        )}
                                        <Col lg={editProduct.variantType === 'color' ? 9 : 12}>
                                            <Table hover responsive className="align-middle">
                                                <thead className="table-light">
                                                    <tr className="x-small text-uppercase text-muted">
                                                        <th>{getOptionLabel()}</th>
                                                        <th width="100">Stok</th>
                                                        <th>SKU / Barkod</th>
                                                        <th width="120">Fiyat Farkı</th>
                                                        <th width="40"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.sizes.map((s, sIdx) => (
                                                        <tr key={sIdx}>
                                                            <td><Form.Control size="sm" value={s.size} placeholder="S, XL, 128GB..." onChange={e => { const up = [...editProduct.colorGroups]; up[gIdx].sizes[sIdx].size = e.target.value; setEditProduct({ ...editProduct, colorGroups: up }); }} /></td>
                                                            <td><Form.Control size="sm" type="number" value={s.stock} onChange={e => { const up = [...editProduct.colorGroups]; up[gIdx].sizes[sIdx].stock = e.target.value; setEditProduct({ ...editProduct, colorGroups: up }); }} /></td>
                                                            <td><Form.Control size="sm" value={s.sku} placeholder="SKU-123" onChange={e => { const up = [...editProduct.colorGroups]; up[gIdx].sizes[sIdx].sku = e.target.value; setEditProduct({ ...editProduct, colorGroups: up }); }} /></td>
                                                            <td><Form.Control size="sm" type="number" className="text-success fw-bold" value={s.price} onChange={e => { const up = [...editProduct.colorGroups]; up[gIdx].sizes[sIdx].price = e.target.value; setEditProduct({ ...editProduct, colorGroups: up }); }} /></td>
                                                            <td className="text-danger fs-5 cursor-pointer" onClick={() => {
                                                                const up = [...editProduct.colorGroups]; up[gIdx].sizes.splice(sIdx, 1); setEditProduct({ ...editProduct, colorGroups: up });
                                                            }}>&times;</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                            <Button variant="link" className="w-100 text-decoration-none x-small fw-bold border bg-white" onClick={() => {
                                                const up = [...editProduct.colorGroups]; up[gIdx].sizes.push({ variant_id: `v_${Date.now()}`, size: '', stock: 0, sku: '', price: 0 }); setEditProduct({ ...editProduct, colorGroups: up });
                                            }}>+ Yeni Seçenek Satırı</Button>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                    </Tab>

                    <Tab eventKey="features" title={<span><FaListUl className="me-1" /> Teknik Özellikler</span>} className="p-4">
                        <Card className="border-0 shadow-sm p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                                <h6 className="fw-bold mb-0 text-primary"><FaLanguage className="me-2" /> Çok Dilli Özellik Listesi</h6>
                                <Button variant="primary" size="sm" className="rounded-pill px-3" onClick={() => {
                                    const cp = { ...editProduct };
                                    cp.translations.tr.features.push('');
                                    cp.translations.en.features.push('');
                                    setEditProduct(cp);
                                }}>+ Özellik Ekle</Button>
                            </div>
                            {editProduct.translations.tr.features.map((feat, idx) => (
                                <Row key={idx} className="mb-3 g-2 align-items-center pb-3 border-bottom border-light">
                                    <Col md={5}>
                                        <div className="d-flex align-items-center">
                                            <Badge bg="info" className="me-2">TR</Badge>
                                            <Form.Control size="sm" value={feat} placeholder="Örn: %100 Pamuk" onChange={e => {
                                                const cp = { ...editProduct }; cp.translations.tr.features[idx] = e.target.value; setEditProduct(cp);
                                            }} />
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="d-flex align-items-center">
                                            <Badge bg="secondary" className="me-2">EN</Badge>
                                            <Form.Control size="sm" value={editProduct.translations.en.features[idx] || ''} placeholder="Ex: 100% Cotton" onChange={e => {
                                                const cp = { ...editProduct }; cp.translations.en.features[idx] = e.target.value; setEditProduct(cp);
                                            }} />
                                        </div>
                                    </Col>
                                    <Col md={1} className="text-end">
                                        <Button variant="light" size="sm" className="text-danger" onClick={() => {
                                            const cp = { ...editProduct };
                                            cp.translations.tr.features.splice(idx, 1);
                                            cp.translations.en.features.splice(idx, 1);
                                            setEditProduct(cp);
                                        }}><FaTrash size={12} /></Button>
                                    </Col>
                                </Row>
                            ))}
                        </Card>
                    </Tab>
                </Tabs>
            </Modal.Body>

            <Modal.Footer className="bg-white border-top p-3">
                <Button variant="link" className="text-muted fw-bold text-decoration-none" onClick={onHide}>Vazgeç</Button>
                <Button variant="primary" className="px-5 fw-bold shadow-sm rounded-pill d-flex align-items-center" onClick={handleFinalSave} disabled={updating}>
                    {updating ? <><Spinner size="sm" className="me-2" /> İşleniyor...</> : <><FaSave className="me-2" /> Güncellemeyi Kaydet</>}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditProductModal;