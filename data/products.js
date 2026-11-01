// /data/products.js — hardcoded fallback, NEVER depends on Supabase. SOSA v20
// Schema: id, name, pricePi (number), category, image, stock, active
export const PRODUCTS = [
  { id: "sosa-001", name: "Ankara Coated Jacket - Red", category: "Female Native Wears", pricePi: 2.5, image: "/images/ankara-red.jpg", stock: 10, active: true, sizes: ["S","M","L","XL"], colors: ["Red","Blue","Wine"], description: "Handmade Ankara coated jacket" },
  { id: "sosa-002", name: "Ankara Coated Jacket - Blue", category: "Female Native Wears", pricePi: 2.5, image: "/images/ankara-blue.jpg", stock: 8, active: true, sizes: ["S","M","L","XL"], colors: ["Blue","Navy","Sky"], description: "Handmade Ankara coated jacket" },
  { id: "sosa-003", name: "Agbada Native - White", category: "Male Native Wears", pricePi: 3.0, image: "/images/agbada-white.jpg", stock: 5, active: true, sizes: ["M","L","XL","XXL"], colors: ["White","Cream","Beige"], description: "Premium Agbada native wear" },
  { id: "sosa-004", name: "Loafers - Brown Leather", category: "Men Shoes", pricePi: 1.8, image: "/images/loafers-brown.jpg", stock: 12, active: true, sizes: ["40","41","42","43","44","45"], colors: ["Brown","Black"], description: "Genuine leather loafers" },
];

export function getProductsWithFallback(supabaseProducts) {
  if (!supabaseProducts || supabaseProducts.length === 0) return PRODUCTS;
  return supabaseProducts;
}
