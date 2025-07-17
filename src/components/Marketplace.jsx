import React, { useState } from 'react';

const mockProducts = [
  {
    id: 1,
    title: "Mindfulness 101: Guided Meditation Course",
    category: "Course",
    price: 25,
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=500&q=80",
  },
  {
    id: 2,
    title: "The Art of Happiness",
    category: "Book",
    price: 12,
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 3,
    title: "Self-Care Gift Box",
    category: "Product",
    price: 35,
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 4,
    title: "Therapist Finder: 1-on-1 Counseling Session",
    category: "Service",
    price: 50,
    image: "https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 5,
    title: "CBT Workbook for Stress Relief",
    category: "Book",
    price: 18,
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 6,
    title: "Guided Journaling App Subscription",
    category: "Course",
    price: 9,
    image: "https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?auto=format&fit=crop&w=500&q=80",
  },
];

export default function Marketplace() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);

  function handleAddToCart(product) {
    setCart(prev =>
      prev.some(item => item.id === product.id)
        ? prev
        : [...prev, { ...product, quantity: 1 }]
    );
  }

  function handleRemoveFromCart(id) {
    setCart(cart => cart.filter(p => p.id !== id));
  }

  function handleQuantityChange(id, delta) {
    setCart(cart =>
      cart.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  }

  const filtered = mockProducts.filter(
    p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="marketplace-container">
      <header className="marketplace-header">
        <h1>AI Alchemist Marketplace</h1>
        <input
          className="marketplace-search"
          type="text"
          placeholder="Search courses, books, products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="cart-icon">
          🛒
          <span className="cart-count">{cart.length}</span>
        </div>
      </header>

      <main className="marketplace-main">
        <section className="product-list">
          {filtered.length === 0 && (
            <div className="no-products">No products found.</div>
          )}
          {filtered.map(product => (
            <div className="product-card" key={product.id}>
              <img
                className="product-image"
                src={product.image}
                alt={product.title}
              />
              <div className="product-info">
                <div className="product-title">{product.title}</div>
                <div className="product-category">{product.category}</div>
                <div className="product-price">${product.price.toFixed(2)}</div>
                <div className="product-actions">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={cart.some(item => item.id === product.id)}
                  >
                    {cart.some(item => item.id === product.id)
                      ? "Added"
                      : "Add to Cart"}
                  </button>
                  <button className="buy-btn">Buy Now</button>
                  <button className="sell-btn">Sell</button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Cart Drawer */}
        {cart.length > 0 && (
          <aside className="cart-drawer">
            <h3>Your Cart</h3>
            {cart.map(item => (
              <div className="cart-item" key={item.id}>
                <span>{item.title}</span>
                <div className="cart-qty">
                  <button onClick={() => handleQuantityChange(item.id, -1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.id, 1)}>
                    +
                  </button>
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
                <button onClick={() => handleRemoveFromCart(item.id)} className="remove-btn">
                  ×
                </button>
              </div>
            ))}
            <div className="cart-total">
              <strong>Total:</strong> <span>${total.toFixed(2)}</span>
              <button className="checkout-btn">Checkout</button>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
