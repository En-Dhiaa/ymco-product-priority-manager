import json
import os
import shutil

media_src = r'C:\Users\USER\Downloads\ضياء\AI\UMCO Tasks\extracted_media'
products_dest = r'C:\Users\USER\Downloads\ضياء\AI\UMCO Tasks\public\images\products'

with open(r'C:\Users\USER\Downloads\ضياء\AI\UMCO Tasks\parsed_raw_products.json', 'r', encoding='utf-8') as f:
    raw_items = json.load(f)

name_en_map = {
    1: 'Neoproct Cream 20g',
    2: 'Adapalene Gel 30g',
    3: 'Erythrolike Gel 30g',
    4: 'Facid-H Cream 15g',
    5: 'Facid-B Cream 15g',
    6: 'Facid Cream 15g',
    7: 'Facid Ointment 15g',
    8: 'Nystacomb Ointment 15g',
    9: 'Nystacomb Cream 15g',
    10: 'Voltenac Emulgel 30g',
    11: 'Dactazon Oral Gel 20g',
    12: 'Lidopain Gel 30g',
    13: 'Meboderm Ointment 30g',
    14: 'Cifadine Cream 20g',
    15: 'Panthcare Cream 30g',
    16: 'Ketozol Cream 30g',
    17: 'Tetracycline Ointment 15g',
    18: 'Hydroquinone Cream 30g',
    19: 'Dactazon Topical Cream 20g',
    20: 'Dermocin Cream 15g',
    21: 'Hydrocortisone Ointment 15g',
    22: 'Hydrocortisone Cream 15g',
    23: 'Betatreat Cream 15g',
    24: 'Umcovate Cream 15g',
    25: 'Oracin Gel 15g',
    26: 'Clotrimazole Cream 20g',
    27: 'Mometasone-M 20g',
    28: 'Mometasone Cream 20g',
    29: 'X-Gel (Sonic Gel) 30g',
    30: 'Melamet Cream 15g',
    31: 'Povidone-Zole Ointment 20g',
    32: 'Gentacin Cream 30g',
    33: 'Ketofast Gel 30g',
    34: 'Umcocort-N Ointment 15g',
    35: 'Umcocort-N Cream 15g',
    36: 'Umcovate Ointment 15g',
    37: 'Care Baby Ointment 20g',
    38: 'Absolut Nasal Drops 10ml',
    39: 'Absolut Jet Spray 20ml',
    40: 'Neomaxin Wound Powder 10g',
    41: 'Hydrogen Peroxide 1.5% 10ml',
    42: 'Baby Cord 7.1% 20ml',
    43: 'Ichthammol Ointment 25g',
    44: 'Umo-Vicks Balm 25g',
    45: 'Umcoderm Spray 80ml',
    46: 'Umcoderm Spray 60ml',
    47: 'Surgical Spirit 70% 80ml',
    48: 'Surgical Spirit 70% 60ml',
    49: 'Vagilin Vaginal Powder 10x10g',
    50: 'Sodi Wash Feminine 120ml',
    51: 'Sodi Wash Alkaline 120ml',
    52: 'Lacti Wash Feminine 120ml',
    53: 'Clotrimazole Vaginal Cream 30g',
    54: 'Hexodent Mouthwash 100ml',
    55: 'Calamandol Lotion 8% 100ml',
    56: 'Calamandol Lotion 8% 60ml',
    57: 'Ketozol Antifungal Shampoo 125ml',
    58: 'Permethrin Anti-Lice Shampoo 125ml',
    59: 'Umcoderm Povidone Iodine 10% (Multi-Pack & 5L)'
}

fallback_images = {
    15: './images/products/medical-product10-jpg.webp',
    52: './images/products/lacti-wash-eng-jpg.webp',
    54: './images/products/hexodent-home2-jpg.webp',
    55: './images/products/medical-product1-jpg.webp',
    56: './images/products/medical-product2-jpg.webp',
    59: './images/products/image81.png'
}

final_products = []
for it in raw_items:
    raw_id = it['raw_id']
    name_ar = it['name_ar']
    name_en = name_en_map.get(raw_id, f'YMCO Product #{raw_id}')
    
    img = it.get('image', '')
    if not img or not os.path.exists(os.path.join(r'C:\Users\USER\Downloads\ضياء\AI\UMCO Tasks\public', img.lstrip('./'))):
        img = fallback_images.get(raw_id, './images/logos/ymco-transparent-logo.png')
    
    status = 'active'
    if raw_id in [2, 13, 27, 33, 49]:
        status = 'under_development'
    elif raw_id in [42, 43]:
        status = 'completed'
    elif raw_id in [51]:
        status = 'under_review'
    elif raw_id in [30]:
        status = 'pending_approval'

    # Extract price
    price_val = 0
    try:
        parts = it['price_str'].split()
        if parts:
            price_val = int(parts[0])
    except:
        price_val = 500

    sku = f'YMCO-{raw_id:03d}'
    comp = it.get('composition', '')
    ind = it.get('indications', '')

    final_products.append({
        'id': f'prod-{raw_id}',
        'sku': sku,
        'priority': raw_id,
        'tradeNameEn': name_en,
        'tradeNameAr': name_ar,
        'scientificName': comp,
        'categoryEn': it['category_en'],
        'categoryAr': it['category_ar'],
        'dosageFormEn': 'Topical / External',
        'dosageFormAr': 'موضعي / خارجي',
        'concentration': comp[:30] if comp else '',
        'packageSize': name_ar.split()[-1] if name_ar else '',
        'indicationsEn': f'Indicated for pharmaceutical therapeutic usage: {comp}',
        'indicationsAr': ind,
        'usageEn': 'Apply as directed by physician or pharmacist.',
        'usageAr': 'يستخدم بحسب إرشادات الطبيب أو الصيدلاني.',
        'storageEn': 'Store below 25°C in a dry place protected from direct sunlight.',
        'storageAr': 'يحفظ في درجة حرارة أقل من 25 درجة مئوية في مكان جاف وبعيداً عن أشعة الشمس المباشرة.',
        'imageUrl': img,
        'additionalImages': [img],
        'status': status,
        'price': price_val,
        'priceFormatted': f'{price_val:,} YER' if price_val > 0 else 'N/A',
        'priceRaw': it['price_str'],
        'notes': f'Official 2026 Price: {it["price_str"]} YER. Registered pharmaceutical product for YMCO.',
        'createdAt': '2026-01-15T08:00:00Z',
        'updatedAt': '2026-11-04T08:00:00Z'
    })

# Add price fields to types.ts interface
print(f'Writing {len(final_products)} products to productsData.json and productsData.ts')

json_path = r'C:\Users\USER\Downloads\ضياء\AI\UMCO Tasks\src\data\productsData.json'
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(final_products, f, ensure_ascii=False, indent=2)

ts_content = '''import { Product } from '../types';
import productsJson from './productsData.json';

export const initialProducts: Product[] = productsJson as Product[];
export default initialProducts;
'''

ts_path = r'C:\Users\USER\Downloads\ضياء\AI\UMCO Tasks\src\data\productsData.ts'
with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
print('Done!')
