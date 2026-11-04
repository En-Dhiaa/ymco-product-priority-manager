import json

with open(r'C:\Users\USER\Downloads\ضياء\AI\UMCO Tasks\parsed_raw_products.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f'Total items: {len(items)}')
no_img = []
for it in items:
    if not it.get('image'):
        no_img.append(it)
    print(f"#{it['raw_id']} | {it['name_ar']} | Price: {it['price_str']} | Img: {it['image']} | RawImgs: {it['raw_images']}")
print(f'Items without image: {len(no_img)}')

