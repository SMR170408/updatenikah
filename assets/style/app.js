document.addEventListener("DOMContentLoaded", function () {
    // 1. Ambil query string dari URL (contoh: ?to=Budi+Santoso)
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    // 2. Ambil nilai dari parameter 'to'
    const namaTamu = urlParams.get('to');
    
    // 3. Targetkan elemen h2 dengan ID guestName
    const guestDisplay = document.getElementById('guestName');
    const openBtn = document.getElementById('openInvitation');

    // 4. Kondisi jika ada nama di URL
    if (namaTamu) {
        // Ganti tanda "+" atau "%20" menjadi spasi agar rapi
        // decodeURIComponent memastikan karakter khusus terbaca normal
        guestDisplay.innerText = decodeURIComponent(namaTamu.replace(/\+/g, ' '));
    } else {
        // Jika tidak ada nama di URL, biarkan teks default atau ganti jadi ini
        guestDisplay.innerText = "Tamu Undangan";
    }

    // 5. Aksi Tombol Open Invitation
    openBtn.addEventListener('click', function() {
        // Contoh aksi: Scroll ke konten utama atau hilangkan cover
        const cover = document.getElementById('cover');
        cover.style.transition = "opacity 0.8s ease";
        cover.style.opacity = "0";
        
        setTimeout(() => {
            cover.style.display = "none";
        }, 800);
    });
});

// LOCK 
const openBtn = document.getElementById("openInvitation");
const cover = document.getElementById("cover");
const mainContent = document.getElementById("mainContent");
const body = document.body;

openBtn.addEventListener("click", () => {
  cover.style.opacity = "0";
  cover.style.transition = "opacity 0.8s ease";

  setTimeout(() => {
    cover.style.display = "none";
    mainContent.classList.remove("hidden");
    body.classList.remove("lock-scroll");
    window.scrollTo(0, 0);
  }, 800);

  /* COUNTDOWN */
const targetDate = new Date("Januari 20, 2026 08:00:00").getTime();

setInterval(() => {
  const now = new Date().getTime();
  const distance = targetDate - now;

  if (distance < 0) return;

  document.getElementById("days").innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
  document.getElementById("hours").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  document.getElementById("minutes").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  document.getElementById("seconds").innerText = Math.floor((distance % (1000 * 60)) / 1000);
}, 1000);

/* HERO SLIDER (AFTER LOCK) */
const WeddingSlider = {
    slides: [],
    currentIndex: 0,
    timer: null,
    duration: 6000, // Jeda antar gambar (6 detik)

    // Inisialisasi elemen
    init() {
        this.slides = document.querySelectorAll('.hero-slide');
        if (this.slides.length === 0) return;
        
        // Pastikan slide pertama siap tapi belum jalan animasinya
        this.slides[0].style.opacity = "0"; 
    },

    // Fungsi untuk memulai slider
    start() {
        if (this.timer) return; // Cegah duplikasi interval

        // Jalankan slide pertama segera
        this.showSlide(0);

        // Set interval untuk slide berikutnya
        this.timer = setInterval(() => {
            this.next();
        }, this.duration);
    },

    showSlide(index) {
        // Hapus semua class active
        this.slides.forEach(slide => {
            slide.classList.remove('active');
            // Reset scale untuk slide yang tidak aktif agar animasi Ken Burns mulai dari awal lagi nanti
            if(!slide.classList.contains('active')) {
                slide.style.transition = 'none';
                slide.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    slide.style.transition = 'opacity 2000ms ease-in-out, transform 8000ms linear';
                }, 50);
            }
        });

        // Aktifkan slide target
        this.slides[index].classList.add('active');
    },

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.showSlide(this.currentIndex);
    },

    stop() {
        clearInterval(this.timer);
        this.timer = null;
    }
};

// --- LOGIKA PEMICU (TRIGGER) ---
document.getElementById('openInvitation').addEventListener('click', function() {
    // 1. Munculkan konten utama
    document.getElementById('mainContent').classList.remove('hidden');
    
    // 2. Inisialisasi dan Jalankan Slider
    WeddingSlider.init();
    
    // Beri jeda sedikit agar transisi halaman selesai baru slider jalan
    setTimeout(() => {
        WeddingSlider.start();
    }, 500);
});

// HALAMAN GALERY

const container = document.getElementById('sliderContainer');
const dots = document.querySelectorAll('.dot');

container.addEventListener('scroll', () => {
    // Menghitung index slide berdasarkan posisi scroll
    const scrollLeft = container.scrollLeft;
    const slideWidth = container.querySelector('.slide').clientWidth + 10;
    const index = Math.round(scrollLeft / slideWidth);

    // Update class active pada dots
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
});

// Notif RSVP

