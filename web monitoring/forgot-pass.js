// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, sendPasswordResetEmail, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

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
const forgotPasswordForm = document.getElementById('forgot-password-form');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const resetButton = document.getElementById('reset-button');

// Fungsi untuk menampilkan pesan error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
}

// Fungsi untuk menampilkan pesan sukses
function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}

// Fungsi untuk menyembunyikan pesan
function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

// Fungsi untuk mengirim email reset password
async function sendPasswordReset(email) {
    resetButton.disabled = true;
    resetButton.textContent = 'Mengirim...';
    hideMessages();
    
    try {
        await sendPasswordResetEmail(auth, email);
        
        showSuccess('Link reset password telah dikirim ke email Anda. Silakan cek inbox dan folder spam.');
        
        // Reset form
        forgotPasswordForm.reset();
        
        // Redirect ke halaman login setelah 5 detik
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 5000);
        
    } catch (error) {
        resetButton.disabled = false;
        resetButton.textContent = 'Kirim Link Reset';
        
        // Menangani berbagai jenis error
        switch(error.code) {
            case 'auth/user-not-found':
                showError('Email tidak terdaftar dalam sistem');
                break;
            case 'auth/invalid-email':
                showError('Format email tidak valid');
                break;
            case 'auth/too-many-requests':
                showError('Terlalu banyak permintaan. Coba lagi dalam beberapa menit');
                break;
            case 'auth/network-request-failed':
                showError('Koneksi internet bermasalah. Coba lagi.');
                break;
            case 'auth/user-disabled':
                showError('Akun telah dinonaktifkan. Hubungi administrator.');
                break;
            default:
                showError('Gagal mengirim email reset: ' + error.message);
        }
    }
}

// Fungsi validasi email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Event listener untuk form forgot password
forgotPasswordForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    
    // Validasi email
    if (!email) {
        showError('Email tidak boleh kosong');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Format email tidak valid');
        return;
    }
    
    // Kirim email reset password
    sendPasswordReset(email);
});

// Real-time email validation
document.getElementById('email').addEventListener('input', function() {
    hideMessages();
    const email = this.value.trim();
    
    if (email && !isValidEmail(email)) {
        this.style.borderColor = 'red';
    } else if (email) {
        this.style.borderColor = 'green';
    } else {
        this.style.borderColor = '';
    }
});

// Jika user sudah login dan email terverifikasi, redirect ke halaman monitoring
onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
        window.location.href = 'index.html';
    }
});