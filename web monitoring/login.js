// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Mendapatkan elemen-elemen DOM
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const loginButton = document.getElementById('login-button');

// Fungsi untuk menampilkan pesan error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Fungsi untuk menyembunyikan pesan error
function hideError() {
    errorMessage.style.display = 'none';
}

// Fungsi untuk login dengan Firebase Auth
async function signIn(email, password) {
    loginButton.disabled = true;
    loginButton.textContent = 'Loading...';
    hideError();
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check if email is verified
        if (!user.emailVerified) {
            showError('Email belum diverifikasi. Silakan cek email Anda.');
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
            return;
        }
        
        // Login berhasil, redirect ke halaman monitoring
        window.location.href = 'index.html';
        
    } catch (error) {
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
        
        switch(error.code) {
            case 'auth/invalid-email':
                showError('Format email tidak valid');
                break;
            case 'auth/user-not-found':
                showError('Akun tidak ditemukan. Silakan daftar terlebih dahulu.');
                break;
            case 'auth/wrong-password':
                showError('Password salah');
                break;
            case 'auth/too-many-requests':
                showError('Terlalu banyak percobaan login. Coba lagi nanti');
                break;
            case 'auth/user-disabled':
                showError('Akun telah dinonaktifkan');
                break;
            case 'auth/invalid-credential':
                showError('Username atau password salah');
                break;
            default:
                showError('Gagal login: ' + error.message);
        }
    }
}

// Event listener untuk form login
loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Validasi input
    if (!username) {
        showError('Username/Email tidak boleh kosong');
        return;
    }
    
    if (!password) {
        showError('Password tidak boleh kosong');
        return;
    }
    
    // Menambahkan domain jika user hanya memasukkan username
    const email = username.includes('@') ? username : `${username}@company.com`;
    
    // Melakukan login
    signIn(email, password);
});

// Memastikan pengguna sudah logout saat halaman login dimuat
signOut(auth).catch(error => console.error('Error saat logout:', error));

// Jika user sudah login dan email terverifikasi, redirect langsung ke halaman monitoring
onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
        window.location.href = 'firebase Monitoring.html';
    }
});
