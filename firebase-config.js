/* =========================================================
   CONFIGURACIÓN — Panel de la Ferretería
   Mientras apiKey diga "PEGA_AQUI", el panel funciona en MODO DEMO.
   ========================================================= */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCBmYnvbhX0Lk6zgf78XtG7VbP3hJYR3ts",
  authDomain: "ferreteria-48442.firebaseapp.com",
  projectId: "ferreteria-48442",
  storageBucket: "ferreteria-48442.firebasestorage.app",
  messagingSenderId: "414698417169",
  appId: "1:414698417169:web:b1ffc2f3abbf44983195b0"
};

window.APP = {
  web: "https://zikopro820.github.io/ferreteria-",   // dirección de la web pública (para enlaces de seguimiento)

  /* EQUIPO Y PERMISOS — cada persona entra con su correo.
     "Administración" → todo · "Ventas" → pedidos, venta en tienda, productos, caja, clientes y mensajes.
     Usa los MISMOS correos en firestore.rules. */
  equipo: [
    { email: "admin@ferreteriaronald.pe", nombre: "Administración", rol: "Administración" },
    { email: "ventas@ferreteriaronald.pe", nombre: "Ventas", rol: "Ventas" }
  ]
};
