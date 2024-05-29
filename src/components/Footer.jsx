import React from 'react';

import LogoFacebook from '../img/LogoFacebook.png';
import LogoTwitter from '../img/LogoTwitter.png';
import LogoInstagram from '../img/LogoInstagram.png';
import LogoGithub from '../img/LogoGithub.png';
const Footer = () => {
    return (
      <footer className="bg-gray-100 py-10 text-center md:text-left">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-around">
          <div className="mb-8 md:mb-0">
            <h2 className="text-2xl font-bold text-teal-500 bg-[#F0F0F0] p-2 inline-block">BaeBids</h2>
            <p className="text-teal-300 mt-2">Únete para encontrar los mejores productos a los mejores precios</p>
            <div className="flex justify-center md:justify-start mt-4 space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <img src={LogoTwitter} alt="Twitter" className="h-6 w-6" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <img src={LogoFacebook} alt="Facebook" className="h-6 w-6" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <img src={LogoInstagram} alt="Instagram" className="h-6 w-6" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <img src={LogoGithub} alt="Github" className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mb-8 md:mb-0">
            <h3 className="text-lg font-semibold text-teal-500">COMPAÑÍA</h3>
            <ul className="mt-4 space-y-2 text-teal-300">
              <li><a href="/sobre-nosotros">Sobre Nosotros</a></li>
              <li><a href="/carrera">Carrera</a></li>
              <li><a href="/funciones">Funciones</a></li>
            </ul>
          </div>
          <div className="mb-8 md:mb-0">
            <h3 className="text-lg font-semibold text-teal-500">AYUDA</h3>
            <ul className="mt-4 space-y-2 text-teal-300">
              <li><a href="/servicio-tecnico">Servicio Técnico</a></li>
              <li><a href="/puntos-de-entregas">Puntos de Entregas</a></li>
              <li><a href="/terminos-y-condiciones">Términos y Condiciones</a></li>
              <li><a href="/politicas-de-privacidad">Políticas de Privacidad</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-teal-500">FAQ</h3>
            <ul className="mt-4 space-y-2 text-teal-300">
              <li><a href="/account">Account</a></li>
              <li><a href="/gestion-de-entregas">Gestión de Entregas</a></li>
              <li><a href="/pedidos">Pedidos</a></li>
              <li><a href="/pagos">Pagos</a></li>
            </ul>
          </div>
        </div>
      </footer>
    );
  }
  
  export default Footer;