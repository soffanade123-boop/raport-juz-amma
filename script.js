const surah = [
    "An-Nas","Al-Falaq","Al-Ikhlas","Al-Lahab","An-Nasr","Al-Kafirun",
    "Al-Kausar","Al-Ma'un","Quraisy","Al-Fil","Al-Humazah","Al-Asr",
    "At-Takatsur","Al-Qari'ah","Al-Adiyat","Az-Zalzalah","Al-Bayyinah",
    "Al-Qadr","Al-Alaq","At-Tin","Asy-Syarh","Ad-Duha","Al-Lail",
    "Asy-Syams","Al-Balad","Al-Fajr","Al-Gasyiyah","Al-A'la","At-Tariq",
    "Al-Buruj","Al-Insyiqaq","Al-Mutaffifin","Al-Infitar","At-Takwir",
    "Abasa","An-Nazi'at","An-Naba"
];

let dataSiswa = JSON.parse(localStorage.getItem("dataSiswa") || "[]");
let siswaAktifIndex = null;

const $ = id => document.getElementById(id);

function renderSurah() {
    $("daftarSurah").innerHTML = surah.map((nama, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${nama}</td>
            <td><input class="nilai" type="number" min="0" max="100" placeholder="0-100" inputmode="numeric"></td>
        </tr>
    `).join("");
}

function simpanLocal() {
    localStorage.setItem("dataSiswa", JSON.stringify(dataSiswa));
}

function tampilkanSiswa() {
    $("daftarSiswa").innerHTML = dataSiswa.length ? dataSiswa.map((s, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(s.nama)}</td>
            <td>${s.kelas}</td>
            <td>${s.semester || "-"}</td>
            <td class="actions">
                <button class="small-btn" onclick="pilihSiswa(${i})">Raport</button>
                <button class="small-btn" onclick="editSiswa(${i})">Edit</button>
                <button class="small-btn danger" onclick="hapusSiswa(${i})">Hapus</button>
            </td>
        </tr>
    `).join("") : `<tr><td colspan="5" class="empty">Belum ada siswa.</td></tr>`;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
}

function tambahSiswa() {
    const nama = $("namaSiswa").value.trim();
    const kelas = $("kelasSiswa").value;
    const semester = $("semesterSiswa").value;
    const guru = $("namaGuruSiswa").value.trim();

    if (!nama || !kelas || !semester || !guru) {
        alert("Lengkapi nama siswa, kelas, semester, dan nama guru.");
        return;
    }

    dataSiswa.push({ nama, kelas, semester, guru, nilai: Array(37).fill(""), catatan: "" });
    simpanLocal();
    tampilkanSiswa();

    $("namaSiswa").value = "";
    $("kelasSiswa").value = "";
    $("semesterSiswa").value = "";
    $("namaGuruSiswa").value = "";
}

function pilihSiswa(index) {
    const siswa = dataSiswa[index];
    siswaAktifIndex = index;

    $("siswaAktif").textContent = `${siswa.nama} — Kelas ${siswa.kelas}`;
    $("catatanGuru").value = siswa.catatan || "";

    $("hasilNama").textContent = siswa.nama;
    $("hasilKelas").textContent = siswa.kelas;
    $("hasilSemester").textContent = siswa.semester || "-";
    $("hasilGuru").textContent = siswa.guru || "-";
    $("hasilGuruTtd").textContent = siswa.guru || "................";

    document.querySelectorAll(".nilai").forEach((input, i) => {
        input.value = siswa.nilai?.[i] ?? "";
    });

    window.scrollTo({ top: $("inputPanel").offsetTop - 20, behavior: "smooth" });
}

function simpanNilaiSiswa() {
    if (siswaAktifIndex === null) {
        alert("Pilih siswa dari tombol Raport terlebih dahulu.");
        return;
    }

    const siswa = dataSiswa[siswaAktifIndex];
    siswa.nilai = [...document.querySelectorAll(".nilai")].map(x => x.value);
    siswa.catatan = $("catatanGuru").value.trim();

    simpanLocal();
    tampilkanSiswa();
    alert("✅ Nilai dan catatan berhasil disimpan.");
}

function hitungRaport() {
    if (siswaAktifIndex === null) {
        alert("Pilih siswa terlebih dahulu.");
        return;
    }

    const siswa = dataSiswa[siswaAktifIndex];
    const nilai = siswa.nilai || [];

    let total = 0;
    let jumlah = 0;

    const tabel = surah.map((nama, i) => {
        const raw = nilai[i];
        let keterangan = "-";
        let angka = "";

        if (raw !== "" && raw !== undefined) {
            const n = Number(raw);
            if (!Number.isNaN(n)) {
                angka = n;
                total += n;
                jumlah++;
                keterangan = n >= 90 ? "Sangat Baik" :
                    n >= 80 ? "Baik" :
                    n >= 70 ? "Cukup" : "Perlu Bimbingan";
            }
        }

        return `<tr><td>${i + 1}</td><td>${nama}</td><td>${angka === "" ? "-" : angka}</td><td>${keterangan}</td></tr>`;
    }).join("");

    if (!jumlah) {
        alert("Belum ada nilai hafalan.");
        return;
    }

    const rata = total / jumlah;
    const predikat = rata >= 90 ? "Sangat Baik" :
        rata >= 80 ? "Baik" :
        rata >= 70 ? "Cukup" : "Perlu Bimbingan";

    $("hasilNama").textContent = siswa.nama;
    $("hasilKelas").textContent = siswa.kelas;
    $("hasilSemester").textContent = siswa.semester || "-";
    $("hasilGuru").textContent = siswa.guru || "-";
    $("hasilGuruTtd").textContent = siswa.guru || "................";
    $("tabelHasil").innerHTML = tabel;
    $("hasilRata").textContent = rata.toFixed(2);
    $("hasilPredikat").textContent = predikat;
    $("hasilTanggal").textContent = new Date().toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric"
    });

    $("hasil").scrollIntoView({ behavior: "smooth" });
}

