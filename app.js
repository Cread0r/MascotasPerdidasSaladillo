// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDS6dhch1lCwe9MBEzZv85_F09LX25H_-s",
  authDomain: "mascotas-perdidas-saladillo.firebaseapp.com",
  projectId: "mascotas-perdidas-saladillo",
  storageBucket: "mascotas-perdidas-saladillo.appspot.com",
  messagingSenderId: "35226516022",
  appId: "1:35226516022:web:6125674af0597709b1f697",
  measurementId: "G-NK8PJ1WE2E"
};
const app = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const firestore = firebase.firestore();

document.getElementById('upload-btn').addEventListener('click', () => {
    document.getElementById('upload-section').style.display = 'block';
    document.getElementById('gallery-section').style.display = 'none';
});

document.getElementById('gallery-btn').addEventListener('click', () => {
    document.getElementById('upload-section').style.display = 'none';
    document.getElementById('gallery-section').style.display = 'block';
    loadGallery();
});

document.getElementById('submit-btn').addEventListener('click', checkImage);

function checkImage() {
    const imageInput = document.getElementById('image-input');
    const file = imageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const imageBase64 = event.target.result.split(',')[1];
        analyzeImage(imageBase64, file);
    };
    reader.readAsDataURL(file);
}

async function analyzeImage(base64, file) {
    const apiKey = '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';
    const url = 'https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32';

    const request = {
        inputs: {
            image: base64
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });

    const result = await response.json();
    if (isImageSafe(result)) {
        uploadImage(file);
    } else {
        document.getElementById('upload-status').innerText = 'Imagen inapropiada detectada y eliminada.';
    }
}

function isImageSafe(detections) {
    const unsafeCategories = ['NSFW', 'violence', 'gore'];
    return !detections.some(detection => unsafeCategories.includes(detection.label));
}

function uploadImage(file) {
    const storageRef = storage.ref('animals/' + file.name);
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed', 
        function(snapshot) {
            // Observe state change events such as progress, pause, and resume
        }, 
        function(error) {
            // Handle unsuccessful uploads
            console.error("Upload failed:", error);
        }, 
        function() {
            // Handle successful uploads
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                saveImageURL(downloadURL);
            });
        }
    );
}

function saveImageURL(url) {
    firestore.collection('animals').add({
        url: url
    }).then(() => {
        document.getElementById('upload-status').innerText = 'Imagen subida exitosamente.';
    }).catch((error) => {
        console.error("Error al guardar la URL:", error);
    });
}

function loadGallery() {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    firestore.collection('animals').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('img-container');
            
            const img = document.createElement('img');
            img.src = doc.data().url;
            img.classList.add('gallery-img');
            imgContainer.appendChild(img);
            
            gallery.appendChild(imgContainer);
        });
    });
}
