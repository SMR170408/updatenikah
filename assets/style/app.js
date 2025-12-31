document.addEventListener("DOMContentLoaded", function () {
    
    // 1. Ambil query string dari URL
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const namaTamu = urlParams.get('to');
    
    // 2. Target elemen
    const guestDisplay = document.getElementById('guestName');
    const openBtn = document.getElementById('openInvitation');

    // 3. Handle Nama Tamu
    if (namaTamu) {
        guestDisplay.innerText = decodeURIComponent(namaTamu.replace(/\+/g, ' '));
    } else {
        guestDisplay.innerText = "Tamu Undangan";
    }

    // 4. Aksi Tombol Open Invitation
    openBtn.addEventListener('click', function() {
        const cover = document.getElementById('cover');
        const mainContent = document.getElementById('mainContent');
        const musicController = document.querySelector('.music-controller');
        
        if (musicController) musicController.classList.add('show');
        
        // Efek fade-out
        cover.style.transition = "opacity 0.8s ease";
        cover.style.opacity = "0";
        
        setTimeout(() => {
            cover.style.display = "none";
            mainContent.classList.remove("hidden");
            document.body.classList.remove("lock-scroll");
            window.scrollTo(0, 0);
            
            playMusic();
            startCountdown();
            WeddingSlider.init();
            setTimeout(() => WeddingSlider.start(), 500);
        }, 800);
    });

    // ================= COUNTDOWN =================
    function startCountdown() {
        const targetDate = new Date("2026-01-18T08:00:00").getTime();
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;
            if (distance < 0) {
                clearInterval(interval);
                return;
            }
            document.getElementById("days").innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
            document.getElementById("hours").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            document.getElementById("minutes").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById("seconds").innerText = Math.floor((distance % (1000 * 60)) / 1000);
        }, 1000);
    }

    // ================= HERO SLIDER =================
    const WeddingSlider = {
        slides: [],
        currentIndex: 0,
        timer: null,
        duration: 5000,

        init() {
            this.slides = document.querySelectorAll(".hero-slide");
            if (this.slides.length === 0) return;
            this.slides.forEach(slide => slide.classList.remove("active"));
            this.slides[0].classList.add("active");
            this.currentIndex = 0;
        },

        start() {
            if (this.timer || this.slides.length < 2) return;
            this.timer = setInterval(() => this.next(), this.duration);
        },

        next() {
            this.slides[this.currentIndex].classList.remove("active");
            this.currentIndex = (this.currentIndex + 1) % this.slides.length;
            this.slides[this.currentIndex].classList.add("active");
        },

        stop() {
            clearInterval(this.timer);
            this.timer = null;
        }
    };

    // ================= REKENING (COPY) =================
    if (!document.getElementById('copyModal')) {
        const modal = document.createElement('div');
        modal.id = 'copyModal';
        modal.innerHTML = `<div class="modal-content"><span class="close" onclick="closeModal()">&times;</span><p>Nomor rekening berhasil disalin!</p></div>`;
        document.body.appendChild(modal);
    }

    window.copyText = function () {
        const norekElement = document.getElementById("norek-mandiri");
        if (!norekElement) return;
        const textToCopy = norekElement.innerText;
        navigator.clipboard.writeText(textToCopy).then(showCopyModal).catch(err => {
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy; document.body.appendChild(textArea);
            textArea.select();
            try { document.execCommand('copy'); showCopyModal(); } catch (e) { console.error(e); }
            document.body.removeChild(textArea);
        });
    }

    function showCopyModal() {
        const modal = document.getElementById("copyModal");
        if (modal) modal.style.display = "flex";
    }
    window.closeModal = function () {
        const modal = document.getElementById("copyModal");
        if (modal) modal.style.display = "none";
    }
    window.addEventListener('click', (e) => {
        const modal = document.getElementById("copyModal");
        if (e.target === modal) closeModal();
    });

    // ================= MUSIK (FIX ROTATION PAUSE/PLAY) =================
    const audio = document.getElementById("weddingAudio");
    const btn = document.getElementById("musicBtn");
    const icon = document.getElementById("musicIcon");
    let isPlaying = false;

    function playMusic() {
        audio.play().then(() => {
            // Pastikan class animasi ada (untuk putaran pertama kali)
            if (!icon.classList.contains("rotate")) {
                icon.classList.add("rotate");
            }
            // ⬅️ KUNCI: Paksa animasi jalan
            icon.style.animationPlayState = "running";
            isPlaying = true;
        }).catch(() => {});
    }

    function pauseMusic() {
        audio.pause();
        // ⬅️ KUNCI: Jangan hapus class "rotate", hanya pause animasinya
        icon.style.animationPlayState = "paused";
        isPlaying = false;
    }

    btn.addEventListener("click", () => isPlaying ? pauseMusic() : playMusic());
    document.addEventListener("click", function firstClick() {
        playMusic();
        document.removeEventListener("click", firstClick);
    });

    // ================= LOGIKA UCAPAN (INSTAN & OPTIMIZED) =================
    const API_URL = "https://script.google.com/macros/s/AKfycbyHqm2TnL7lyux44hEmej9_2JN_9ysdRFUpgqrnQECSKnvCj_czjnCyynhzo55CGyAD/exec";
    const ucapanForm = document.getElementById("ucapanForm");
    const displayUcapan = document.getElementById("displayUcapan");
    
    // Variabel untuk melacak pesan yang sudah ada di layar (Pencegah Duplikat)
    const knownMessages = new Set(); 
    let lastTimestamp = 0;
    const MAX_UCAPAN = 10;

    function formatTanggal(waktu) {
        return new Date(waktu).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric"
        });
    }

    // Fungsi Helper: Membuat "Kunci Unik" berdasarkan Nama + Pesan
    function getMessageKey(nama, pesan) {
        return (nama + "|||" + pesan).trim().replace(/\s+/g, ' ');
    }

    function createUcapanHtml(nama, pesan, waktu, isAnimate = false) {
        const animateClass = isAnimate ? ' animate' : '';
        return `
            <div class="ucapan-item${animateClass}">
                <div class="ucapan-header">
                    <p class="user-name">${nama}</p>
                    <small class="ucapan-date">${formatTanggal(waktu)}</small>
                </div>
                <p class="user-msg">${pesan}</p>
            </div>
        `;
    }

     // ================= KIRIM UCAPAN (NOTIF DULU, BARU TAMPIL) =================
    if (ucapanForm) {
        ucapanForm.addEventListener("submit", async e => {
            e.preventDefault();

            const nama = ucapanForm.querySelector('[name="Nama"]').value;
            const pesan = ucapanForm.querySelector('[name="Ucapan"]').value;
            const waktuSekarang = new Date().toISOString();
            const messageKey = getMessageKey(nama, pesan);

            // 1. Kirim ke Database DULU (Menunggu response server selesai)
            await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({ type: "ucapan", nama, pesan })
            });

            // 2. Tampilkan Notifikasi Sukses
            showToast("Pesan berhasil dikirim 🤍");
            
            // 3. Reset Form
            ucapanForm.reset();

            // 4. Tampilkan Pesan di Kolom (Setelah Notif Muncul)
            // Cek dulu apakah Realtime sudah memasukkannya?
            if (!knownMessages.has(messageKey)) {
                knownMessages.add(messageKey);
                displayUcapan.insertAdjacentHTML("afterbegin", createUcapanHtml(nama, pesan, waktuSekarang, true));
                displayUcapan.scrollTop = 0;
            }
        });
    }

    // ================= REALTIME (ANTI DUPLIKAT) =================
    async function loadUcapanRealtime() {
        if (!displayUcapan) return;

        try {
            const res = await fetch(API_URL + "?type=ucapan");
            const data = await res.json();

            // Reverse data agar yang terbaru dicek duluan
            data.reverse().forEach(d => {
                const waktu = new Date(d[0]).getTime();
                const nama = d[1];
                const pesan = d[2];
                const messageKey = getMessageKey(nama, pesan);

                // Cek Jangka Waktu
                if (waktu <= lastTimestamp) return;

                // ⭐ CEK DUPLIKAT KONTEN ⭐
                // Jika pesan ini SUDAH ADA di daftar knownMessages, SKIP!
                if (knownMessages.has(messageKey)) {
                    // Update timestamp saja agar loop berikutnya jalan
                    lastTimestamp = waktu;
                    return;
                }

                // Jika baru, masukkan ke daftar dan tampilkan
                knownMessages.add(messageKey);
                lastTimestamp = waktu;
                
                displayUcapan.insertAdjacentHTML("afterbegin", createUcapanHtml(nama, pesan, d[0], true));
                displayUcapan.scrollTop = 0; // Scroll ke atas jika ada pesan baru dari orang lain
            });

            // Hapus elemen lama agar DOM tidak berat
            const items = displayUcapan.querySelectorAll(".ucapan-item");
            if (items.length > MAX_UCAPAN) {
                items.forEach((el, i) => i >= MAX_UCAPAN && el.remove());
            }

        } catch (e) {
            console.error("Realtime error:", e);
        }
    }

    // ================= INIT PERTAMA KALI =================
    async function initUcapan() {
        if (!displayUcapan) return;

        try {
            const res = await fetch(API_URL + "?type=ucapan");
            const data = await res.json();

            // Ambil data terakhir
            const lastData = data.slice(-MAX_UCAPAN);
            
            lastData.forEach(d => {
                const waktu = new Date(d[0]).getTime();
                lastTimestamp = Math.max(lastTimestamp, waktu);
                
                // Masukkan ke knownMessages agar tidak diduplikasi saat realtime nanti
                const messageKey = getMessageKey(d[1], d[2]);
                knownMessages.add(messageKey);

                displayUcapan.insertAdjacentHTML("beforeend", createUcapanHtml(d[1], d[2], d[0], false));
            });

        } catch (e) {
            console.error("Init error:", e);
        }
    }

    // ================= RSVP =================
    const rsvpForm = document.getElementById("rsvpForm");
    if (rsvpForm) {
        rsvpForm.addEventListener("submit", async e => {
            e.preventDefault();
            await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({
                    type: "rsvp",
                    nama: e.target.nama.value,
                    kehadiran: e.target.kehadiran.value
                })
            });
            showToast("RSVP berhasil dikirim 🤍");
            rsvpForm.reset();
        });
    }

    // ================= GALLERY ORIENTATION =================
    document.querySelectorAll("#sliderWrapper img").forEach(img => {
        img.addEventListener("load", () => {
            const isPortrait = img.naturalHeight > img.naturalWidth;
            if (isPortrait) img.classList.add("portrait");
            else img.classList.add("landscape");
        });
    });

    // ================= TOAST & RUN =================
    function showToast(text) {
        const toast = document.getElementById("toastNotif");
        if (toast) {
            toast.innerText = text;
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 2500);
        }
    }

    // Jalankan
    initUcapan();
    setInterval(loadUcapanRealtime, 1500);
});