function editSiswa(index) {
    const siswa = dataSiswa[index];
    const nama = prompt("Ubah nama siswa:", siswa.nama);
    if (nama === null) return;

    const kelas = prompt("Ubah kelas (VII / VIII / IX):", siswa.kelas);
    if (kelas === null) return;

    const semester = prompt("Ubah semester (Ganjil / Genap):", siswa.semester || "Ganjil");
    if (semester === null) return;

    const guru = prompt("Ubah nama guru:", siswa.guru || "");
    if (guru === null) return;

    const k = kelas.trim().toUpperCase();
    const sm = semester.trim();
    if (!nama.trim() || !["VII","VIII","IX"].includes(k) || !["Ganjil","Genap"].includes(sm) || !guru.trim()) {
        alert("Data edit tidak valid.");
        return;
    }

    siswa.nama = nama.trim();
    siswa.kelas = k;
    siswa.semester = sm;
    siswa.guru = guru.trim();

    simpanLocal();
    tampilkanSiswa();
}

function hapusSiswa(index) {
    if (!confirm("Hapus data siswa ini beserta nilainya?")) return;

    if (siswaAktifIndex === index) {
        siswaAktifIndex = null;
        $("siswaAktif").textContent = "Belum dipilih";
    }

    dataSiswa.splice(index, 1);
    simpanLocal();
    tampilkanSiswa();
}

function backupData() {
    if (!dataSiswa.length) {
        alert("Belum ada data siswa.");
        return;
    }

    const blob = new Blob([JSON.stringify(dataSiswa, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-raport-juz-amma.json";
    a.click();
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (!Array.isArray(data)) throw new Error();

            dataSiswa = data.map(s => ({
                nama: s.nama || "",
                kelas: s.kelas || "",
                semester: s.semester || "Ganjil",
                guru: s.guru || "",
                nilai: Array.isArray(s.nilai) ? [...s.nilai, ...Array(37).fill("")].slice(0, 37) : Array(37).fill(""),
                catatan: s.catatan || ""
            }));

            simpanLocal();
            siswaAktifIndex = null;
            tampilkanSiswa();
            alert("✅ Data berhasil diimport.");
        } catch {
            alert("❌ File backup tidak valid.");
        }
        event.target.value = "";
    };
    reader.readAsText(file);
}

$("btnTambah").addEventListener("click", tambahSiswa);
$("btnSimpan").addEventListener("click", simpanNilaiSiswa);
$("btnHitung").addEventListener("click", hitungRaport);
$("btnCetak").addEventListener("click", () => window.print());
$("btnBackup").addEventListener("click", backupData);
$("fileImport").addEventListener("change", importData);

renderSurah();
tampilkanSiswa();
