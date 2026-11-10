/* KM Box — бизнес-логика без UI: чек-листы, даты, расчёт заказа, подбор микса */
(function (root) {
  'use strict';

  // ---------------- общие справочники ----------------
  const VENUES = ['Авиатор', 'Штаб'];

  const HOOKAHS = {
    'Авиатор': ['Mattpear', 'AlphaHookah', 'Ferro', 'Wookah', 'ХЛГН'],
    'Штаб': ['Mattpear', 'AlphaHookah', 'Ferro', 'Wookah', 'ХЛГН', 'Душа', 'Capsule', 'Mamay'],
  };
  const BOWLS = ['Фанел', 'Гармошка', 'Алешка', 'Турка', 'Электронная чаша', 'Фрукт'];
  const BOWL_GRAMS = { 'Фанел': 17, 'Гармошка': 20, 'Алешка': 19, 'Турка': 16, 'Электронная чаша': 18, 'Фрукт': 25 };
  const HEATS = ['Фольга', 'Калауд · Награни', 'Калауд · Лотус'];
  const DRAWS = ['Диффузорная', 'Недиффузорная'];
  const STRENGTHS = ['Лёгкий', 'Ниже среднего', 'Средний', 'Выше среднего', 'Крепкий'];

  const CHECKLISTS = {
    open: {
      title: 'ОТКРЫТИЕ',
      responsibleLabel: 'Ответственный',
      items: [
        ['Время прибытия (за час до смены, 12:00)', '+'],
        ['Форма (футболка, штаны и обувь), стираная глаженая', '+'],
        ['Плитка для углей включена', '+'],
        ['Вытяжка включена', 'Вкл'],
        ['Открыта смена в АЙКО', '+'],
        ['Отсутствие лишних вещей за стойкой, только рабочий инвентарь', '+'],
        ['Чистота рабочих поверхностей', '+'],
        ['Чистота ножек столов и прилегающих поверхностей', '+'],
        ['Чистота столешницы бара под кальянами', '+'],
        ['Чистота полок с табаками', '+'],
        ['Чистота раковины и крана (без налетов)', '+'],
        ['Чистота плиты для углей (без нагара)', '+'],
        ['Чистота вытяжки и всех поверхностей вокруг нее', '+'],
        ['Чистота искрогасителя', '+'],
        ['Чистота мусорного ведра', '+'],
        ['Чистота ведер для углей (без нагара)', '+'],
        ['Чистота пола и ковриков', '+'],
        ['Чистота кальянов (колбы, шахты)', '+'],
        ['Чистота уплотнителей', '+'],
        ['Чистата шлангов', '+'],
        ['Чистота чашек', '+'],
        ['Чистота колпаков и экранов', '+'],
        ['Читота калаудов', '+'],
        ['Чистота контейнеров + маркировка на них', '+'],
        ['Чистота ножей, ножниц,щипцов, шило', '+'],
        ['Чистота холодильника', '+'],
        ['Проверить наличие и количество табака в контейнерах', '+'],
        ['Уголь и фольга , наличие и подготовлен на смену', '+'],
        ['Проверить заряд на электронной чаше', '+'],
        ['Мундштуки, проверить наличие', '+'],
        ['Все контейнеры на рабочем месте заполнены табаком', '+'],
        ['Тряпки (новые) подготовлены на смену', '+'],
        ['Салфетки подготовлены', '+'],
      ],
    },
    close: {
      title: 'ЗАКРЫТИЕ',
      responsibleLabel: 'Фамилия ответственного',
      items: [
        ['Замыв ножек столов и прилегающих поверхностей', '+'],
        ['Замыв столешницы бара под кальянами', '+'],
        ['Замыв полок с табаками и самих банок с табаками', '+'],
        ['Замыв раковины', '+'],
        ['Замыв плиты для углей', '+'],
        ['Замыв вытяжки и поверхности прилегающей к ней', '+'],
        ['Замыв искрогасителя', '+'],
        ['Вынос мусорного ведра', '+'],
        ['Замыв ведра для углей и короба', '+'],
        ['Коврики подняты, чтобы мойщица убралась', '+'],
        ['Замыв кальянов (колбы, шахты). Вода с колб долна быть слита', '+'],
        ['Замыв шлангов (внутри и снаружи)', '+'],
        ['Замыв чашек', '+'],
        ['Калауды замочены', '+'],
        ['Замыв колпаков и экранов', '+'],
        ['Замыв контейнеров с табаком, проверка наличия маркировки', '+'],
        ['Замыв уплотнителей', '+'],
        ['Замыв принадлежностей (нож, ножницы, щипцы, шило)', '+'],
        ['Замыв холодильника', '+'],
        ['Выключить из розетки плиту, зарядку для шуруповёрта', '+'],
        ['Затарить углем, фольгой (если надо) и  мундштуками  рабочее место', '+'],
        ['Зарядка для шурика', '+'],
        ['Тряпки грязные выброшены либо отданы в стирку', '+'],
        ['Ковры резиновые убраны', '+'],
        ['Салфетки, подготовить на смену', '+'],
        ['Оборудование (печь и тд) и свет в рабочей зоне выключены', '+'],
        ['Вытяжка выключена', '+'],
        ['Смена в АЙКО закрыта', '+'],
      ],
    },
  };

  // ---------------- даты ----------------
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const dmy = (d) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  const fromYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const daysBetween = (a, b) => Math.round((fromYmd(b) - fromYmd(a)) / 86400000);

  /** Дата для отчёта: при закрытии с 00:00 до 04:00 — предыдущий день */
  function shiftDate(kind, now) {
    const d = new Date(now || Date.now());
    if (kind === 'close' && d.getHours() < 4) d.setDate(d.getDate() - 1);
    return d;
  }

  /** Нужна ли инвента: воскресенье после 12:30 и за сегодня по заведению её нет */
  function inventoryDue(inventories, venue, now) {
    const d = new Date(now || Date.now());
    if (d.getDay() !== 0) return false;
    if (d.getHours() * 60 + d.getMinutes() < 12 * 60 + 30) return false;
    const today = ymd(d);
    return !inventories.some((i) => i.venue === venue && i.date === today);
  }

  // ---------------- остатки и расчёт заказа ----------------
  function sortedInv(inventories, venue) {
    return inventories.filter((i) => i.venue === venue).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }

  /** Текущие остатки: последнее известное значение по каждой позиции */
  function currentStock(inventories, venue) {
    const res = {};
    for (const inv of sortedInv(inventories, venue)) {
      for (const [fid, it] of Object.entries(inv.items || {})) {
        if (it && typeof it.stock === 'number') res[fid] = { stock: it.stock, date: inv.date };
      }
    }
    return res;
  }

  /**
   * Расход позиции за последние ~2 недели.
   * Между двумя инвентами: было + заказали − стало (отрицательное = 0).
   * chain — инвенты по возрастанию даты (последняя может быть новой, ещё не сохранённой).
   */
  function usage(chain, fid, weeks) {
    weeks = weeks || 2;
    if (chain.length < 2) return { spent: 0, days: 0, weekly: 0 };
    const last = chain[chain.length - 1];
    let spent = 0, days = 0;
    for (let i = chain.length - 1; i > 0; i--) {
      const cur = chain[i], prev = chain[i - 1];
      const gap = daysBetween(prev.date, cur.date);
      if (gap <= 0) continue;
      if (days >= weeks * 7 - 2) break; // взяли достаточно интервалов
      const p = prev.items && prev.items[fid];
      const c = cur.items && cur.items[fid];
      days += gap;
      if (!p || typeof p.stock !== 'number' || !c || typeof c.stock !== 'number') continue;
      const s = p.stock + (p.order || 0) - c.stock;
      if (s > 0) spent += s;
    }
    void last;
    const weekly = days ? (spent / days) * 7 : 0;
    return { spent: Math.round(spent), days, weekly };
  }

  /**
   * Рекомендованный заказ.
   * Закупаем, если остатка не хватит на cover недель + резерв.
   * Кол-во округляем вверх до шага пополнения бренда (мин. 40 г).
   */
  function suggestOrder(stock, use, step, params) {
    params = params || {};
    const coverWeeks = params.coverWeeks || 1.5;
    const reserve = params.reserve != null ? params.reserve : 30;
    const minStep = params.minStep || 40;
    step = Math.max(minStep, step || minStep);
    if (!use.weekly || use.weekly < 1) return 0;
    const need = use.weekly * coverWeeks + reserve - (stock || 0);
    if (need <= 0) return 0;
    return Math.ceil(need / step) * step;
  }

  // ---------------- профили вкусов ----------------
  // tag: [regex по названию], sour — кислотность 0..1 (0.5 нейтрально)
  const TAGS = {
    berry: { label: 'Ягоды', re: /ягод|berry|клубни|землян|малин|черник|голубик|ежевик|смородин|currant|клюкв|cranberr|брусник|вишн|cherry|черешн|kriek|крыжовник|бузин|elderberr|ирга|berserk|годжи|облепих|рябин|княженик|жимолост|haskap|strawberr|raspberr|blueberr|schnozz|кизил|acid|барбарис|barberr/i },
    citrus: { label: 'Цитрус', re: /лимон|lemon|лайм|lime|апельсин|orange|грейпфрут|grapefruit|помело|pomel|мандарин|клементин|vita|бергамот|bergam|цитрус|citrus|mimon|юзу|yuzu/i },
    tropic: { label: 'Тропики', re: /манго|mango|маракуй|passion|ананас|pineapple|ananas|папай|papaya|гуав|guava|личи|lychee|тропи|tropic|банан|banana|кокос|coconut|киви|kiwi|фейхоа|feijoa|green beam|мультифрукт|mixed fruit|space flavour|aloha/i },
    fruit: { label: 'Фрукты', re: /яблок|apple|груш|pear|персик|peach|абрикос|apricot|курага|слив|plum|tanos|виноград|grape|арбуз|watermelon|дын|melon|гранат|нектарин|чернослив|prunes|инжир|fig|тыкв|halloween|фрукт|panama|кактус|cactus/i },
    dessert: { label: 'Десерт', re: /десерт|печень|cookie|вафл|waffle|пончик|donut|pon pon|пышк|оладуш|чизкейк|cheesecake|брауни|browni|шоколад|chocolate|карамел|caramel|ирис|candy|конфет|марципан|marzipan|пудинг|pudding|крамбл|crumb|пирог|маршмел|мороже|ice cream|iced cream|ice snow|black&white|хлопья|cereal|каша|rice|трюфел|truffle|fifi|пастил|сгущ|killer milk|мёд|мед|honey|ваниль|vanil|джем|jam|skittles|скиттлз|жвачк|gum|орбит|bubble/i },
    creamy: { label: 'Сливочное', re: /сливк|сливоч|cream|крем|йогурт|yogurt|молоч|milk|baileys|бейлис|шейк|shake|творож|cheese|welsh|horchata|орчат/i },
    drink: { label: 'Напитки', re: /лимонад|lemonade|морс|сок|juice|газиров|soda|кола|cola|энергетик|energ|джин|gin|ром|rum|виски|whisk|пиво|guinness|вино|белое сухое|порто|абсент|абсинт|бормотух|настойк|fantola|frustyle|тоник|tonic|bittersweet|voltage|pool|rap rose|ale|минеральн|cucunade|смузи/i },
    tea: { label: 'Чай / кофе', re: /чай|tea|каркаде|кофе|coffee|chai|earl|грей|darksupra/i },
    herbal: { label: 'Травы', re: /базилик|basil|шалфей|salbei|эстрагон|estragon|тархун|ромашк|chamomile|лаванд|lavender|лемонграсс|чабрец|магента|травы|herb|cilantro|кинз|щавел|огур|cucumber|алоэ|aloe|имбир|ginger|эвкалипт/i },
    floral: { label: 'Цветы / парфюм', re: /цвет|flower|роз|rose|пион|peon|фиалк|сирен|жасмин|лили|сакур|тюльпан|парфюм|perfume|balenciaga|ganymede|varanasi|ладан|мускус|замш|кожа|red \(|but not today|black afgano|buio|sandal|сандал|древес/i },
    conifer: { label: 'Хвоя', re: /хвоя|needl|ёлк|елк|сосн|таёжн|таежн|pine\b/i },
    spice: { label: 'Пряное', re: /пряно|перец|pepper|корица|гвоздик|бекон|bacon|салями|salami|гаспачо|gazpacho|кукуруз|corn|морков|carrot|олив|olive|сыр|чеддер|кунжут|sesame/i },
    nut: { label: 'Орехи / табачное', re: /орех|nut|фисташ|pistach|миндал|сигар|cigar|табачн|кофейн|сухофрукт|андре гигант|екатерина|николай|романовы/i },
    mint: { label: 'Мята', re: /мят|mint|wintergreen|пастил/i },
    cold: { label: 'Холодок', re: /supernova|ментол|menthol|\bice\b(?! snow)|\bcool\b|холод|\bicy\b/i },
  };
  const SOUR_RE = /кисл|sour|shock|лимон|lemon|лайм|lime|грейпфрут|grapefruit|клюкв|cranberr|смородин|currant|щавел|кизил|acid|барбарис|крыжовник|помело|pomel|киви|kiwi|гранат|бузин|ирга|облепих|маракуй|passion|tanos|pool|ревень|цитрус|citrus|ананас|pineapple|ananas|вишн|cherry|морс|тоник|bittersweet|грей/i;
  const SWEET_RE = /слад|sweet|десерт|печень|cookie|вафл|waffle|карамел|caramel|ирис|конфет|candy|пудинг|шоколад|chocolate|сгущ|milk|сливк|cream|крем|мёд|мед|honey|ваниль|vanil|маршмел|мороже|чизкейк|брауни|банан|banana|манго|mango|дын|melon|персик|peach|папай|papaya|клубни|strawberr|жвачк|gum|skittles|кола|cola|пончик|оладуш|хлопья|джем|jam|личи|арбуз|watermelon|груш|pear|marzipan|марципан/i;

  const PAIRS = {
    'berry+citrus': 3, 'berry+dessert': 2, 'berry+creamy': 2, 'berry+floral': 2, 'berry+herbal': 2, 'berry+conifer': 2, 'berry+tea': 2, 'berry+drink': 2, 'berry+tropic': 2, 'berry+fruit': 2, 'berry+cold': 1, 'berry+mint': 1,
    'citrus+tropic': 3, 'citrus+tea': 3, 'citrus+herbal': 3, 'citrus+drink': 2, 'citrus+fruit': 2, 'citrus+conifer': 2, 'citrus+floral': 1, 'citrus+mint': 2, 'citrus+cold': 2, 'citrus+dessert': -1, 'citrus+creamy': -1,
    'tropic+fruit': 2, 'tropic+creamy': 2, 'tropic+drink': 2, 'tropic+herbal': 1, 'tropic+dessert': 1, 'tropic+floral': 1, 'tropic+cold': 1,
    'fruit+dessert': 1, 'fruit+creamy': 1, 'fruit+herbal': 2, 'fruit+tea': 2, 'fruit+drink': 2, 'fruit+floral': 1, 'fruit+spice': 1, 'fruit+cold': 1,
    'dessert+creamy': 3, 'dessert+nut': 3, 'dessert+tea': 2, 'dessert+drink': 1, 'dessert+herbal': -2, 'dessert+cold': -2, 'dessert+mint': -1,
    'creamy+nut': 2, 'creamy+tea': 2, 'creamy+herbal': -1,
    'drink+herbal': 2, 'drink+tea': 1, 'drink+cold': 2, 'drink+mint': 2,
    'tea+herbal': 2, 'tea+floral': 2, 'tea+mint': 1,
    'herbal+floral': 1, 'herbal+conifer': 2, 'herbal+mint': 2, 'herbal+cold': 2,
    'floral+nut': 1, 'nut+spice': 1, 'conifer+cold': 2, 'conifer+mint': 2, 'spice+herbal': 1,
  };
  function pairScore(a, b) {
    let best = 0, worst = 0;
    for (const x of a) for (const y of b) {
      if (x === y) { best = Math.max(best, 1); continue; }
      const v = PAIRS[x + '+' + y] != null ? PAIRS[x + '+' + y] : (PAIRS[y + '+' + x] || 0);
      best = Math.max(best, v); worst = Math.min(worst, v);
    }
    return best + worst;
  }

  // Крепость брендов по умолчанию (1..5) — можно поменять в настройках
  const BRAND_STRENGTH = [
    [/black burn/i, 4], [/dark side|^ds\b/i, 4], [/tangiers|танж/i, 5], [/nuar|нуар/i, 4], [/blansh|бланш/i, 3],
    [/must have/i, 3], [/starline|старлайн/i, 2], [/sebero/i, 2], [/хулиган/i, 3], [/сарма/i, 3], [/северный/i, 4],
    [/bonche|бонч/i, 5], [/jent/i, 4], [/deus/i, 2], [/wto/i, 4], [/spectrum/i, 3], [/overdose/i, 3],
    [/trofimoff/i, 3], [/palitra/i, 2], [/afzal/i, 2], [/chaba/i, 1], [/kraken|marinage|d[оo]gma|dagma/i, 5], [/база/i, 3],
  ];
  function defaultBrandStrength(name) {
    for (const [re, v] of BRAND_STRENGTH) if (re.test(name)) return v;
    return 3;
  }

  function profile(flavor, brand) {
    if (flavor._p) return flavor._p;
    const text = flavor.name + ' ' + (flavor.note || '');
    let tags = (flavor.tags && flavor.tags.length) ? flavor.tags.slice() : Object.keys(TAGS).filter((t) => TAGS[t].re.test(text));
    if (!tags.length) tags = /parfum|парфюм/i.test(brand ? brand.name : '') ? ['floral'] : ['fruit'];
    let sour = 0.45;
    if (SOUR_RE.test(text)) sour += 0.35;
    if (SWEET_RE.test(text)) sour -= 0.3;
    if (/кисл|sour|shock|acid/i.test(text)) sour = 0.95;
    if (/ультракисл/i.test(text)) sour = 1;
    sour = Math.max(0, Math.min(1, sour));
    const strength = brand ? (brand.strength || defaultBrandStrength(brand.name)) : 3;
    const p = { tags, sour, strength };
    Object.defineProperty(flavor, '_p', { value: p, enumerable: false, configurable: true, writable: true });
    return p;
  }

  /**
   * Подбор микса.
   * req: { venue, likeBrands[], dislikeBrands[], likeTags[], dislikeTags[], likeFlavors[], dislikeFlavors[],
   *        baseTag, baseFlavor, strength(1..5), sour(0..100), bowl, heat, hookah, draw, cold, mint, novice }
   * ctx: { brands[], flavors[], stock{fid:{stock}} }
   */
  function recommendMix(req, ctx) {
    const brandById = Object.fromEntries(ctx.brands.map((b) => [b.id, b]));
    const bowl = req.bowl || autoBowl(req);
    const bowlGrams = BOWL_GRAMS[bowl] || 18;
    const targetSour = (req.sour != null ? req.sour : 50) / 100;
    const targetStrength = req.strength || 3;
    const dislikeText = (req.dislikeText || '').toLowerCase();

    const pool = [];
    for (const f of ctx.flavors) {
      const br = brandById[f.brandId];
      if (!br || br.kind !== 'tob' || f.hidden) continue;
      const st = ctx.stock[f.id] ? ctx.stock[f.id].stock : 0;
      if (st < 12) continue; // меньше чем на одну порцию
      if ((req.dislikeBrands || []).includes(br.name)) continue;
      if ((req.dislikeFlavors || []).includes(f.id)) continue;
      const p = profile(f, br);
      if (p.tags.some((t) => (req.dislikeTags || []).includes(t))) continue;
      if (dislikeText && dislikeText.split(/[,;]+/).map((s) => s.trim()).filter((s) => s.length > 2).some((w) => f.name.toLowerCase().includes(w))) continue;
      const isMint = p.tags.includes('mint'), isCold = p.tags.includes('cold');
      if (isMint && !req.mint) continue;
      if (isCold && !req.cold) continue;
      // индивидуальный балл
      let s = 0;
      const why = [];
      if (req.baseFlavor === f.id) { s += 8; why.push('вкус в основе'); }
      if (req.baseTag && p.tags.includes(req.baseTag)) { s += 4; why.push('основа: ' + TAGS[req.baseTag].label.toLowerCase()); }
      const liked = p.tags.filter((t) => (req.likeTags || []).includes(t));
      if (liked.length) { s += 2.5 * liked.length; why.push('любит ' + liked.map((t) => TAGS[t].label.toLowerCase()).join(', ')); }
      if ((req.likeFlavors || []).includes(f.id)) { s += 4; why.push('любимый вкус'); }
      if ((req.likeBrands || []).includes(br.name)) { s += 2; why.push('любимый бренд'); }
      s -= 4 * Math.abs(p.sour - targetSour);
      s += Math.min(1, Math.log10(st) - 1.3); // чуть приоритетнее то, чего много
      if (isCold && /supernova|ментол|menthol/i.test(f.name)) s += 2; // чистый холодок — лучший акцент
      pool.push({ f, br, p, stock: st, score: s, why, isMint, isCold });
    }
    if (pool.length < 2) return { error: 'Недостаточно вкусов в наличии под эти пожелания. Ослабьте фильтры.' };

    pool.sort((a, b) => b.score - a.score);
    let bases = pool.filter((c) => !c.isMint && !c.isCold);
    if (req.baseFlavor) bases = bases.filter((c) => c.f.id === req.baseFlavor).concat(bases.filter((c) => c.f.id !== req.baseFlavor));
    else if (req.baseTag) {
      const m = bases.filter((c) => c.p.tags.includes(req.baseTag));
      if (m.length) bases = m;
    }
    bases = bases.slice(0, 6);
    const partners = pool.slice(0, 40);
    const accents = pool.filter((c) => c.isMint || c.isCold).slice(0, 6);

    const RATIOS2 = [[60, 40], [70, 30], [50, 50]];
    const RATIOS3 = [[50, 30, 20], [60, 25, 15], [40, 40, 20]];
    const combos = [];
    const evalCombo = (parts, ratios) => {
      for (const r of ratios) {
        const share = parts.map((c, i) => ({ c, pct: r[i] }));
        const str = share.reduce((a, x) => a + x.c.p.strength * x.pct, 0) / 100;
        const sour = share.reduce((a, x) => a + x.c.p.sour * x.pct, 0) / 100;
        let s = share.reduce((a, x) => a + x.c.score * (x.pct / 100) * 1.6, 0);
        for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) s += 1.2 * pairScore(parts[i].p.tags, parts[j].p.tags);
        s -= 2.2 * Math.abs(str - targetStrength);
        s -= 3 * Math.abs(sour - targetSour);
        // требования: холодок/мята — обязательно в миксе
        if (req.cold && !parts.some((c) => c.isCold)) s -= 6;
        if (req.mint && !parts.some((c) => c.isMint)) s -= 6;
        // разнообразие: два одинаковых профиля — скучно
        if (parts.length > 1 && parts[0].p.tags.join() === parts[1].p.tags.join()) s -= 1;
        // хватит ли остатка
        if (share.some((x) => x.c.stock < bowlGrams * x.pct / 100 + 3)) s -= 10;
        s -= share.filter((x) => x.c.stock < 35).length * 0.8; // не добиваем последние граммы без нужды
        combos.push({ share, score: s, strength: str, sour });
      }
    };
    for (const b of bases) {
      for (const p of partners) {
        if (p.f.id === b.f.id || p.f.name === b.f.name) continue;
        if (!(req.cold || req.mint) || p.isMint || p.isCold) evalCombo([b, p], RATIOS2);
        for (const a of (req.cold || req.mint) ? accents : partners.slice(0, 15)) {
          if (a.f.id === b.f.id || a.f.id === p.f.id) continue;
          if (a.p.tags.includes('mint') || a.p.tags.includes('cold')) {
            evalCombo([b, p, a], [[55, 35, 10], [50, 35, 15]]);
          } else if (!(req.cold || req.mint)) {
            evalCombo([b, p, a], RATIOS3);
          }
        }
      }
    }
    combos.sort((a, b) => b.score - a.score);
    // уникальные по набору вкусов
    const seen = new Set(), picked = [];
    for (const c of combos) {
      const key = c.share.map((x) => x.c.f.id).sort().join('|');
      if (seen.has(key)) continue;
      // альтернативы с другой основой
      if (picked.length && picked.some((p) => p.share[0].c.f.id === c.share[0].c.f.id) && picked.length < 3 && combos.length > 50) {
        if (picked.filter((p) => p.share[0].c.f.id === c.share[0].c.f.id).length >= 1) continue;
      }
      seen.add(key);
      picked.push(c);
      if (picked.length === 3) break;
    }
    const fmt = (c) => ({
      parts: c.share.map((x) => ({
        flavorId: x.c.f.id, flavor: x.c.f.name, brand: x.c.br.name, pct: x.pct,
        grams: Math.round(bowlGrams * x.pct / 100), stock: x.c.stock, why: x.c.why,
      })),
      strength: Math.round(c.strength * 10) / 10,
      strengthLabel: STRENGTHS[Math.max(0, Math.min(4, Math.round(c.strength) - 1))],
      sour: Math.round(c.sour * 100),
      score: Math.round(c.score * 10) / 10,
    });
    return {
      best: fmt(picked[0]),
      alternatives: picked.slice(1).map(fmt),
      bowl, bowlGrams,
      heat: req.heat || autoHeat(bowl),
      tips: tips(req, bowl),
    };
  }

  function autoBowl(req) {
    const s = req.strength || 3;
    if (s >= 4) return 'Турка';
    if (s <= 2) return 'Гармошка';
    return 'Фанел';
  }
  function autoHeat(bowl) {
    if (bowl === 'Электронная чаша') return 'Без угля (электро)';
    if (bowl === 'Фрукт' || bowl === 'Турка') return 'Фольга';
    if (bowl === 'Гармошка') return 'Калауд · Лотус';
    return 'Калауд · Награни';
  }
  function tips(req, bowl) {
    const t = [];
    if (req.draw === 'Недиффузорная') t.push('Недиффузорная тяга — забивку делаем воздушнее, чтобы тяга не была тугой.');
    if ((req.strength || 3) >= 4) t.push('Крепкий запрос — держим жар ровным, без перегрева в первые 5 минут.');
    if ((req.strength || 3) <= 2) t.push('Лёгкий запрос — меньше табака у стенок, мягкий прогрев.');
    if (req.cold) t.push('Холодок — добавлен акцентом, не больше 10–15%.');
    if (bowl === 'Фрукт') t.push('Фруктовая чаша — микс послаще, фрукт сам добавит кислинку.');
    return t;
  }

  /** Текст заказа для отправки старшему КМ */
  function orderText(venue, date, author, lines) {
    const byBrand = {};
    for (const l of lines) (byBrand[l.brand] = byBrand[l.brand] || []).push(l);
    let out = `Заказ · ${venue} · ${date}\nИнвенту заполнил(а): ${author}\n`;
    let total = 0;
    for (const [b, ls] of Object.entries(byBrand)) {
      out += `\n${b}\n`;
      for (const l of ls) { out += `— ${l.name}: ${l.qty} ${l.unit || 'г'}\n`; if ((l.unit || 'г') === 'г') total += l.qty; }
    }
    out += `\nИтого табака: ${total} г`;
    return out;
  }

  root.KM = {
    VENUES, HOOKAHS, BOWLS, BOWL_GRAMS, HEATS, DRAWS, STRENGTHS, CHECKLISTS, TAGS,
    ymd, dmy, fromYmd, daysBetween, shiftDate, inventoryDue,
    sortedInv, currentStock, usage, suggestOrder,
    profile, defaultBrandStrength, recommendMix, autoBowl, autoHeat, orderText,
  };
})(typeof window !== 'undefined' ? window : globalThis);
