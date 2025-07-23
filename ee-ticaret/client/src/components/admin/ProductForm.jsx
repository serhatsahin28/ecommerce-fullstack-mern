
// import { useState, useEffect } from "react";

// export default function ProductForm({ product, onSave, onCancel }) {
//   const [form, setForm] = useState({ name: "", price: "" });

//   useEffect(() => {
//     if (product) {
//       setForm(product);
//     } else {
//       setForm({ name: "", price: "" });
//     }
//   }, [product]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!form.name || !form.price) return;
//     onSave({ ...form, price: parseFloat(form.price) });
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <div className="mb-3">
//         <label>Ürün Adı</label>
//         <input
//           type="text"
//           name="name"
//           className="form-control"
//           value={form.name}
//           onChange={handleChange}
//         />
//       </div>
//       <div className="mb-3">
//         <label>Fiyat</label>
//         <input
//           type="number"
//           name="price"
//           className="form-control"
//           value={form.price}
//           onChange={handleChange}
//         />
//       </div>
//       <button type="submit" className="btn btn-success me-2">
//         Kaydet
//       </button>
//       <button type="button" className="btn btn-secondary" onClick={onCancel}>
//         İptal
//       </button>
//     </form>
//   );
// }
