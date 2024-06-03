import React, { useState, useEffect, useCallback } from "react";
import { auth, db, storage } from "./firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  collection, doc, setDoc, getDocs, getDoc, deleteDoc, addDoc, query, where
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import perfilImage from "../img/perfil.png";
import logoImage from "../img/logoBaeBids.png";
import botonFotoPerfil from "../img/botonFotoPerfil.png"; // Importa la imagen del botón
import logoSaldo from "../img/logoSaldo.png";
import botonCamara from "../img/botonCamara.png";
import LogoPapelera from "../img/LogoPapelera.png";

const Header = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [owner, setOwner] = useState("");
  const [highestBidder, setHighestBidder] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [editMode, setEditMode] = useState(false); // Estado para el modo de edición
  const [newUsername, setNewUsername] = useState(""); // Nuevo nombre de usuario
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [minBidPrice, setMinBidPrice] = useState("");
  const [actualBidPrice, setActualBidPrice] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");
  const [minDate] = useState(new Date()); // Define minDate as a state variable
  const [productImage, setProductImage] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [uploadedProducts, setUploadedProducts] = useState([]);
  const [showUploadedProductsModal, setShowUploadedProductsModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [bidError, setBidError] = useState(""); // Estado para manejar el mensaje de error
  const [ownedProducts, setOwnedProducts] = useState([]);
  const [showOwnedProductsModal, setShowOwnedProductsModal] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setOpacity(1); // Set the opacity to 1 after the component mounts
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      setOpacity(0); // Fade out the form
      setTimeout(() => setOpacity(1), 100); // Fade in the user area after the form fades out
    } else {
      setOpacity(0); // Fade out the user area
      setTimeout(() => setOpacity(1), 100); // Fade in the form after the user area fades out
    }
  }, [user]);

  const getBalance = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        return userData.saldo;
      } else {
        throw new Error("User document not found");
      }
    } catch (error) {
      console.error("Error getting user balance:", error.message);
      return 0; // Retorna 0 si hay un error o el documento de usuario no existe
    }
  };

  const fetchUploadedProducts = useCallback(async () => {
    if (user) {
      const q = query(collection(db, "products"), where("username", "==", user.displayName), where ("sold", "==", false));
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUploadedProducts(products);
    }
  }, [user]);

  useEffect(() => {
    if (showUploadedProductsModal) {
      fetchUploadedProducts();
    }
  }, [showUploadedProductsModal, fetchUploadedProducts]);


  const fetchOwnedProducts = useCallback(async () => {
    if (user) {
      const q = query(collection(db, "products"), where("owner", "==", user.displayName), where ("sold", "==", true));
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOwnedProducts(products);
    }
  }, [user]);

  useEffect(() => {
    if (showOwnedProductsModal) {
      fetchOwnedProducts();
    }
  }, [showOwnedProductsModal, fetchOwnedProducts]);



  useEffect(() => {
    const fetchBalance = async () => {
      const userBalance = await getBalance();
      setBalance(userBalance);
    };
    fetchBalance();
  }, [user]);

  const isValidUsername = (username) => {
    const MIN_LENGTH = 3;
    const MAX_LENGTH = 20;
    const validCharacters = /^[a-zA-Z0-9_]+$/;

    return (
      username.length >= MIN_LENGTH &&
      username.length <= MAX_LENGTH &&
      validCharacters.test(username)
    );
  };

  const getUsernameFromUID = async (uid) => {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return userDoc.data().username;
    } else {
      throw new Error("No user found with the given UID.");
    }
  };

  const handleProductSubmit = async (e) => {
    
    e.preventDefault();

    try {
      const storageRef = ref(storage, `productImages/${productImage.name}`);
      await uploadBytes(storageRef, productImage);
      const imageUrl = await getDownloadURL(storageRef);

      if (user) {
        const uid = user.uid;
        const fetchedUsername = await getUsernameFromUID(uid);

        await addDoc(collection(db, "products"), {
          name: productName,
          description: productDescription,
          minBidPrice: minBidPrice,
          buyNowPrice: buyNowPrice,
          endDate: endDate,
          category: category,
          imageUrl: imageUrl,
          username: fetchedUsername,
          sold: false,
          actualBidPrice: minBidPrice,
          owner: fetchedUsername,
          highestBidder: ""
        });

        setProductName("");
        setProductDescription("");
        setMinBidPrice(0);
        setBuyNowPrice(0);
        setEndDate("");
        setCategory("");
        setProductImage(null); 
        setActualBidPrice(0);
        setUsername("");
        setOwner("");
        setHighestBidder("")

        alert("Producto agregado exitosamente");
      } else {
        alert("No user is logged in.");
      }
    } catch (error) {
      alert("Error al agregar el producto: " + error.message);
    }
  };
  const handleRegister = async () => {

    if (!isValidUsername(username)) {
      setErrorMessage(
        "Username only contain letters and numbers, no longer than 16 characters and not shorter than 3."
      );
      return;
    }
  
    try {
      // Verificar si el nombre de usuario ya existe
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("username", "==", username));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        throw new Error("Username already exists");
      }
  
      // Generar un correo electrónico ficticio basado en el nombre de usuario
      const fakeEmail = `${username}@example.com`;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        fakeEmail,
        password
      );
      const user = userCredential.user;
  
      // Actualizar el perfil del usuario con el nombre de usuario y la foto de perfil
      await updateProfile(user, {
        displayName: username,
        photoURL: perfilImage,
      });
  
      // Crear un documento en la colección 'users' con el UID del usuario como ID
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: username,
        photoURL: perfilImage,
        saldo: 0,
        email: `${username}@example.com`,
      });
  
      console.log("Usuario creado con éxito");
    } catch (error) {
      console.error(error); // Aquí se muestra el error por consola
      setErrorMessage("User aleady exist or short password");
    }
  };
  const isUsernameTaken = (username) => {

    // Verifica si el nombre de usuario ya está en uso por otra persona
    // Retorna true si el nombre de usuario está en uso, de lo contrario, false
    // Por ejemplo, podrías realizar una consulta a tu base de datos para verificar si el nombre de usuario ya existe
    // Si estás utilizando Firebase, podrías hacer algo como esto:
    // firebase.firestore().collection('users').where('username', '==', username).get().then(querySnapshot => querySnapshot.size > 0);
  };
  const handleLogin = async () => {
    try {
      // Generar un correo electrónico ficticio basado en el nombre de usuario
      const fakeEmail = `${username}@example.com`;
      await signInWithEmailAndPassword(auth, fakeEmail, password);
      console.log("Logueo exitoso");
    } catch (error) {
      setErrorMessage("Usuario o contraseña inválida");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(`Error signing out: ${error.message}`);
    }
  };

  const handleImageUpload = async (e) => {
    try {
      const selectedImage = e.target.files[0];
      if (!selectedImage) {
        console.log("Seleccione una imagen");
        return;
      }

      const storageRef = ref(storage, `profile_images/${user.uid}`);
      await uploadBytes(storageRef, selectedImage);

      const imageUrl = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: imageUrl });

      console.log(
        "Imagen de perfil actualizada exitosamente, recarga la página para ver el cambio"
      );
    } catch (error) {
      console.log(`Error al cargar la imagen: ${error.message}`);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Actualizar el nombre de usuario en la base de datos
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { username: newUsername }, { merge: true });

      // Actualizar el nombre de usuario en el perfil de Firebase Auth
      await updateProfile(user, { displayName: newUsername });

      // Salir del modo de edición y restablecer el nuevo nombre de usuario
      setEditMode(false);
      setNewUsername("");
    } catch (error) {
      console.log(`Error al guardar el perfil: ${error.message}`);
    }
  };
  const handleDeleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, "products", productId));
      // Actualizar la lista de productos después de borrar el producto
      const updatedProducts = uploadedProducts.filter(product => product.id !== productId);
      setUploadedProducts(updatedProducts);
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  };
  
  return (
    <div
      className={`bg-gradient-to-r from-[#106571] to-[#2AB7CA] flex justify-center items-center transition-all duration-1000 ${
        user ? "h-auto p-1" : "h-screen"
      }`}
    >
      {user ? (
        <>
          <div className="flex justify-between items-center w-full px-4 py-2 bg-transparent">
            <img src={logoImage} alt="BaeBids Logo" className="h-12" />
            <div className="flex-1 flex justify-center space-x-4">
              <button
                onClick={() => setShowProductModal(true)}
                className="bg-transparent text-white font-bold py-2 px-4 rounded-full focus:outline-none"
              >
                Subir producto
              </button>
              <button
              onClick={() => setShowUploadedProductsModal(true)}
              className="bg-transparent text-white font-bold py-2 px-4 rounded-full focus:outline-none"
            >
              Productos subidos
            </button>
              <button
              onClick={() => setShowOwnedProductsModal(true)}
                className="bg-transparent text-white font-bold py-2 px-4 rounded-full focus:outline-none"
              >
                Productos adquiridos
              </button>
            </div>
            <button
              onClick={() => setShowProfileModal(true)}
              className="bg-transparent text-white font-bold py-2 px-4 rounded-full focus:outline-none"
            >
              <img src={user.photoURL || perfilImage} alt="Profile" className="rounded-full w-12 h-12" />
            </button>
          </div>

          {showProfileModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-gray-200 p-8 rounded-lg shadow-lg w-11/12 md:w-1/2 overflow-y-auto max-h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Perfil de Usuario</h2>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    &times;
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-end mb-4">
                    <img src={logoSaldo} alt="Saldo" className="w-6 h-6 mr-2" />
                    <span className="font-bold">{balance} Euros</span>
                  </div>
                  <div className="flex flex-col items-center mb-8">
                    <strong className="mb-4">Bienvenido {user.displayName}</strong>
                    <div className="mb-4">
                      <img src={user.photoURL || perfilImage} alt="Profile" className="rounded-full w-24 h-24 mx-auto" />
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      {editMode ? (
                        <>
                          <label htmlFor="upload-file" className="cursor-pointer">
                            <div className="bg-blue-500 p-2 rounded-full">
                              <img src={botonFotoPerfil} alt="Seleccionar y Subir Nueva Foto" className="w-8 h-8" />
                            </div>
                            <input
                              type="file"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="upload-file"
                            />
                          </label>
                          <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="block mx-auto mb-4 p-2 w-64 rounded border border-gray-300 placeholder-gray-500 text-gray-800"
                            placeholder="Escriba otro nombre..."
                          />
                          <button
                            onClick={handleSaveProfile}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            disabled={!isValidUsername(newUsername) || isUsernameTaken(newUsername)}
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditMode(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditMode(true)}
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                          Editar Perfil
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-4 mt-8">
                    <button
                      onClick={handleSignOut}
                      className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showProductModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-gray-200 p-8 rounded-lg shadow-lg w-11/12 md:w-1/2 overflow-y-auto max-h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Subir Producto</h2>
                  <button
                    onClick={() => setShowProductModal(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    &times;
                  </button>
                </div>
                <form
                  onSubmit={handleProductSubmit}
                  className="flex flex-col space-y-4"
                >
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                    placeholder="Nombre del producto"
                    required
                  />
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                    placeholder="Descripción del producto"
                    required
                  />
                  <input
                    type="text"
                    value={minBidPrice}
                    onChange={(e) => {
                      const input = e.target.value;
                      if (/^\d*\.?\d*$/.test(input) && parseFloat(input) > 0) {
                        setMinBidPrice(parseFloat(input));
                      } else if (input === "" || input === "0") {
                        setMinBidPrice(input);
                      }
                    }}
                    className="p-2 border border-gray-300 rounded"
                    placeholder="Precio mínimo de puja"
                    required
                  />
                  <input
                    type="number"
                    value={buyNowPrice}
                    onChange={(e) => setBuyNowPrice(Number(e.target.value))}
                    className="p-2 border border-gray-300 rounded"
                    placeholder="Precio de compra inmediata"
                    required
                  />
                  {buyNowPrice <= minBidPrice && (
                    <div className="text-red-500 text-sm">
                      El precio de compra debe ser mayor
                    </div>
                  )}
                  <input
                    type="date"
                    value={endDate}
                    min={minDate.toISOString().split("T")[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                    placeholder="Fecha de finalización de la subasta"
                    required
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="Consolas">Consolas</option>
                    <option value="Ordenadores">Ordenadores</option>
                    <option value="Moviles">Móviles</option>
                    <option value="Camaras">Cámaras</option>
                    <option value="Musica">Música</option>
                    <option value="Relojes">Relojes</option>
                  </select>
                  <label
                    htmlFor="upload-file"
                    className="inline-flex items-center justify-center bg-gray-100 border border-gray-300 rounded-md p-2 cursor-pointer"
                  >
                    <img
                      src={botonCamara}
                      alt="Botón de Cámara"
                      className="w-8 h-8"
                    />
                  </label>
                  <input
                    type="file"
                    id="upload-file"
                    onChange={(e) => setProductImage(e.target.files[0])}
                    className="hidden"
                    required
                  />
                  <div className="flex justify-between items-center">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-1 rounded"
                      disabled={buyNowPrice <= minBidPrice}
                    >
                      Subir
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="bg-red-500 text-white px-4 py-1 rounded"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
       {showUploadedProductsModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-gray-200 p-8 rounded-lg shadow-lg w-11/12 md:w-1/2 overflow-y-auto max-h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Productos Subidos</h2>
        <button onClick={() => setShowUploadedProductsModal(false)} className="text-gray-600 hover:text-gray-800">
          &times;
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uploadedProducts.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow-md relative">
           <button
  onClick={() => handleDeleteProduct(product.id)}
  className="absolute top-0 right-0 m-2 p-1 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center"
>
  <img src={LogoPapelera} alt="Eliminar" className="w-4 h-4" />
</button>
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-md" />
            <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
            <p className="mt-1 text-gray-600">{product.description}</p>
            <p className="mt-1 text-gray-800 font-bold">Puja mín: {product.minBidPrice} EUR</p>
            <p className="mt-1 text-gray-800 font-bold">Puja actual: {product.actualBidPrice} EUR</p>
            <p className="mt-1 text-gray-800 font-bold">Compra ya: {product.buyNowPrice} EUR</p>
            <p className="mt-1 text-gray-800">Fecha fin.: {product.endDate}</p>
            <p className="mt-1 text-gray-800">Categoria: {product.category}</p>
            <p className="mt-1 text-gray-800 font-bold">Vendido: <span className={`text-${product.sold ? 'green' : 'red'}-500`}>{product.sold ? 'Sí' : 'No'}</span></p>
          </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {showOwnedProductsModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-gray-200 p-8 rounded-lg shadow-lg w-11/12 md:w-1/2 overflow-y-auto max-h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Productos Adquiridos</h2>
        <button onClick={() => setShowOwnedProductsModal(false)} className="text-gray-600 hover:text-gray-800">
          &times;
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ownedProducts.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow-md relative">
 
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-md" />
            <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
            <p className="mt-1 text-gray-600">{product.description}</p>
          </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
      ) : (
        <div
          className={`bg-white p-4 rounded-lg border-2 border-blue-600 transition-opacity duration-1000 ${
            opacity === 0 ? "opacity-0" : "opacity-100"
          }`}
        >
          {errorMessage && (
            <div className="bg-red-200 text-red-700 p-2 rounded mb-4">
              {errorMessage}
            </div>
          )}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <img src={logoImage} alt="BaeBids Logo" className="mr-4" />
            </div>
            <div className="flex items-center">
              {showForm ? (
                <div className="text-white transition-opacity duration-1000">
                  <strong className="mb-2">Register/Login</strong>
                  <div className="bg-gray-200 border rounded-lg p-4">
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block mx-auto mb-2 p-2 w-64 rounded border border-gray-300 placeholder-gray-500 text-gray-800"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block mx-auto mb-2 p-2 w-64 rounded border border-gray-300 placeholder-gray-500 text-gray-800"
                    />
                    <button
                      onClick={handleRegister}
                      className="bg-gradient-to-r from-[#106571] to-[#2AB7CA] text-white px-4 py-1 m-1 rounded hover:bg-blue-800"
                    >
                      Register
                    </button>
                    <button
                      onClick={handleLogin}
                      className="bg-gradient-to-r from-[#106571] to-[#2AB7CA] text-white px-4 py-1 m-1 rounded hover:bg-blue-800"
                    >
                      Login
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-[#106571] to-[#2AB7CA] text-white px-6 py-2 m-1 rounded hover:bg-blue-800 transition-opacity duration-1000"
                >
                  Register/Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Div para espacio */}
      <div className="mb-12"></div>
    </div>
  );
};

export default Header;