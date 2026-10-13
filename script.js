
const jenis = document.getElementById("jenis");
const nama = document.getElementById("nama");
const btnPreview = document.getElementById("btnPreview");
const btnDownload = document.getElementById("btnDownload");
const hasil = document.getElementById("hasil");
const namaHasil = document.getElementById("namaHasil");
const kegiatanHasil = document.getElementById("kegiatanHasil");

function getFilePDF() {
  return jenis.value === "Pesta Siaga"
    ? "sertifikat/Pesta%20Siaga.pdf"
    : "sertifikat/Perjusa.pdf";
}

// Preview nama
btnPreview.addEventListener("click", function () {
  const namaPeserta = nama.value.trim();

  if (!namaPeserta) {
    alert("Masukkan nama peserta terlebih dahulu!");
    nama.focus();
    return;
  }

  namaHasil.textContent = namaPeserta;
  kegiatanHasil.textContent = "Kegiatan: " + jenis.value;
  hasil.hidden = false;
});

// DOWNLOAD SERTIFIKAT PDF
btnDownload.addEventListener("click", async function () {
  const namaPeserta = nama.value.trim();

  if (!namaPeserta) {
    alert("Masukkan nama peserta terlebih dahulu!");
    nama.focus();
    return;
  }

  if (typeof PDFLib === "undefined") {
    alert("Library PDF belum termuat. Muat ulang halaman!");
    return;
  }

  const namaFile = namaPeserta
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .trim()
    .replace(/\s+/g, "_") || "Peserta";

  btnDownload.disabled = true;
  btnDownload.textContent = "Sedang membuat PDF...";

  try {
    const response = await fetch(getFilePDF());

    if (!response.ok) {
      throw new Error("PDF gagal dibuka. Status: " + response.status);
    }

    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const halaman = pdfDoc.getPages()[0];
    const { width, height } = halaman.getSize();

    const font = await pdfDoc.embedFont(
      PDFLib.StandardFonts.HelveticaBold
    );

    let ukuranFont = 28;
    const lebarMaksimum = width * 0.75;

    while (
      font.widthOfTextAtSize(namaPeserta, ukuranFont) > lebarMaksimum &&
      ukuranFont > 10
    ) {
      ukuranFont--;
    }

    const lebarNama = font.widthOfTextAtSize(
      namaPeserta,
      ukuranFont
    );

    halaman.drawText(namaPeserta, {
      x: (width - lebarNama) / 2,
      y: height * 0.75,
      size: ukuranFont,
      font: font,
      color: PDFLib.rgb(0, 0, 0)
    });

    const pdfHasil = await pdfDoc.save();
    const blob = new Blob([pdfHasil], {
      type: "application/pdf"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Sertifikat_" + namaFile + ".pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 10000);

  } catch (error) {
    console.error("Gagal membuat sertifikat:", error);
    alert("Gagal membuat sertifikat:\n" + error.message);
  } finally {
    btnDownload.disabled = false;
    btnDownload.textContent = "Download Sertifikat PDF";
  }
});
