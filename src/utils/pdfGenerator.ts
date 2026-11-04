import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, AppSettings } from '../types';

interface ExportPdfOptions {
  products: Product[];
  settings: AppSettings;
  mode: 'summary' | 'detailed';
  orientation: 'portrait' | 'landscape';
  refNumber?: string;
  preparedBy?: string;
  scopeTitle?: string;
}

// Convert image URL to Base64
const getBase64ImageFromUrl = async (imageUrl: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 120;
        canvas.height = img.naturalHeight || 120;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataURL);
      } catch (e) {
        console.warn('Canvas conversion failed for:', imageUrl, e);
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = imageUrl;
  });
};

export const generateYmcoPdf = async (options: ExportPdfOptions): Promise<void> => {
  const { products, settings, mode, orientation, refNumber, preparedBy, scopeTitle } = options;

  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const generationDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Pre-load YMCO logo
  let logoBase64: string | null = null;
  try {
    logoBase64 = await getBase64ImageFromUrl('./images/logos/ymco-pill-logo.png') ||
                 await getBase64ImageFromUrl('./images/logos/ymco-banner-300.webp');
  } catch (e) {
    console.warn('Logo load error:', e);
  }

  // Pre-load top 50 product images in parallel for high speed
  const imageMap = new Map<string, string | null>();
  if (products.length <= 100) {
    const promises = products.map(async (p) => {
      if (p.imageUrl) {
        const b64 = await getBase64ImageFromUrl(p.imageUrl);
        imageMap.set(p.id, b64);
      }
    });
    await Promise.all(promises);
  }

  // Common Header & Footer function
  const renderHeaderFooter = (pageNumber: number, totalPages: number) => {
    // Top Corporate Red Accent Bar
    doc.setFillColor(198, 40, 40); // YMCO Primary Red #C62828
    doc.rect(0, 0, pageWidth, 5, 'F');

    // Corporate Header Box
    doc.setFillColor(255, 255, 255);
    doc.rect(10, 8, pageWidth - 20, 22, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(10, 31, pageWidth - 10, 31);

    // Embed YMCO Logo
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', 12, 10, 32, 13);
      } catch (err) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(198, 40, 40);
        doc.text('UMCO PHARMA', 12, 19);
      }
    } else {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(198, 40, 40);
      doc.text('UMCO PHARMA', 12, 19);
    }

    // Header Titles
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    const titleText = mode === 'summary' ? 'PRODUCT PRIORITY LIST' : 'DETAILED PHARMACEUTICAL REPORT';
    doc.text(titleText, 48, 17);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Yemen Medical Company for Pharmaceutical Industries', 48, 22);
    if (scopeTitle) {
      doc.setFont('Helvetica', 'italic');
      doc.text(`Scope: ${scopeTitle} (${products.length} products)`, 48, 27);
    }

    // Document Meta (Right side)
    const rightMargin = pageWidth - 12;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`Ref: ${refNumber || settings.pdfRefNumber || 'UMCO-PPL-2026'}`, rightMargin, 16, { align: 'right' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Date: ${generationDate}`, rightMargin, 21, { align: 'right' });
    doc.text(`Prepared By: ${preparedBy || settings.pdfPreparedBy || 'Supply Chain Management'}`, rightMargin, 26, { align: 'right' });

    // Footer
    const footerY = pageHeight - 10;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(10, footerY - 3, pageWidth - 10, footerY - 3);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(settings.pdfFooterNoteEn || 'Confidential & Proprietary — Yemen Medical Company (UMCO)', 12, footerY + 1);

    // Page Number
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(`Page ${pageNumber} of ${totalPages}`, rightMargin, footerY + 1, { align: 'right' });
  };

  if (mode === 'summary') {
    // Mode A: Summary Table
    const tableData = products.map((p) => [
      `#${p.priority}`,
      '', // placeholder for thumbnail image
      `${p.tradeNameEn}\n${p.tradeNameAr}`,
      `${p.categoryEn}\n${p.dosageFormEn || p.concentration}`,
      p.priceFormatted ? `${p.priceFormatted}` : (p.price ? `${p.price} YER` : 'Official'),
      p.status
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Priority', 'Photo', 'Product Name (EN / AR)', 'Category & Dosage', 'Price (2026)', 'Status']],
      body: tableData,
      theme: 'grid',
      margin: { top: 35, bottom: 18, left: 10, right: 10 },
      styles: {
        fontSize: 8.5,
        cellPadding: 2.5,
        valign: 'middle',
        lineColor: [226, 232, 240],
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: [198, 40, 40],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 16, halign: 'center' },
        2: { cellWidth: orientation === 'landscape' ? 95 : 62, fontStyle: 'bold' },
        3: { cellWidth: orientation === 'landscape' ? 75 : 46 },
        4: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 24, halign: 'center' }
      },
      didDrawCell: (data) => {
        // Draw thumbnail in column 1
        if (data.section === 'body' && data.column.index === 1) {
          const product = products[data.row.index];
          if (product) {
            const b64 = imageMap.get(product.id);
            if (b64) {
              try {
                const cellX = data.cell.x + 2;
                const cellY = data.cell.y + 1.5;
                const size = 11;
                doc.addImage(b64, 'JPEG', cellX, cellY, size, size);
              } catch (e) {
                // ignore image rendering error
              }
            }
          }
        }
        // Style status column
        if (data.section === 'body' && data.column.index === 4) {
          const statusText = data.cell.raw as string;
          if (statusText === 'Active') {
            doc.setTextColor(22, 101, 52); // green
          } else if (statusText === 'Under Development') {
            doc.setTextColor(30, 64, 175); // blue
          } else if (statusText === 'Suspended') {
            doc.setTextColor(185, 28, 28); // red
          } else if (statusText === 'Pending Approval') {
            doc.setTextColor(194, 65, 12); // orange
          }
        }
      }
    });
  } else {
    // Mode B: Detailed Product Dossier
    const detailedData: any[][] = [];
    products.forEach((p) => {
      detailedData.push([
        `#${p.priority}`,
        '', // Image cell
        `English: ${p.tradeNameEn}\nArabic: ${p.tradeNameAr}\nScientific: ${p.scientificName || 'N/A'}\nSKU: ${p.sku}`,
        `Category: ${p.categoryEn}\nDosage: ${p.dosageFormEn || 'N/A'}\nConcentration: ${p.concentration || 'N/A'}\nPrice (2026): ${p.priceFormatted || (p.price ? `${p.price} YER` : 'Official')}\nPackage: ${p.packageSize || 'N/A'}`,
        `Indications: ${p.indicationsEn || p.indicationsAr || 'N/A'}\nUsage: ${p.usageEn || 'As directed by physician'}\nStorage: ${p.storageEn || 'Store below 25°C in dry place'}\nNotes: ${p.notes || 'None'}`,
        p.status
      ]);
    });

    autoTable(doc, {
      startY: 35,
      head: [['Priority', 'Photo', 'Product Identification', 'Pharmaceutical Specs', 'Clinical Use & Instructions', 'Status']],
      body: detailedData,
      theme: 'striped',
      margin: { top: 35, bottom: 18, left: 10, right: 10 },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        valign: 'top',
        lineColor: [226, 232, 240],
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: [198, 40, 40],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: orientation === 'landscape' ? 65 : 45 },
        3: { cellWidth: orientation === 'landscape' ? 55 : 38 },
        4: { cellWidth: orientation === 'landscape' ? 95 : 55 },
        5: { cellWidth: 24, halign: 'center', fontStyle: 'bold' }
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const product = products[data.row.index];
          if (product) {
            const b64 = imageMap.get(product.id);
            if (b64) {
              try {
                const cellX = data.cell.x + 2;
                const cellY = data.cell.y + 2;
                const size = 15;
                doc.addImage(b64, 'JPEG', cellX, cellY, size, size);
              } catch (e) {
                // ignore
              }
            }
          }
        }
      }
    });
  }

  // Draw Header and Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    renderHeaderFooter(i, totalPages);
  }

  // Download PDF file
  const filename = `UMCO_Product_Priority_List_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

