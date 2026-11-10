"""Parse H-Box Excel files into seed JSON for KM Box.
Usage: python3 -I parse_excel.py <guests.xlsx> <order.xlsx> <out.json>
"""
import sys, json, re, datetime, hashlib
import openpyxl

guests_path, order_path, out_path = sys.argv[1:4]

def clean(s):
    if s is None:
        return ''
    return re.sub(r'\s+', ' ', str(s).replace(' ', ' ')).strip()

def fid(*parts):
    return hashlib.md5('|'.join(parts).encode()).hexdigest()[:10]

# ---------------- guests ----------------
wb = openpyxl.load_workbook(guests_path)
ws = wb.active
guests = []
venue = 'Авиатор'
for row in ws.iter_rows(min_row=1, values_only=True):
    v = [clean(x) for x in row[:6]]
    if not any(v):
        continue
    if v[0] and not any(v[1:]):
        venue = 'Штаб' if 'штаб' in v[0].lower() else ('Авиатор' if 'авиатор' in v[0].lower() else venue)
        continue
    if v[0] == 'Гость':
        continue
    guests.append({
        'id': fid('g', v[0], v[2], venue), 'venue': venue, 'name': v[0], 'hookah': v[1],
        'likes': v[2], 'dislikes': v[3], 'bowl': v[4], 'notes': v[5],
        'phone': '', 'strength': '', 'heat': '', 'updatedBy': 'импорт из Excel',
    })

# ---------------- catalog + inventory ----------------
wb = openpyxl.load_workbook(order_path)
SHEETS = {'Штаб': 'Штаб', 'Авик': 'Авиатор'}
CATEGORY_RE = re.compile(r'\s-\s*\d{3,}\s*$')
SKIP_BRANDS = {'СКЛАД/ПРОГОН'}

def num(x):
    return float(x) if isinstance(x, (int, float)) else None

catalog = {}
inventories = []
for sheet, venue in SHEETS.items():
    ws = wb[sheet]
    # dated column pairs (stock col, order col)
    pairs = []
    for c in range(4, ws.max_column + 1):
        if clean(ws.cell(3, c).value) != 'Наличие':
            continue
        oc = None
        for d in (1, 2):
            if clean(ws.cell(3, c + d).value) == 'Заказ':
                oc = c + d
                break
        if oc is None:
            continue
        date = author = None
        for cc in (c, c + 1, oc):
            v = ws.cell(2, cc).value
            if isinstance(v, datetime.datetime):
                date = date or v
            elif v and isinstance(v, str):
                author = author or clean(v)
        if date is None:
            continue
        pairs.append((c, oc, date, author or ''))

    brands, flavors = [], []
    brand = None
    category = ''
    expect_brand = False
    section = None  # 'acc' or 'tob'
    for r in range(4, ws.max_row + 1):
        a = clean(ws.cell(r, 1).value)
        b = ws.cell(r, 2).value
        if a == 'Аксессуары':
            section = 'acc'
            brand = {'id': fid(venue, 'acc'), 'name': 'Аксессуары', 'kind': 'acc', 'category': ''}
            brands.append(brand)
            continue
        if not a and clean(b) == 'Граммы на неделю':
            section = 'tob'
            expect_brand = True
            continue
        if not a:
            continue
        if a.startswith('СУММА'):
            break
        if section == 'acc':
            flavors.append({'id': fid(venue, 'acc', a), 'brandId': brand['id'], 'name': a, 'unit': 'шт'})
            continue
        if section != 'tob':
            continue
        if CATEGORY_RE.search(a):
            category = CATEGORY_RE.sub('', a).strip()
            expect_brand = True
            continue
        if a.lower().startswith('вес остаток'):
            expect_brand = True
            continue
        if expect_brand:
            expect_brand = False
            if a in SKIP_BRANDS:
                brand = None
                section = 'stop'
                continue
            brand = {'id': fid(venue, a), 'name': a, 'kind': 'tob', 'category': category}
            brands.append(brand)
            continue
        if brand is None:
            continue
        f = {'id': fid(venue, brand['name'], a), 'brandId': brand['id'], 'name': a, 'unit': 'г'}
        if num(b):
            f['perWeek'] = num(b)
        if num(ws.cell(r, 3).value):
            f['price'] = num(ws.cell(r, 3).value)
        f['_row'] = r
        flavors.append(f)

    # inventory history: only Aug 2026+ to keep it light
    rowmap = {}
    for f in flavors:
        pass
    # need rows for accessories too: rebuild map by scanning names
    name_rows = {}
    for r in range(4, ws.max_row + 1):
        name_rows.setdefault(clean(ws.cell(r, 1).value), []).append(r)
    for f in flavors:
        if '_row' not in f:
            f['_row'] = name_rows.get(f['name'], [None])[0]
    for (sc, oc, date, author) in pairs:
        if date < datetime.datetime(2026, 8, 1):
            continue
        items = {}
        for f in flavors:
            r = f['_row']
            if not r:
                continue
            s, o = num(ws.cell(r, sc).value), num(ws.cell(r, oc).value)
            if s is None and o is None:
                continue
            items[f['id']] = {'stock': s, 'order': o}
        if not items:
            continue
        inventories.append({'id': fid(venue, date.isoformat()), 'venue': venue,
                            'date': date.strftime('%Y-%m-%d'), 'author': author,
                            'items': items, 'source': 'excel'})
    # pack step per brand: smallest positive order in whole history
    for br in brands:
        steps = []
        for (sc, oc, date, author) in pairs:
            for f in flavors:
                if f['brandId'] != br['id'] or not f['_row']:
                    continue
                o = num(ws.cell(f['_row'], oc).value)
                if o and o > 0:
                    steps.append(o)
        if br['kind'] == 'tob':
            from collections import Counter
            mode = Counter(int(x) for x in steps).most_common(1)[0][0] if steps else 40
            br['step'] = max(40, mode)
            OVERRIDES = {'nuar': 200, 'deus парфюм': 40}
            if br['name'].lower() in OVERRIDES:
                br['step'] = OVERRIDES[br['name'].lower()]
    for f in flavors:
        f.pop('_row', None)
    catalog[venue] = {'brands': brands, 'flavors': flavors}

json.dump({'guests': guests, 'catalog': catalog, 'inventories': inventories},
          open(out_path, 'w'), ensure_ascii=False, indent=1)
print('guests', len(guests))
for v, c in catalog.items():
    print(v, 'brands', len(c['brands']), 'flavors', len(c['flavors']))
    print('  ', [(b['name'], b.get('category'), b.get('step')) for b in c['brands']])
print('inventories', [(i['venue'], i['date'], i['author'], len(i['items'])) for i in inventories])
