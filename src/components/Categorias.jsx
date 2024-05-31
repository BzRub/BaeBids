import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
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

const ProductCard = ({ producto }) => {
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
            <p className="text-gray-900">por {producto.username}</p>
            {isHovered && (
                <div className="mt-4 flex flex-col items-center">
                    <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded my-1 hover:bg-blue-700">Comprar Ya</button>
                    <button className="bg-green-500 text-white font-bold py-2 px-4 rounded my-1 hover:bg-green-700">Pujar</button>
                </div>
            )}
        </div>
    );
};

const Categorias = () => {
    const [user, setUser] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [products, setProducts] = useState([]);

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
              const productsArray = querySnapshot.docs.map(doc => doc.data());
              setProducts(productsArray);
          };
  
          fetchProducts();
      }
  }, [selectedCategory]);

    const handleCloseModal = () => {
        setShowLoginModal(false);
    };

    const categorias = [
        { nombre: 'Consolas' },
        { nombre: 'Ordenadores' },
        { nombre: 'Moviles' },
        { nombre: 'Camaras' },
        { nombre: 'Musica' },
        { nombre: 'Relojes' }
    ];

    const handleCategoryClick = (nombre) => {
        setSelectedCategory(nombre);
    };

    const handleBackClick = () => {
        setSelectedCategory(null);
        setProducts([]);
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
                        <ProductCard key={index} producto={producto} />
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