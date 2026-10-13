
const jenis = document.getElementById("jenis");
const nama = document.getElementById("nama");
const btnDownload = document.getElementById("btnDownload");

btnDownload.addEventListener("click", async function () {
  const namaPeserta = nama.value.trim();

  if (!namaPeserta) {
    alert("Masukkan nama peserta terlebih dahulu, bro!");
    nama.focus();
    return;
  }

  if (typeof PDFLib === "undefined") {
    alert("Library PDF belum termuat. Periksa koneksi internet!");
    return;
  }

  const namaFile = namaPeserta
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "_") || "Peserta";

  btnDownload.disabled = true;
  btnDownload.textContent = "Sedang membuat PDF...";

  try {
    const filePDF =
      jenis.value === "Pesta Siaga"
        ? "sertifikat/Pesta%20Siaga.pdf"
        : "sertifikat/Perjusa.pdf";

    const response = await fetch(filePDF);

    if (!response.ok) {
      throw new Error("PDF tidak ditemukan. Status: " + response.status);
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
      y: height * 0.40,
      size: ukuranFont,
      font: font,
      color: PDFLib.rgb(0, 0, 0)
    });

    const hasilPDF = await pdfDoc.save();
    const blob = new Blob([hasilPDF], {
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
