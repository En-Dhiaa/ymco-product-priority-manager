import * as XLSX from 'xlsx';
import { Product } from '../types';

export interface ImportValidationResult {
  validProducts: Product[];
  duplicateProducts: { existing: Product; incoming: Product }[];
  invalidRows: { rowNumber: number; reason: string; data: any }[];
  totalRows: number;
}

// 1. Export Products to Excel (.xlsx)
export const exportProductsToExcel = (products: Product[], filename = 'YMCO_Products_Priority'): void => {
  const exportData = products.map((p) => ({
    'Priority Number': p.priority,
    'SKU / ID': p.sku,
    'Trade Name (English)': p.tradeNameEn,
    'Trade Name (Arabic)': p.tradeNameAr,
    'Scientific Composition': p.scientificName,
    'Category (English)': p.categoryEn,
    'Category (Arabic)': p.categoryAr,
    'Dosage Form (English)': p.dosageFormEn,
    'Dosage Form (Arabic)': p.dosageFormAr,
    'Concentration': p.concentration,
    'Package Size': p.packageSize,
    'Status': p.status,
    'Price (2026 YER)': p.priceFormatted || (p.price ? `${p.price} YER` : ''),
    'Indications (English)': p.indicationsEn,
    'Indications (Arabic)': p.indicationsAr,
    'Usage (English)': p.usageEn,
    'Usage (Arabic)': p.usageAr,
    'Storage (English)': p.storageEn,
    'Storage (Arabic)': p.storageAr,
    'Internal Notes': p.notes,
    'Last Updated': p.updatedAt
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'YMCO Priority Catalog');

  // Column width formatting
  const colWidths = [
    { wch: 10 }, { wch: 16 }, { wch: 32 }, { wch: 32 }, { wch: 28 },
    { wch: 26 }, { wch: 26 }, { wch: 20 }, { wch: 20 }, { wch: 16 },
    { wch: 16 }, { wch: 16 }, { wch: 35 }, { wch: 35 }, { wch: 30 },
    { wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 30 }, { wch: 20 }
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

// 2. Export Products to CSV
export const exportProductsToCSV = (products: Product[], filename = 'YMCO_Products_Priority'): void => {
  const exportData = products.map((p) => ({
    'Priority': p.priority,
    'SKU': p.sku,
    'English Name': p.tradeNameEn,
    'Arabic Name': p.tradeNameAr,
    'Category': p.categoryEn,
    'Dosage Form': p.dosageFormEn,
    'Status': p.status,
    'Notes': p.notes
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob(["\uFEFF" + csvOutput], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
};

// 3. Parse and Validate Imported Excel / CSV File
export const parseAndValidateExcel = async (
  file: File,
  existingProducts: Product[]
): Promise<ImportValidationResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const validProducts: Product[] = [];
        const duplicateProducts: { existing: Product; incoming: Product }[] = [];
        const invalidRows: { rowNumber: number; reason: string; data: any }[] = [];

        const existingSkuMap = new Map<string, Product>();
        existingProducts.forEach((p) => existingSkuMap.set(p.sku.toLowerCase().trim(), p));

        rawJson.forEach((row, idx) => {
          const rowNum = idx + 2; // +1 for 0-index, +1 for header row

          // Resolve field variations
          const nameEn = row['Trade Name (English)'] || row['English Name'] || row['tradeNameEn'] || row['Name'] || '';
          const nameAr = row['Trade Name (Arabic)'] || row['Arabic Name'] || row['tradeNameAr'] || '';
          const sku = (row['SKU / ID'] || row['SKU'] || row['sku'] || row['ID'] || `YMCO-IMP-${Date.now()}-${idx}`).toString().trim();
          const priority = parseInt(row['Priority Number'] || row['Priority'] || row['priority'] || `${existingProducts.length + idx + 1}`, 10);
          const categoryEn = row['Category (English)'] || row['Category'] || row['categoryEn'] || 'General Medicine';
          const categoryAr = row['Category (Arabic)'] || row['categoryAr'] || 'أدوية عامة';
          const status = row['Status'] || row['status'] || 'Active';

          // Validation
          if (!nameEn && !nameAr) {
            invalidRows.push({
              rowNumber: rowNum,
              reason: 'Missing Product Trade Name (Both English and Arabic are empty)',
              data: row
            });
            return;
          }

          const parsedProduct: Product = {
            id: `imp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            sku: sku,
            priority: isNaN(priority) ? existingProducts.length + idx + 1 : priority,
            tradeNameEn: nameEn || nameAr,
            tradeNameAr: nameAr || nameEn,
            scientificName: row['Scientific Composition'] || row['scientificName'] || '',
            categoryEn: categoryEn,
            categoryAr: categoryAr,
            dosageFormEn: row['Dosage Form (English)'] || row['dosageFormEn'] || '',
            dosageFormAr: row['Dosage Form (Arabic)'] || row['dosageFormAr'] || '',
            concentration: row['Concentration'] || row['concentration'] || '',
            packageSize: row['Package Size'] || row['packageSize'] || '',
            indicationsEn: row['Indications (English)'] || row['indicationsEn'] || '',
            indicationsAr: row['Indications (Arabic)'] || row['indicationsAr'] || '',
            usageEn: row['Usage (English)'] || row['usageEn'] || '',
            usageAr: row['Usage (Arabic)'] || row['usageAr'] || '',
            storageEn: row['Storage (English)'] || row['storageEn'] || '',
            storageAr: row['Storage (Arabic)'] || row['storageAr'] || '',
            imageUrl: row['ImageUrl'] || row['imageUrl'] || './images/logos/ymco-pill-logo.png',
            status: status,
            price: row['Price (2026 YER)'] ? parseFloat(row['Price (2026 YER)']) : undefined,
            priceFormatted: row['Price (2026 YER)'] ? `${row['Price (2026 YER)']} YER` : undefined,
            notes: row['Internal Notes'] || row['Notes'] || 'Imported via Excel Batch',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const matchedExisting = existingSkuMap.get(sku.toLowerCase());
          if (matchedExisting) {
            duplicateProducts.push({
              existing: matchedExisting,
              incoming: parsedProduct
            });
          } else {
            validProducts.push(parsedProduct);
          }
        });

        resolve({
          validProducts,
          duplicateProducts,
          invalidRows,
          totalRows: rawJson.length
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

