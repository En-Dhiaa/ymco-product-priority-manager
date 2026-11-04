import docx
import os
import json
import shutil
from PIL import Image

doc_path = r'C:\Users\USER\Downloads\ضياء\AI\UMCO Tasks\unencrypted_catalog.docx'
media_src = r'C:\Users\USER\Downloads\ضياء\AI\UMCO Tasks\extracted_media'
products_dest = r'C:\Users\USER\Downloads\ضياء\AI\UMCO Tasks\public\images\products'
os.makedirs(products_dest, exist_ok=True)

doc = docx.Document(doc_path)
rels = doc.part.rels
rid_to_target = {rid: rel.target_ref for rid, rel in rels.items() if 'image' in rel.reltype}

categories_map = {
    0: {'ar': 'المراهم والكريمات الجلدية', 'en': 'Dermatological Creams & Ointments'},
    1: {'ar': 'العناية بالبشرة والمطهرات', 'en': 'Skin Care & Antiseptics'},
    2: {'ar': 'المحاليل والقطرات والبخاخات', 'en': 'Solutions, Drops & Sprays'},
    3: {'ar': 'العناية النسائية والمطهرات', 'en': 'Feminine Care & Antiseptics'},
    4: {'ar': 'المستحضرات المتخصصة والمطهرات العامة', 'en': 'Specialized Products & Antiseptics'}
}

# We will collect structured products
products = []
counter = 1

for t_idx, table in enumerate(doc.tables):
    cat = categories_map.get(t_idx, {'ar': 'منتجات متنوعة', 'en': 'General Products'})
    for r_idx, row in enumerate(table.rows):
        cells = row.cells
        # get image rids specifically from first cell if possible or any cell
        first_cell_xml = cells[0]._element.xml if len(cells) > 0 else ''
        row_xml = ''.join([c._element.xml for c in cells])
        
        # cell images
        cell_images = [rid_to_target[rid] for rid in rid_to_target if rid in first_cell_xml]
        if not cell_images:
            cell_images = [rid_to_target[rid] for rid in rid_to_target if rid in row_xml]
        
        # Texts
        cell_texts = []
        for c in cells:
            t = c.text.strip().replace('\r', ' ').replace('\n', ' ')
            while '  ' in t:
                t = t.replace('  ', ' ')
            if t and (not cell_texts or cell_texts[-1] != t):
                cell_texts.append(t)
        
        if not cell_texts or 'الصنف' in cell_texts or 'الصورة' in cell_texts:
            continue
        
        # Extract fields
        # Typical pattern: [name, price, composition, indications]
        name_ar = cell_texts[0] if len(cell_texts) > 0 else ''
        price_str = cell_texts[1] if len(cell_texts) > 1 else '0'
        composition = cell_texts[2] if len(cell_texts) > 2 else ''
        indications = cell_texts[3] if len(cell_texts) > 3 else ''
        
        # Try to parse price as integer if single number
        price_clean = ''.join([c for c in price_str if c.isdigit() or c == ' ']).strip()
        
        # Image matching
        img_name = ''
        if cell_images:
            raw_img = os.path.basename(cell_images[0])
            src_file = os.path.join(media_src, raw_img)
            
            # If image exists and is jpeg/png/webp
            if os.path.exists(src_file):
                ext = os.path.splitext(raw_img)[1].lower()
                if ext in ['.jpeg', '.jpg', '.png', '.webp']:
                    dest_filename = f'prod_{counter}{ext}'
                    dest_file = os.path.join(products_dest, dest_filename)
                    shutil.copy(src_file, dest_file)
                    img_name = f'./images/products/{dest_filename}'
        
        products.append({
            'raw_id': counter,
            'table_index': t_idx,
            'category_ar': cat['ar'],
            'category_en': cat['en'],
            'name_ar': name_ar,
            'price_str': price_clean,
            'composition': composition,
            'indications': indications,
            'image': img_name,
            'raw_images': cell_images
        })
        counter += 1

print(f'Total parsed products: {len(products)}')
with open(r'C:\Users\USER\Downloads\ضياء\AI\UMCO Tasks\parsed_raw_products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)
print('Saved to parsed_raw_products.json')
