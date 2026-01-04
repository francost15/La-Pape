/**
 * Seeder para poblar la base de datos con datos de prueba
 * Ejecutar con: node scripts/seed.js
 * O con: npm run seed
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp, query, where, getDocs, deleteDoc, doc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_APIKEY,
  authDomain: process.env.EXPO_PUBLIC_AUTHDOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECTID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.EXPO_PUBLIC_APPID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENTID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Usuario a vincular
const USER_EMAIL = 'francost15@gmail.com';
const USER_PASSWORD = 'rojito33';
const USER_NOMBRE = 'Franco';
const USER_ROL = 'ADMIN';

// Mapeo de imágenes para productos (URLs completas de Unsplash)
const IMAGES = {
  lapiz: 'https://imgs.search.brave.com/6YuasEPFz9H47EX3BfE6fCDIThPorMw3R4QIcOc7T7U/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNDY2/NjMzNjA1L2VzL2Zv/dG8vcHJpbWVyLXBs/YW5vLWRlLWRpYnVq/by1hLWwlQzMlQTFw/aXotdmlvbGVudG8t/bCVDMyVBRG5lYS1h/bWFyaWxsYS53ZWJw/P2E9MSZiPTEmcz02/MTJ4NjEyJnc9MCZr/PTIwJmM9Q3UzMjlv/eVZvZURuYk5DUHpM/Q3dDcHd3cDlWOU5X/LWJ1MlhrQ3hpN0NC/TT0',
  boligrafo: 'https://imgs.search.brave.com/8UOlOLz6_ckp92ju-9ZsxJWSUiwhKoLZIjJjhFUDuKw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cGFwZWxhcmlhLmNs/L2Nkbi9zaG9wL2Zp/bGVzLzUwMzUzOTM0/MzE1MjVfMWVvbXI3/bWYycGtqaWg4bl8x/NjAweC5qcGc_dj0x/NzU2OTg4NjA3',
  resaltador: 'https://images.unsplash.com/photo-1616627981283-1a5a8f0b5c32',
  goma: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30',
  regla: 'https://images.unsplash.com/photo-1583484963886-cfe2bff2945f',
  cuaderno: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc',
  libreta: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d',
  grapadora: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338',
  clips: 'https://images.unsplash.com/photo-1607082349566-187342175e2f',
  carpeta: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338',
  acuarelas: 'https://images.unsplash.com/photo-1581349485608-9469926a8e5b',
  pinceles: 'https://images.unsplash.com/photo-1586864387789-628af9feed72',
  colores: 'https://images.unsplash.com/photo-1583511655936-7b3b16a3e6e7',
  mochila: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0',
  estuche: 'https://images.unsplash.com/photo-1607082349566-187342175e2f',
  usb: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04',
  mouse: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04',
};

// Datos de prueba para una papelería
const seedData = {
  negocios: [
    {
      nombre: 'Papelería La Pape',
      telefono: '555-1234',
      email: 'contacto@lapape.com',
      direccion: 'Av. Principal 123, Ciudad',
      rfc: 'PAP123456789',
      activo: true,
    },
  ],

  categorias: [
    { nombre: 'Papelería', descripcion: 'Artículos de escritura y papelería' },
    { nombre: 'Librería', descripcion: 'Libros y cuadernos' },
    { nombre: 'Oficina', descripcion: 'Artículos de oficina' },
    { nombre: 'Arte', descripcion: 'Materiales de arte y manualidades' },
    { nombre: 'Escolar', descripcion: 'Artículos escolares' },
    { nombre: 'Tecnología', descripcion: 'Accesorios tecnológicos' },
  ],

  productos: [
    // Papelería (5 productos)
    {
      nombre: 'Lápiz HB #2',
      categoriaIndex: 0,
      precio_venta: 5.50,
      precio_mayoreo: 4.50,
      costo_promedio: 2.50,
      cantidad: 500,
      marca: 'Faber-Castell',
      descripcion: 'Lápiz de grafito HB #2, caja de 12 unidades',
      stock_minimo: 50,
      imagenKey: 'lapiz',
    },
    {
      nombre: 'Bolígrafo Azul',
      categoriaIndex: 0,
      precio_venta: 8.00,
      precio_mayoreo: 6.50,
      costo_promedio: 3.00,
      cantidad: 300,
      marca: 'Bic',
      descripcion: 'Bolígrafo azul punta media',
      stock_minimo: 30,
      imagenKey: 'boligrafo',
    },
    {
      nombre: 'Resaltador Amarillo',
      categoriaIndex: 0,
      precio_venta: 12.00,
      precio_mayoreo: 10.00,
      costo_promedio: 5.00,
      cantidad: 200,
      marca: 'Stabilo',
      descripcion: 'Resaltador amarillo fluorescente',
      stock_minimo: 20,
      imagenKey: 'resaltador',
    },
    {
      nombre: 'Goma de Borrar',
      categoriaIndex: 0,
      precio_venta: 4.50,
      precio_mayoreo: 3.50,
      costo_promedio: 1.50,
      cantidad: 400,
      marca: 'Pelikan',
      descripcion: 'Goma de borrar blanca',
      stock_minimo: 40,
      imagenKey: 'goma',
    },
    {
      nombre: 'Regla de 30cm',
      categoriaIndex: 0,
      precio_venta: 15.00,
      precio_mayoreo: 12.00,
      costo_promedio: 6.00,
      cantidad: 150,
      marca: 'Maped',
      descripcion: 'Regla transparente de 30 centímetros',
      stock_minimo: 15,
      imagenKey: 'regla',
    },
    // Librería (3 productos)
    {
      nombre: 'Cuaderno Espiral Raya',
      categoriaIndex: 1,
      precio_venta: 45.00,
      precio_mayoreo: 38.00,
      costo_promedio: 20.00,
      cantidad: 100,
      marca: 'Norma',
      descripcion: 'Cuaderno espiral 100 hojas, raya',
      stock_minimo: 10,
      imagenKey: 'cuaderno',
    },
    {
      nombre: 'Cuaderno Espiral Cuadro',
      categoriaIndex: 1,
      precio_venta: 45.00,
      precio_mayoreo: 38.00,
      costo_promedio: 20.00,
      cantidad: 100,
      marca: 'Norma',
      descripcion: 'Cuaderno espiral 100 hojas, cuadro',
      stock_minimo: 10,
      imagenKey: 'cuaderno',
    },
    {
      nombre: 'Libreta de Notas',
      categoriaIndex: 1,
      precio_venta: 25.00,
      precio_mayoreo: 20.00,
      costo_promedio: 10.00,
      cantidad: 200,
      marca: 'Oxford',
      descripcion: 'Libreta de notas tamaño carta',
      stock_minimo: 20,
      imagenKey: 'libreta',
    },
    // Oficina (3 productos)
    {
      nombre: 'Grapadora',
      categoriaIndex: 2,
      precio_venta: 85.00,
      precio_mayoreo: 70.00,
      costo_promedio: 35.00,
      cantidad: 50,
      marca: 'Swingline',
      descripcion: 'Grapadora de escritorio',
      stock_minimo: 5,
      imagenKey: 'grapadora',
    },
    {
      nombre: 'Clips Metálicos',
      categoriaIndex: 2,
      precio_venta: 18.00,
      precio_mayoreo: 15.00,
      costo_promedio: 7.00,
      cantidad: 300,
      marca: 'Office Depot',
      descripcion: 'Caja de clips metálicos #1',
      stock_minimo: 30,
      imagenKey: 'clips',
    },
    {
      nombre: 'Carpeta de Archivo',
      categoriaIndex: 2,
      precio_venta: 35.00,
      precio_mayoreo: 28.00,
      costo_promedio: 14.00,
      cantidad: 80,
      marca: 'Smead',
      descripcion: 'Carpeta colgante para archivo',
      stock_minimo: 8,
      imagenKey: 'carpeta',
    },
    // Arte (3 productos)
    {
      nombre: 'Acuarelas 12 Colores',
      categoriaIndex: 3,
      precio_venta: 120.00,
      precio_mayoreo: 100.00,
      costo_promedio: 50.00,
      cantidad: 30,
      marca: 'Crayola',
      descripcion: 'Caja de acuarelas con 12 colores',
      stock_minimo: 3,
      imagenKey: 'acuarelas',
    },
    {
      nombre: 'Pinceles Set 5 Piezas',
      categoriaIndex: 3,
      precio_venta: 65.00,
      precio_mayoreo: 55.00,
      costo_promedio: 25.00,
      cantidad: 40,
      marca: 'Royal & Langnickel',
      descripcion: 'Set de 5 pinceles para acuarela',
      stock_minimo: 4,
      imagenKey: 'pinceles',
    },
    {
      nombre: 'Lápices de Colores 24',
      categoriaIndex: 3,
      precio_venta: 95.00,
      precio_mayoreo: 80.00,
      costo_promedio: 40.00,
      cantidad: 60,
      marca: 'Prismacolor',
      descripcion: 'Caja de lápices de colores 24 unidades',
      stock_minimo: 6,
      imagenKey: 'colores',
    },
    // Escolar (2 productos)
    {
      nombre: 'Mochila Escolar',
      categoriaIndex: 4,
      precio_venta: 350.00,
      precio_mayoreo: 300.00,
      costo_promedio: 150.00,
      cantidad: 25,
      marca: 'JanSport',
      descripcion: 'Mochila escolar con compartimentos',
      stock_minimo: 3,
      imagenKey: 'mochila',
    },
    {
      nombre: 'Estuche Escolar',
      categoriaIndex: 4,
      precio_venta: 75.00,
      precio_mayoreo: 65.00,
      costo_promedio: 30.00,
      cantidad: 70,
      marca: 'Adidas',
      descripcion: 'Estuche escolar con cremallera',
      stock_minimo: 7,
      imagenKey: 'estuche',
    },
    // Tecnología (2 productos)
    {
      nombre: 'USB 32GB',
      categoriaIndex: 5,
      precio_venta: 180.00,
      precio_mayoreo: 150.00,
      costo_promedio: 75.00,
      cantidad: 45,
      marca: 'SanDisk',
      descripcion: 'Memoria USB 32GB USB 3.0',
      stock_minimo: 5,
      imagenKey: 'usb',
    },
    {
      nombre: 'Mouse Inalámbrico',
      categoriaIndex: 5,
      precio_venta: 250.00,
      precio_mayoreo: 220.00,
      costo_promedio: 110.00,
      cantidad: 35,
      marca: 'Logitech',
      descripcion: 'Mouse inalámbrico óptico',
      stock_minimo: 4,
      imagenKey: 'mouse',
    },
  ],

  clientes: [
    {
      nombre: 'Juan Pérez',
      telefono: '555-1001',
      email: 'juan.perez@email.com',
      activo: true,
    },
    {
      nombre: 'María González',
      telefono: '555-1002',
      email: 'maria.gonzalez@email.com',
      activo: true,
    },
    {
      nombre: 'Carlos Rodríguez',
      telefono: '555-1003',
      activo: true,
    },
    {
      nombre: 'Ana Martínez',
      telefono: '555-1004',
      email: 'ana.martinez@email.com',
      activo: true,
    },
  ],

  sucursales: [
    {
      nombre: 'Sucursal Centro',
      direccion: 'Av. Principal 123',
      telefono: '555-2001',
      email: 'centro@lapape.com',
      activo: true,
    },
    {
      nombre: 'Sucursal Norte',
      direccion: 'Av. Norte 456',
      telefono: '555-2002',
      email: 'norte@lapape.com',
      activo: true,
    },
  ],
};

/**
 * Limpiar todas las colecciones antes de ejecutar el seeder
 */
