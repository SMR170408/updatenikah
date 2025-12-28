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
        guestDisplay.innerText = decodeURIComponent(namaTamu.replace(/\+/g, ' '));
    } else {
        // Jika tidak ada nama di URL, biarkan teks default
        guestDisplay.innerText = "Tamu Undangan";
    }

    // 5. Aksi Tombol Open Invitation (Gabungan dari semua logika sebelumnya)
    openBtn.addEventListener('click', function() {
        const cover = document.getElementById('cover');
        const mainContent = document.getElementById('mainContent');
        const body = document.body;

        // Efek fade-out cover
        cover.style.transition = "opacity 0.8s ease";
        cover.style.opacity = "0";
        
        setTimeout(() => {
            cover.style.display = "none";
            mainContent.classList.remove("hidden");
            body.classList.remove("lock-scroll");
            window.scrollTo(0, 0);

            // Mulai musik otomatis (handle autoplay policy)
            playMusic();

            // Mulai countdown
            startCountdown();

            // Mulai slider hero
            WeddingSlider.init();
            setTimeout(() => {
                WeddingSlider.start();
            }, 500);
        }, 800);
    });



    // COUNTDOWN (Dipindah ke fungsi terpisah untuk kebersihan)
    function startCountdown() {
        const targetDate = new Date("2026-01-20T08:00:00").getTime(); // Format ISO untuk kompatibilitas

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

    // HERO SLIDER (AFTER LOCK)
    const WeddingSlider = {
        slides: [],
        currentIndex: 0,
        timer: null,
        duration: 6000, // Jeda antar gambar (6 detik)

        // Inisialisasi elemen
        init() {
            this.slides = document.querySelectorAll('.hero-slide');
            if (this.slides.length === 0) return;
            
            // Pastikan slide pertama siap
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
                // Reset scale untuk slide yang tidak aktif
                if (!slide.classList.contains('active')) {
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

    // HALAMAN GALERY (Perbaiki ID dari 'sliderContainer' ke 'sliderWrapper' sesuai HTML)
    const container = document.getElementById('sliderWrapper'); // Diperbaiki: ID di HTML adalah 'sliderWrapper'
    if (container) {
        // Buat dots secara dinamis jika diperlukan (opsional, hapus jika tidak butuh)
        const slides = container.querySelectorAll('.slide');
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'dots-container';
        container.parentNode.appendChild(dotsContainer);

        slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                container.scrollTo({ left: i * (container.querySelector('.slide').clientWidth + 10), behavior: 'smooth' });
            });
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.dot');

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
    }



    // REKENING (Copy Text dengan Modal)
    // Tambahkan modal secara dinamis jika belum ada di HTML
    if (!document.getElementById('copyModal')) {
        const modal = document.createElement('div');
        modal.id = 'copyModal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeModal()">&times;</span>
                <p>Nomor rekening berhasil disalin!</p>
            </div>
        `;
        document.body.appendChild(modal);
    }

    window.copyText = function () {
        // Ambil teks dari elemen dengan ID 'norek-bca' (atau norek-mandiri, sesuaikan)
        const norekElement = document.getElementById("norek-bca");
        if (!norekElement) return;
        const textToCopy = norekElement.innerText;
        
        // Gunakan Clipboard API
        navigator.clipboard.writeText(textToCopy).then(() => {
            showCopyModal();
        }).catch(err => {
            // Fallback
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

    function showCopyModal() {
        const modal = document.getElementById("copyModal");
        if (modal) {
            modal.style.display = "flex";
        }
    }

    window.closeModal = function () {
        const modal = document.getElementById("copyModal");
        if (modal) {
            modal.style.display = "none";
        }
    }

    // Tutup modal jika klik di luar
    window.addEventListener('click', function(event) {
        const modal = document.getElementById("copyModal");
        if (event.target === modal) {
            closeModal();
        }
    });

    // MUSIK
    const audio = document.getElementById('weddingAudio');
    const musicBtn = document.getElementById('musicBtn');
    const musicIcon = document.getElementById('musicIcon');
    const musicText = document.getElementById('musicText');

    let isPlaying = false;

    // Fungsi untuk menjalankan musik
    function playMusic() {
        if (!isPlaying && audio) {
            audio.play().then(() => {
                isPlaying = true;
                musicIcon.innerHTML = "⏸";
                musicText.innerHTML = "Musik Berjalan";
                musicBtn.classList.add('playing');
            }).catch(error => {
                console.log("Autoplay dicegah oleh browser.");
            });
        }
    }

    // Auto Play: Jalankan musik saat user klik APA SAJA di halaman (sekali saja)
    document.addEventListener('click', function() {
        playMusic();
    }, { once: true });

    // Tombol Play/Pause manual
    if (musicBtn) {
        musicBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Agar tidak bentrok
            
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
    }


    
const API_URL = "https://script.google.com/macros/s/AKfycbyHqm2TnL7lyux44hEmej9_2JN_9ysdRFUpgqrnQECSKnvCj_czjnCyynhzo55CGyAD/exec";

const ucapanForm = document.getElementById("ucapanForm");
const displayUcapan = document.getElementById("displayUcapan");

let lastTimestamp = 0;




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



// ================= UCAPAN =================
if (ucapanForm) {
  ucapanForm.addEventListener("submit", async e => {
    e.preventDefault();

    const nama = ucapanForm.querySelector('[name="Nama"]').value;
    const pesan = ucapanForm.querySelector('[name="Ucapan"]').value;

    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        type: "ucapan",
        nama,
        pesan
      })
    });

    showToast("Pesan berhasil dikirim 🤍");
    ucapanForm.reset();

    // 🔥 reload realtime setelah kirim
  });
}



// ================= REALTIME LOAD =================


// POP UP PESAN
function showToast(text) {
  const toast = document.getElementById("toastNotif");
  toast.innerText = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}


// refresh tiap 5 detik (REALTIME ANTAR DEVICE)
const MAX_UCAPAN = 10;
function formatTanggal(waktu) {
  return new Date(waktu).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

async function loadUcapanRealtime() {
  if (!displayUcapan) return;

  try {
    const res = await fetch(API_URL + "?type=ucapan");
    const data = await res.json();

    data.reverse().forEach(d => {
      const waktu = new Date(d[0]).getTime(); // ⬅️ ARRAY
      if (waktu <= lastTimestamp) return;
      lastTimestamp = waktu;

      displayUcapan.insertAdjacentHTML("afterbegin", `
  <div class="ucapan-item animate">
    <p class="user-name">${d[1]}</p>
    <p class="user-msg">${d[2]}</p>
    <small>${formatTanggal(d[0])}</small>
  </div>
`);
lastIndex = index + 1;
    });

    const items = displayUcapan.querySelectorAll(".ucapan-item");
    if (items.length > MAX_UCAPAN) {
      items.forEach((el, i) => i >= MAX_UCAPAN && el.remove());
    }

  } catch (e) {
    console.error("Realtime error:", e);
  }
}

async function initUcapan() {
  if (!displayUcapan) return;

  const res = await fetch(API_URL + "?type=ucapan");
  const data = await res.json();

  data.slice(-MAX_UCAPAN).forEach(d => {
    const waktu = new Date(d[0]).getTime();
    lastTimestamp = Math.max(lastTimestamp, waktu);

    displayUcapan.insertAdjacentHTML("beforeend", `
  <div class="ucapan-item">
    <p class="user-name">${d[1]}</p>
    <p class="user-msg">${d[2]}</p>
    <small>${formatTanggal(d[0])}</small>
  </div>
`);

  });
}

initUcapan();
setInterval(loadUcapanRealtime, 2000);

});