import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard"; // make sure this file exists

export default function Products({ search }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.grid}>
      {filteredProducts.length === 0 ? (
        <p style={styles.noProducts}>No products found 😕</p>
      ) : (
        filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))
      )}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
    padding: "20px",
  },
  noProducts: {
    textAlign: "center",
    width: "100%",
    fontSize: "18px",
  },
};