document.getElementById('rsvpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Mengambil data
    const nama = document.getElementById('nama').value;
    const kehadiran = document.getElementById('kehadiran').value;
    
    // Logika sederhana (bisa diganti untuk kirim ke WhatsApp atau Database)
    alert(`Terima kasih ${nama}, konfirmasi "${kehadiran}" Anda telah kami terima.`);
    
    // Reset form setelah submit
    this.reset();
});

// url rsvp
const scriptURL = 'https://script.google.com/macros/s/AKfycbwD2ebFUsl7u3EcUqmBDvT79JD7Q3Rn3W0Dyn4bdUllPIhLWbrrqlhzoqXze_Yro8xG/exec';

// --- HANDLER FORM RSVP ---
const formRSVP = document.getElementById('rsvpForm');
if (formRSVP) {
    formRSVP.addEventListener('submit', e => {
        e.preventDefault();
        const btn = formRSVP.querySelector('button');
        btn.disabled = true;
        btn.innerText = "Mengirim...";

        let formData = new FormData(formRSVP);
        formData.append('type', 'SMR1'); // Identifikasi untuk sheet RSVP

        fetch(scriptURL, { method: 'POST', body: formData })
            .then(response => {
                alert('Konfirmasi RSVP terkirim!');
                formRSVP.reset();
                btn.disabled = false;
                btn.innerText = "KONFIRMASI";
            })
            .catch(error => {
                console.error('Error!', error.message);
                btn.disabled = false;
                btn.innerText = "KONFIRMASI";
            });
    });
}

// --- HANDLER FORM UCAPAN ---
const formUcapan = document.getElementById('ucapanForm');
if (formUcapan) {
    formUcapan.addEventListener('submit', e => {
        e.preventDefault();
        const btn = document.getElementById('btnUcapan');
        btn.disabled = true;
        btn.innerText = "Mengirim...";

        let formData = new FormData(formUcapan);
        formData.append('type', 'Ucapan'); // Identifikasi untuk sheet Ucapan

        fetch(scriptURL, { method: 'POST', body: formData })
            .then(response => {
                alert('Ucapan terkirim!');
                formUcapan.reset();
                btn.disabled = false;
                btn.innerText = "Kirim";
            })
            .catch(error => {
                console.error('Error!', error.message);
                btn.disabled = false;
                btn.innerText = "Kirim";
            });
    });
}

// rekening
/**
 * Fungsi untuk menyalin teks ke papan klip (clipboard)
 * dan menampilkan modal pop-up kustom.
 */
function copyText() {
    // 1. Ambil teks dari elemen dengan ID 'norek'
    const norekElement = document.getElementById("norek-bca");
    const textToCopy = norekElement.innerText;
    
    // 2. Gunakan Clipboard API untuk menyalin
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Jika berhasil, tampilkan modal
        showCopyModal();
    }).catch(err => {
        // Fallback jika browser lama tidak mendukung Clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showCopyModal();
        } catch (err) {
            console.error('Gagal menyalin: ', err);
        }
        document.body.removeChild(textArea);
    });
}

/**
 * Fungsi untuk menampilkan modal
 */
function showCopyModal() {
    const modal = document.getElementById("copyModal");
    if (modal) {
        modal.style.display = "flex";
    }
}

/**
 * Fungsi untuk menutup modal
 */
function closeModal() {
    const modal = document.getElementById("copyModal");
    if (modal) {
        modal.style.display = "none";
    }
}

/**
 * Menutup modal secara otomatis jika pengguna mengklik 
 * area di luar kotak putih (pada overlay)
 */
window.addEventListener('click', function(event) {
    const modal = document.getElementById("copyModal");
    if (event.target === modal) {
        closeModal();
    }
});


// musicc
const audio = document.getElementById('weddingAudio');
const musicBtn = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');
const musicText = document.getElementById('musicText');

let isPlaying = false;

// Fungsi untuk menjalankan musik
function playMusic() {
    if (!isPlaying) {
        audio.play().then(() => {
            isPlaying = true;
            musicIcon.innerHTML = "⏸";
            musicText.innerHTML = "Musik Berjalan";
            musicBtn.classList.add('playing');
        }).catch(error => {
            console.log("Autoplay dicegah oleh browser, menunggu klik manual.");
        });
    }
}

// Fitur Auto Play: Jalankan musik saat user klik APA SAJA di halaman
document.addEventListener('click', function() {
    playMusic();
}, { once: true }); // { once: true } memastikan fungsi ini hanya jalan sekali saat klik pertama

// Fungsi tombol Play/Pause manual
musicBtn.addEventListener('click', function(e) {
    e.stopPropagation(); // Agar tidak bentrok dengan event listener document di atas
    
    if (isPlaying) {
        audio.pause();
        musicIcon.innerHTML = "▶";
        musicText.innerHTML = "Putar Musik";
        musicBtn.classList.remove('playing');
    } else {
        audio.play();
        musicIcon.innerHTML = "⏸";
        musicText.innerHTML = "Musik Berjalan";
        musicBtn.classList.add('playing');
    }
    isPlaying = !isPlaying;
});




});
