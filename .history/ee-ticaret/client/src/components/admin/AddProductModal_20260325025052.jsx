import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card, Image, Alert, Spinner, InputGroup, Badge } from 'react-bootstrap';
import {
    FaTrash, FaImages, FaCloudUploadAlt, FaLayerGroup,
    FaBox, FaPlus, FaTag, FaCogs
} from 'react-icons/fa';

const AddProductModal = ({ show, onHide, onNotification }) => {

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
        sizeOnlyVariants: [],
        colorGroups: []
    };

    const colorDictionary = [
        { tr: "Kırmızı", en: "Red" },
        { tr: "Mavi", en: "Blue" },
        { tr: "Yeşil", en: "Green" },
        { tr: "Siyah", en: "Black" },
        { tr: "Beyaz", en: "White" },
        { tr: "Sarı", en: "Yellow" },
        { tr: "Mor", en: "Purple" },
        { tr: "Turuncu", en: "Orange" },
        { tr: "Gri", en: "Gray" },
        { tr: "Pembe", en: "Pink" }
    ];

    const [newProduct, setNewProduct] = useState(initialState);
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState(null);

    useEffect(() => {
        if (!show) {
            setNewProduct(initialState);
            setVariantType('none');
            setAddError(null);
        }
    }, [show]);

    const addColorGroup = () => {
        const newGroup = {
            id: Date.now(),
            color_name: { tr: '', en: '' },
            color_code: '#4f46e5',
            images: [null, null, null, null],
            previews: [null, null, null, null],
            sizes: [{ id: Date.now(), size: '', stock: '', sku: '' }]
        };
        setNewProduct(prev => ({ ...prev, colorGroups: [...prev.colorGroups, newGroup] }));
    };

    const addSizeToColor = (idx) => {
        const upd = [...newProduct.colorGroups];
        upd[idx].sizes.push({ id: Date.now(), size: '', stock: '', sku: '' });
        setNewProduct({ ...newProduct, colorGroups: upd });
    };

    const handleSave = async () => {
        try {
            setAdding(true);

            const formData = new FormData();

            formData.append('category_key', newProduct.category_key);
            formData.append('price', newProduct.price);
            formData.append('variantType', variantType);
            formData.append('translations', JSON.stringify(newProduct.translations));

            if (variantType === 'color') {

                const variants = [];

                newProduct.colorGroups.forEach((group, gIdx) => {

                    group.images.forEach((img, i) => {
                        if (img) formData.append(`color_${gIdx}_img_${i}`, img);
                    });

                    group.sizes.forEach(sizeItem => {

                        if (!sizeItem.size) return;

                        variants.push({
                            color_name: group.color_name,
                            color_code: group.color_code,
                            size: sizeItem.size,
                            stock: Number(sizeItem.stock || 0),
                            sku: sizeItem.sku,
                            images: group.images.filter(Boolean)
                        });
                    });

                });

                formData.append('variants', JSON.stringify(variants));
                formData.append('hasVariants', true);

            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/addProduct', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Sunucu hatası");

            onNotification("Başarılı", "success");
            onHide();

        } catch (err) {
            setAddError(err.message);
        } finally {
            setAdding(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Body>

                {variantType === 'color' && newProduct.colorGroups.map((group, gIdx) => (
                    <Card key={group.id} className="mb-3">
                        <Card.Body>

                            {/* TEK RENK INPUT */}
                            <Form.Control
                                placeholder="Renk (TR veya EN)"
                                list="color-list"
                                value={group.color_name?.tr || group.color_name?.en || ''}
                                onChange={(e) => {

                                    const val = e.target.value;
                                    const lower = val.toLowerCase();

                                    const matchTR = colorDictionary.find(c => c.tr.toLowerCase() === lower);
                                    const matchEN = colorDictionary.find(c => c.en.toLowerCase() === lower);

                                    let trValue = val;
                                    let enValue = val;

                                    if (matchTR) {
                                        trValue = matchTR.tr;
                                        enValue = matchTR.en;
                                    } else if (matchEN) {
                                        trValue = matchEN.tr;
                                        enValue = matchEN.en;
                                    }

                                    const upd = [...newProduct.colorGroups];

                                    upd[gIdx].color_name = {
                                        tr: trValue,
                                        en: enValue
                                    };

                                    setNewProduct({ ...newProduct, colorGroups: upd });
                                }}
                            />

                            {/* AUTOCOMPLETE */}
                            <datalist id="color-list">
                                {colorDictionary.map((c, i) => (
                                    <option key={i} value={c.tr} />
                                ))}
                                {colorDictionary.map((c, i) => (
                                    <option key={"en" + i} value={c.en} />
                                ))}
                            </datalist>

                            {/* BEDENLER */}
                            {group.sizes.map((s, sIdx) => (
                                <Row key={s.id} className="mt-2">
                                    <Col>
                                        <Form.Control
                                            placeholder="Beden"
                                            value={s.size}
                                            onChange={e => {
                                                const upd = [...newProduct.colorGroups];
                                                upd[gIdx].sizes[sIdx].size = e.target.value;
                                                setNewProduct({ ...newProduct, colorGroups: upd });
                                            }}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            placeholder="Stok"
                                            type="number"
                                            value={s.stock}
                                            onChange={e => {
                                                const upd = [...newProduct.colorGroups];
                                                upd[gIdx].sizes[sIdx].stock = e.target.value;
                                                setNewProduct({ ...newProduct, colorGroups: upd });
                                            }}
                                        />
                                    </Col>
                                </Row>
                            ))}

                            <Button onClick={() => addSizeToColor(gIdx)}>Beden Ekle</Button>

                        </Card.Body>
                    </Card>
                ))}

                <Button onClick={addColorGroup}>Renk Ekle</Button>

                <Button onClick={handleSave} disabled={adding}>
                    {adding ? <Spinner size="sm" /> : 'Kaydet'}
                </Button>

                {addError && <Alert variant="danger">{addError}</Alert>}

            </Modal.Body>
        </Modal>
    );
};

export default AddProductModal;