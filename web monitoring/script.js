// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Inisialisasi Firebase (jika belum diinisialisasi)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

// Cek status otentikasi pengguna
auth.onAuthStateChanged((user) => {
    if (user) {
        // Pengguna login, lanjutkan dengan memuat data monitoring
        loadMonitoringData();
        
        // Tambahkan elemen logout di header
        addLogoutButton();
    } else {
        // Jika tidak ada pengguna yang login, redirect ke halaman login
        window.location.href = 'login.html';
    }
});

// Fungsi untuk menambahkan tombol logout
function addLogoutButton() {
    const header = document.querySelector('h1');
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logout-btn';
    logoutBtn.innerText = 'Logout';
    logoutBtn.onclick = () => {
        auth.signOut()
            .then(() => {
                window.location.href = 'login.html';
            })
            .catch((error) => {
                console.error('Error saat logout:', error);
            });
    };
    
    header.insertAdjacentElement('afterend', logoutBtn);
}

// Fungsi untuk memuat data monitoring
function loadMonitoringData() {
    // Mendapatkan data status dan kunci
    db.collection("monitoring").doc("status").onSnapshot((doc) => {
        const statusEl = document.getElementById("status");
        const kunciEl = document.getElementById("kunci");
        
        statusEl.innerText = doc.data().status;
        statusEl.style.backgroundColor = doc.data().status === "Gangguan" ? "red" : "green";
        
        kunciEl.innerText = doc.data().kunci;
        kunciEl.style.backgroundColor = doc.data().kunci === "Terkunci" ? "green" : "red";
    });

    // Mendapatkan data voltase
    db.collection("monitoring").doc("voltase").onSnapshot((doc) => {
        document.getElementById("ac-volt").innerText = doc.data().ac;
        document.getElementById("dc-volt").innerText = doc.data().dc1;
        document.getElementById("dc-volt2").innerText = doc.data().dc2;
    });

    // Mendapatkan data tabel
    const tableBody = document.getElementById("data-table");
    db.collection("monitoring").doc("history").collection("logs").orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
            tableBody.innerHTML = "";
            snapshot.forEach((doc) => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${doc.data().timestamp}</td>
                    <td>${doc.data().keterangan}</td>
                `;
                if (doc.data().keterangan === "Belok" || doc.data().keterangan.includes("Gangguan")) {
                    row.style.backgroundColor = "red";
                    row.style.color = "white";
                }
                tableBody.appendChild(row);
            });
        });
}