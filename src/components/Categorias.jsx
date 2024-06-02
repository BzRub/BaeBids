import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import logoConsolas from "../img/LogoConsolas.png";
import logoOrdenadores from "../img/LogoOrdenadores.png";
import logoMoviles from "../img/LogoMoviles.png";
import logoCamaras from "../img/LogoCamaras.png";
import logoMusica from "../img/LogoMusica.png";
import logoRelojes from "../img/LogoRelojes.png";
import Carrousel1 from "../img/Carrousel1.png";
import Carrousel2 from "../img/Carrousel2.png";
import Carrousel3 from "../img/Carrousel3.png";
import Carrousel4 from "../img/Carrousel4.png";
import IconoAtras from '../img/IconoAtras.png';
const Categorias = () => {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
const logos = {
    'Consolas': logoConsolas,
    'Ordenadores': logoOrdenadores,
    'Moviles': logoMoviles,
    'Camaras': logoCamaras,
    'Musica': logoMusica,
    'Relojes': logoRelojes
};

const Carousel = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
                setFade(true);
            }, 1000); // Duración del desvanecimiento
        }, 4000); // Intervalo total incluyendo la duración del desvanecimiento

        return () => clearInterval(interval);
    }, [items.length]);

    return (
        <div className="relative overflow-hidden w-full bg-[#F2F0F1]" style={{ height: '600px' }}>
            <div className={`absolute inset-0 flex items-center transition-opacity duration-1000 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                <img src={items[currentIndex].imagen} alt={items[currentIndex].nombre} className="w-full h-full object-cover" />
            </div>
        </div>
    );
};

const CategoriaCard = ({ categoria, onClick }) => {
    const logo = logos[categoria.nombre];

    return (
        <div className="w-1/6 mx-2 p-4 bg-gray-100 rounded-lg shadow-md text-center cursor-pointer" onClick={() => onClick(categoria.nombre)}>
            <img src={logo} alt={categoria.nombre} className="mx-auto mb-4" style={{ width: '80px', height: '80px' }} />
            <h3 className="text-lg font-semibold">{categoria.nombre}</h3>
        </div>
    );
};

const ProductCard = ({ producto, onBidClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`relative w-1/4 p-4 rounded-lg shadow-md text-center mx-2 mb-4 ${isHovered ? 'bg-gray-200' : 'bg-gray-100'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img src={producto.imageUrl} alt={producto.name} className="mx-auto mb-4" style={{ width: '100px', height: '100px' }} />
            <h3 className="text-lg font-bold">{producto.name}</h3>
            <p className="text-gray-700">{producto.description}</p>
            <p className="text-gray-900 font-semibold">Comprar por {producto.buyNowPrice} €</p>
            <p className="text-gray-900 font-semibold">Pujar por {producto.minBidPrice} €</p>
            <p className="mt-1 text-gray-800 font-bold">Actual bid: {producto.actualBidPrice} EUR</p>
            <p className="text-gray-900">por {producto.username}</p>
            {isHovered && (
                <div className="mt-4 flex flex-col items-center">
                    <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded my-1 hover:bg-blue-700">Comprar Ya</button>
                    <button 
                        className="bg-green-500 text-white font-bold py-2 px-4 rounded my-1 hover:bg-green-700"
                        onClick={() => onBidClick(producto)}
                    >
                        Pujar
                    </button>
                </div>
            )}
        </div>
    );
};

const BidModal = ({ product, onClose, onBidSubmit, userBalance }) => {
    const [bidAmount, setBidAmount] = useState('');

    const handleBidChange = (e) => {
        setBidAmount(e.target.value);
    };

    const handleBidSubmit = () => {
        const bid = parseFloat(bidAmount);
        if (bid > product.actualBidPrice) {
            if (bid <= userBalance) {
                onBidSubmit(bid);
            } else {
                alert('No tienes suficiente saldo para realizar esta puja.');
            }
        } else {
            alert('La puja debe ser mayor que la oferta actual.');
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Pujar por {product.name}</h2>
                <p>Saldo: {userBalance} €</p>
                <p>Oferta actual: {product.actualBidPrice} €</p>
                <input
                    type="number"
                    value={bidAmount}
                    onChange={handleBidChange}
                    placeholder="Introduce tu puja"
                    className="w-full p-2 border border-gray-300 rounded mt-2 mb-4"
                />
                <button
                    onClick={handleBidSubmit}
                    className="bg-green-500 text-white font-bold py-2 px-4 rounded mr-2 hover:bg-green-700"
                >
                    Pujar
                </button>
                <button
                    onClick={onClose}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};


    const categorias = [
        { nombre: 'Consolas' },
        { nombre: 'Ordenadores' },
        { nombre: 'Moviles' },
        { nombre: 'Camaras' },
        { nombre: 'Musica' },
        { nombre: 'Relojes' }
    ];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            const fetchProducts = async () => {
                const q = query(collection(db, 'products'), 
                    where('category', '==', selectedCategory), // Filtrar por categoría
                    where('sold', '==', false) // Filtrar por sold == false
                );
                const querySnapshot = await getDocs(q);
                const productsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(productsArray);
            };

            fetchProducts();
        }
    }, [selectedCategory]);

    useEffect(() => {
        const fetchUserBalance = async () => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserBalance(userDoc.data().saldo);
                }
            }
        };

        fetchUserBalance();
    }, [user]);

    const handleCloseModal = () => {
        setShowLoginModal(false);
    };

    const handleCategoryClick = (nombre) => {
        setSelectedCategory(nombre);
    };

    const handleBackClick = () => {
        setSelectedCategory(null);
        setProducts([]);
    };

    const handleBidClick = (producto) => {
        setSelectedProduct(producto);
        setShowBidModal(true);
    };

    const handleBidSubmit = async (bidAmount) => {
      try {
          if (bidAmount > selectedProduct.buyNowPrice) {
              alert('La puja no puede ser mayor que el precio de compra.');
              return;
          }
  
          // Actualizar el precio de la oferta actual en el producto
          const productDocRef = doc(db, 'products', selectedProduct.id);
          await updateDoc(productDocRef, {
              actualBidPrice: bidAmount,
              username: user.displayName // Asumimos que el nombre de usuario está en el objeto `user`
          });
  
          // Restar el saldo pujado del saldo del usuario
          const userDocRef = doc(db, 'users', user.uid);
          const newBalance = userBalance - bidAmount;
          await updateDoc(userDocRef, {
              saldo: newBalance
          });
  
          // Actualizar el estado del saldo del usuario
          setUserBalance(newBalance);
  
          setShowBidModal(false);
      } catch (error) {
          console.error("Error updating document: ", error);
      }
  };

    return (
        <>
            {user ? (
                <div>
                    <Carousel
                        items={[
                            { id: 1, nombre: 'Producto 1', imagen: Carrousel1 },
                            { id: 2, nombre: 'Producto 2', imagen: Carrousel2 },
                            { id: 3, nombre: 'Producto 3', imagen: Carrousel3 },
                            { id: 4, nombre: 'Producto 4', imagen: Carrousel4 }
                        ]}
                    />
                    <h2 className="text-2xl font-semibold mb-4 text-center mt-8 bg-gradient-to-r from-[#106571] to-[#2AB7CA] text-transparent bg-clip-text font-bold">
                        Categorías
                    </h2>
                    <div className="flex flex-col items-center mt-8">
                        {!selectedCategory ? (
                            <>
                                <div className="flex justify-center mb-8 w-full">
                                    {categorias.slice(0, 3).map((categoria, index) => (
                                        <CategoriaCard key={index} categoria={categoria} onClick={handleCategoryClick} />
                                    ))}
                                </div>
                                <div className="flex justify-center w-full">
                                    {categorias.slice(3).map((categoria, index) => (
                                        <CategoriaCard key={index} categoria={categoria} onClick={handleCategoryClick} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-center w-full flex-wrap">
                                    {products.map((producto, index) => (
                                        <ProductCard key={index} producto={producto} onBidClick={handleBidClick} />
                                    ))}
                                </div>
                                <button
                                    onClick={handleBackClick}
                                    className="mt-4 bg-transparent hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none"
                                >
                                    <img src={IconoAtras} alt="Volver" style={{ width: '24px', height: '24px' }} />
                                </button>
                            </>
                        )}
                    </div>
                    {showBidModal && selectedProduct && (
                        <BidModal 
                            product={selectedProduct} 
                            onClose={() => setShowBidModal(false)} 
                            onBidSubmit={handleBidSubmit}
                            userBalance={userBalance}
                        />
                    )}
                </div>
            ) : (
                showLoginModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-8 rounded-lg">
                            <h2 className="text-2xl font-semibold mb-4">Iniciar sesión</h2>
                            <button onClick={handleCloseModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                                Cerrar
                            </button>
                        </div>
                    </div>
                )
            )}
        </>
    );
};

export default Categorias;
