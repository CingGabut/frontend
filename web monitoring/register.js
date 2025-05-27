// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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
const db = getFirestore(app);

// Mendapatkan elemen-elemen DOM
const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const registerButton = document.getElementById('register-button');

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

// Fungsi untuk validasi form
function validateForm(email, password, confirmPassword, fullname, department) {
    hideMessages();
    
    // Validasi nama lengkap
    if (fullname.length < 2) {
        showError('Nama lengkap minimal 2 karakter');
        return false;
    }
    
    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Format email tidak valid');
        return false;
    }
    
    // Validasi password
    if (password.length < 6) {
        showError('Password minimal 6 karakter');
        return false;
    }
    
    // Validasi password strength
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
        showError('Password harus mengandung minimal 1 huruf dan 1 angka');
        return false;
    }
    
    // Validasi konfirmasi password
    if (password !== confirmPassword) {
        showError('Password dan konfirmasi password tidak cocok');
        return false;
    }
    
    // Validasi departemen
    if (!department) {
        showError('Pilih departemen');
        return false;
    }
    
    return true;
}

// Fungsi untuk menyimpan data pengguna ke Firestore
async function saveUserData(user, fullname, department) {
    try {
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            fullname: fullname,
            department: department,
            createdAt: serverTimestamp(),
            isActive: true,
            role: 'user',
            emailVerified: false
        });
        
        console.log('Data pengguna berhasil disimpan');
    } catch (error) {
        console.error('Error menyimpan data pengguna:', error);
        throw error;
    }
}

// Fungsi untuk registrasi pengguna
async function registerUser(email, password, fullname, department) {
    registerButton.disabled = true;
    registerButton.textContent = 'Mendaftar...';
    hideMessages();
    
    try {
        // Membuat akun pengguna baru
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profil pengguna
        await updateProfile(user, {
            displayName: fullname
        });
        
        // Simpan data tambahan ke Firestore
        await saveUserData(user, fullname, department);
        
        // Kirim email verifikasi
        await sendEmailVerification(user);
        
        showSuccess('Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi sebelum login.');
        
        // Reset form
        registerForm.reset();
        
        // Redirect ke halaman login setelah 5 detik
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 5000);
        
    } catch (error) {
        registerButton.disabled = false;
        registerButton.textContent = 'Daftar';
        
        // Menangani berbagai jenis error
        switch(error.code) {
            case 'auth/email-already-in-use':
                showError('Email sudah terdaftar. Gunakan email lain atau login');
                break;
            case 'auth/invalid-email':
                showError('Format email tidak valid');
                break;
            case 'auth/operation-not-allowed':
                showError('Registrasi email/password tidak diizinkan');
                break;
            case 'auth/weak-password':
                showError('Password terlalu lemah. Gunakan minimal 6 karakter');
                break;
            case 'auth/network-request-failed':
                showError('Koneksi internet bermasalah. Coba lagi.');
                break;
            default:
                showError('Gagal membuat akun: ' + error.message);
        }
    }
}

// Event listener untuk form registrasi
registerForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const fullname = document.getElementById('fullname').value.trim();
    const department = document.getElementById('department').value;
    
    // Validasi form
    if (validateForm(email, password, confirmPassword, fullname, department)) {
        registerUser(email, password, fullname, department);
    }
});

// Real-time validation
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const small = this.nextElementSibling;
    
    if (password.length >= 6) {
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        
        if (hasLetter && hasNumber) {
            small.textContent = 'Password kuat ✓';
            small.style.color = 'green';
        } else {
            small.textContent = 'Password harus mengandung huruf dan angka';
            small.style.color = 'orange';
        }
    } else {
        small.textContent = 'Minimal 6 karakter';
        small.style.color = 'red';
    }
});

document.getElementById('confirm-password').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    
    if (confirmPassword.length > 0) {
        if (password === confirmPassword) {
            this.style.borderColor = 'green';
        } else {
            this.style.borderColor = 'red';
        }
    }
});

// Jika user sudah login dan email terverifikasi, redirect ke halaman monitoring
onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
        window.location.href = 'index.html';
    }
});