async function cleanCollections() {
  console.log('🧹 Limpiando colecciones existentes...\n');
  
  const collections = [
    'usuarios_negocios',
    'productos',
    'categorias',
    'clientes',
    'sucursales',
    'negocios',
    // Nota: No limpiamos 'usuarios' para preservar el usuario de Auth
  ];

  for (const collectionName of collections) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const deletePromises = snapshot.docs.map((docSnapshot: any) => {
        return deleteDoc(doc(db, collectionName, docSnapshot.id));
      });
      await Promise.all(deletePromises);
      console.log(`  ✓ ${collectionName}: ${snapshot.docs.length} documentos eliminados`);
    } catch (error: any) {
      console.log(`  ⚠️  ${collectionName}: Error al limpiar - ${error?.message || error}`);
    }
  }
  console.log('');
}

async function seed() {
  try {
    console.log('🌱 Iniciando seeder...\n');

    // 0. Autenticarse primero para tener permisos de escritura
    console.log('🔐 Autenticando usuario...');
    try {
      await signInWithEmailAndPassword(auth, USER_EMAIL, USER_PASSWORD);
      console.log(`  ✓ Autenticado como: ${USER_EMAIL}\n`);
    } catch (authError: any) {
      if (authError?.code === 'auth/user-not-found') {
        console.log(`  ⚠️  Usuario no encontrado, creando...`);
        await createUserWithEmailAndPassword(auth, USER_EMAIL, USER_PASSWORD);
        console.log(`  ✓ Usuario creado y autenticado: ${USER_EMAIL}\n`);
      } else {
        console.error(`  ❌ Error de autenticación:`, authError?.message);
        console.log(`  ⚠️  Continuando sin autenticación (puede fallar por permisos)...\n`);
      }
    }

    // 1. Limpiar colecciones existentes (después de autenticarse)
    await cleanCollections();

    // 2. Crear Negocio
    console.log('📦 Creando negocio...');
    const negocioRef = await addDoc(collection(db, 'negocios'), {
      ...seedData.negocios[0],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    const negocioId = negocioRef.id;
    console.log(`✅ Negocio creado: ${negocioId}\n`);

    // 3. Crear Categorías
    console.log('📁 Creando categorías...');
    const categoriaIds = [];
    for (const categoria of seedData.categorias) {
      const categoriaRef = await addDoc(collection(db, 'categorias'), {
        negocio_id: negocioId,
        ...categoria,
        activo: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      categoriaIds.push(categoriaRef.id);
      console.log(`  ✓ ${categoria.nombre}`);
    }
    console.log(`✅ ${categoriaIds.length} categorías creadas\n`);

    // 4. Crear Productos
    console.log('🛍️  Creando productos...');
    let productosCreados = 0;
    for (const producto of seedData.productos) {
      const categoriaId = categoriaIds[producto.categoriaIndex];
      const imagenUrl = IMAGES[producto.imagenKey as keyof typeof IMAGES] || '';
      const productoData = {
        negocio_id: negocioId,
        categoria_id: categoriaId,
        nombre: producto.nombre,
        precio_venta: producto.precio_venta,
        precio_mayoreo: producto.precio_mayoreo,
        costo_promedio: producto.costo_promedio,
        cantidad: producto.cantidad,
        marca: producto.marca,
        descripcion: producto.descripcion,
        stock_minimo: producto.stock_minimo,
        imagen: imagenUrl,
        activo: true,
      };
      const productoRef = await addDoc(collection(db, 'productos'), {
        ...productoData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      const categoriaNombre = seedData.categorias[producto.categoriaIndex].nombre;
      console.log(`  ✓ ${producto.nombre} (${categoriaNombre})`);
      productosCreados++;
    }
    console.log(`✅ ${productosCreados} productos creados\n`);

    // 5. Crear Clientes
    console.log('👥 Creando clientes...');
    for (const cliente of seedData.clientes) {
      const clienteRef = await addDoc(collection(db, 'clientes'), {
        negocio_id: negocioId,
        ...cliente,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`  ✓ ${cliente.nombre}`);
    }
    console.log(`✅ ${seedData.clientes.length} clientes creados\n`);

    // 5. Crear Sucursales
    console.log('🏢 Creando sucursales...');
    const sucursalIds = [];
    for (const sucursal of seedData.sucursales) {
      const sucursalRef = await addDoc(collection(db, 'sucursales'), {
        negocio_id: negocioId,
        ...sucursal,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      sucursalIds.push(sucursalRef.id);
      console.log(`  ✓ ${sucursal.nombre}`);
    }
    console.log(`✅ ${sucursalIds.length} sucursales creadas\n`);

    // 7. Crear/Vincular Usuario
    console.log('👤 Creando/Vinculando usuario...');
    let usuarioId = null;
    let usuarioVinculado = false;
    
    try {
      // Intentar iniciar sesión con el usuario existente
      try {
        const userCredential = await signInWithEmailAndPassword(auth, USER_EMAIL, USER_PASSWORD);
        usuarioId = userCredential.user.uid;
        console.log(`  ✓ Usuario existente encontrado: ${USER_EMAIL}`);
      } catch (signInError: any) {
        // Si no existe, crearlo
        if (signInError?.code === 'auth/user-not-found') {
          console.log(`  ⚠️  Usuario no encontrado, creando nuevo usuario...`);
          const userCredential = await createUserWithEmailAndPassword(auth, USER_EMAIL, USER_PASSWORD);
          usuarioId = userCredential.user.uid;
          console.log(`  ✓ Usuario creado: ${USER_EMAIL}`);
        } else {
          throw signInError;
        }
      }

      // Verificar si el usuario ya existe en Firestore
      const usuariosQuery = query(
        collection(db, 'usuarios'),
        where('email', '==', USER_EMAIL)
      );
      const usuariosSnapshot = await getDocs(usuariosQuery);
      
      if (usuariosSnapshot.empty) {
        // Crear registro del usuario en Firestore usando el UID de Auth como ID del documento
        const { setDoc, doc: docRef } = require('firebase/firestore');
        await setDoc(docRef(db, 'usuarios', usuarioId), {
          email: USER_EMAIL,
          password: '***', // No guardamos la contraseña en texto plano
          nombre: USER_NOMBRE,
          rol: USER_ROL,
          activo: true,
          createdAt: Timestamp.now(),
        });
        console.log(`  ✓ Registro de usuario creado en Firestore con UID: ${usuarioId}`);
      } else {
        console.log(`  ✓ Usuario ya existe en Firestore`);
        // IMPORTANTE: NO cambiar usuarioId - mantener el UID de Auth
        // El usuario_id en usuarios_negocios DEBE ser el UID de Auth, no el ID del documento
      }

      // Vincular usuario al negocio usando el UID de Auth
      const usuariosNegociosQuery = query(
        collection(db, 'usuarios_negocios'),
        where('usuario_id', '==', usuarioId), // Usar el UID de Auth directamente
        where('negocio_id', '==', negocioId)
      );
      const usuariosNegociosSnapshot = await getDocs(usuariosNegociosQuery);
      
      if (usuariosNegociosSnapshot.empty) {
        await addDoc(collection(db, 'usuarios_negocios'), {
          negocio_id: negocioId,
          usuario_id: usuarioId, // Usar el UID de Auth directamente
          activo: true,
          createdAt: Timestamp.now(),
        });
        console.log(`  ✓ Usuario vinculado al negocio "Papelería La Pape" (UID: ${usuarioId})`);
        usuarioVinculado = true;
      } else {
        console.log(`  ✓ Usuario ya estaba vinculado al negocio`);
        usuarioVinculado = true;
      }
      
      console.log(`✅ Usuario procesado correctamente\n`);
    } catch (error: any) {
      console.error(`  ❌ Error al procesar usuario:`, error?.message || error);
      console.log(`  ⚠️  Continuando sin vincular usuario...\n`);
    }

    console.log('🎉 ¡Seeder completado exitosamente!');
    console.log(`\n📊 Resumen:`);
    console.log(`   - 1 Negocio`);
    console.log(`   - ${categoriaIds.length} Categorías`);
    console.log(`   - ${productosCreados} Productos`);
    console.log(`   - ${seedData.clientes.length} Clientes`);
    console.log(`   - ${sucursalIds.length} Sucursales`);
    if (usuarioVinculado && usuarioId) {
      console.log(`   - 1 Usuario vinculado (${USER_EMAIL})`);
    }
  } catch (error: any) {
    console.error('❌ Error en el seeder:', error?.message || error);
    process.exit(1);
  }
}

// Ejecutar seeder
seed()
  .then(() => {
    console.log('\n✅ Proceso finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });