
const jenis = document.getElementById("jenis");
const nama = document.getElementById("nama");
const btnPreview = document.getElementById("btnPreview");
const btnDownload = document.getElementById("btnDownload");
const hasil = document.getElementById("hasil");
const namaHasil = document.getElementById("namaHasil");
const kegiatanHasil = document.getElementById("kegiatanHasil");

// Lokasi PDF sertifikat
function getFilePDF() {
  if (jenis.value === "Pesta Siaga") {
    return "sertifikat/Pesta%20Siaga.pdf";
  }

  return "sertifikat/Perjusa.pdf";
}

// Tampilkan nama peserta
btnPreview.addEventListener("click", function () {
  const namaPeserta = nama.value.trim();

  if (!namaPeserta) {
    alert("Bro, masukkan nama peserta dulu!");
    nama.focus();
    return;
  }

  namaHasil.textContent = namaPeserta;
  kegiatanHasil.textContent = "Kegiatan: " + jenis.value;
  hasil.hidden = false;
});

// btnDownload.addEventListener("click", async function () {
  alert("Tombol download berhasil diklik!");

  if (!namaPeserta) {
    alert("Masukkan nama peserta terlebih dahulu!");
    nama.focus();
    return;
  }

  if (!window.PDFLib) {
    alert("Library PDF belum termuat. Periksa koneksi internet lalu muat ulang halaman.");
    return;
  }

  const teksNama = namaPeserta;
  const namaFile = teksNama
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  btnDownload.disabled = true;
  btnDownload.textContent = "Sedang membuat PDF...";

  try {
    // Ambil PDF melalui server XAMPP, bukan file://
    const response = await fetch(getFilePDF());

    if (!response.ok) {
      throw new Error(
        "PDF tidak ditemukan. Periksa folder sertifikat. Status: " +
        response.status
      );
    }

    const pdfBytes = await response.arrayBuffer();

    // Buka PDF asli
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const halaman = pdfDoc.getPages()[0];
    const { width, height } = halaman.getSize();

    // Gunakan font standar PDF
    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

    // Ukuran nama menyesuaikan panjang teks
    let ukuranFont = 28;
    const lebarMaksimum = width * 0.75;

    while (
      font.widthOfTextAtSize(teksNama, ukuranFont) > lebarMaksimum &&
      ukuranFont > 10
    ) {
      ukuranFont--;
    }

    const lebarNama = font.widthOfTextAtSize(teksNama, ukuranFont);

    // Posisi awal nama: horizontal tengah, sekitar 48% tinggi halaman
    halaman.drawText(teksNama, {
      x: (width - lebarNama) / 2,
      y: height * 0.57,
      size: ukuranFont,
      font: font,
      color: PDFLib.rgb(0, 0, 0)
    });

    // Simpan dan unduh PDF
    const pdfHasil = await pdfDoc.save();
    const blob = new Blob([pdfHasil], {
      type: "application/pdf"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Sertifikat_" + (namaFile || "Peserta") + ".pdf";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 2000);

  } catch (error) {
    console.error("Gagal membuat sertifikat:", error);
    alert(
      "Sertifikat gagal dibuat.\n" +
      error.message +
      "\n\nPeriksa Console browser jika masalah berlanjut."
    );
  } finally {
    btnDownload.disabled = false;
    btnDownload.textContent = "Download Sertifikat PDF";
  }
});
