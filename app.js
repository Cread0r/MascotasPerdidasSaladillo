// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDS6dhch1lCwe9MBEzZv85_F09LX25H_-s",
  authDomain: "mascotas-perdidas-saladillo.firebaseapp.com",
  projectId: "mascotas-perdidas-saladillo",
  storageBucket: "mascotas-perdidas-saladillo.appspot.com",
  messagingSenderId: "35226516022",
  appId: "1:35226516022:web:6125674af0597709b1f697",
  measurementId: "G-NK8PJ1WE2E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Referencia al servicio de almacenamiento
var storage = firebase.storage();

// Escuchar el evento 'submit' del formulario
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Obtener el archivo
    var file = document.querySelector('input[type=file]').files[0];

    // Crear una referencia al archivo en Firebase
    var storageRef = storage.ref('imagenes/' + file.name);

    // Subir el archivo
    var task = storageRef.put(file);

    task.on('state_changed',
        function progress(snapshot) {
            console.log('Subida en progreso...');
        },
        function error(err) {
            console.log('Ha ocurrido un error: ', err);
        },
        function complete() {
            console.log('Subida completada');
        }
    );
});
