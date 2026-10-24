import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export interface SearchHadithItem {
  id: number;
  book: string;
  num: number | string;
  chapter: string;
  grade: 'Sahih' | 'Hasan';
  grader: string;
  also?: string[];
  ar: string;
  arFull: string;
  en?: string;
  c?: Array<{ scholar: string; text: string; full: string; verified: boolean }>;
}

let cachedCorpus: SearchHadithItem[] | null = null;
let isLoadingCorpus = false;

function stripArabic(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[أإآٱء]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[،؛؟«»"'.!?:;()[\]{}\-\/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function loadCorpus(): SearchHadithItem[] {
  if (cachedCorpus) return cachedCorpus;
  if (isLoadingCorpus) return [];

  isLoadingCorpus = true;
  const items: SearchHadithItem[] = [];
  const files = [
    'canonical_core.json',
    'bukhari_all.json',
    'muslim_all.json',
    'abudawud_all.json',
    'tirmidhi_all.json',
    'nasai_all.json',
    'ibnmajah_all.json'
  ];

  // Try multiple root locations (dev server vs vercel runtime)
  const candidateDirs = [
    path.join(process.cwd(), 'public', 'data'),
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'dist', 'data')
  ];

  let resolvedDir = '';
  for (const dir of candidateDirs) {
    if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'canonical_core.json'))) {
      resolvedDir = dir;
      break;
    }
  }

  if (!resolvedDir) {
    resolvedDir = path.join(process.cwd(), 'public', 'data');
  }

  const seenKeys = new Set<string>();

  for (const f of files) {
    const fullPath = path.join(resolvedDir, f);
    if (fs.existsSync(fullPath)) {
      try {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const it of list) {
            const key = `${it.book}_${it.num}`;
            if (!seenKeys.has(key) && (it.ar || it.arFull || it.en)) {
              seenKeys.add(key);
              items.push({
                id: it.id || items.length + 1,
                book: it.book || 'Unknown Book',
                num: it.num ?? items.length + 1,
                chapter: it.chapter || 'General',
                grade: it.grade === 'Hasan' ? 'Hasan' : 'Sahih',
                grader: it.grader || 'Consensus',
                also: it.also || [],
                ar: it.ar || it.arFull?.slice(0, 150) || '',
                arFull: it.arFull || it.ar || '',
                en: it.en || '',
                c: it.c || []
              });
            }
          }
        }
      } catch (e) {
        console.warn(`[Search Engine] Error loading ${f}:`, e);
      }
    }
  }

  cachedCorpus = items;
  isLoadingCorpus = false;
  console.log(`[Search Engine] Indexed ${items.length} canonical hadiths into memory.`);
  return items;
}

// Comprehensive Semantic Dictionary: Maps English topics/concepts to authentic Arabic search roots
const CONCEPT_DICTIONARY: Record<string, string[]> = {
  // Eminent Sahabah & Personalities
  khalid: ["خالد بن الوليد", "سيف الله", "سيف من سيوف الله"],
  abu_bakr: ["ابو بكر", "الصديق", "عتيق"],
  umar: ["عمر بن الخطاب", "ابن الخطاب", "الفاروق"],
  uthman: ["عثمان بن عفان", "ابن عفان", "ذي النورين"],
  ali: ["علي بن ابي طالب", "ابن ابي طالب", "حيدرة"],
  aisha: ["عائشه", "ام المؤمنين"],
  fatima: ["فاطمه", "سيده نساء"],
  bilal: ["بلال بن رباح", "المؤذن"],
  abu_hurairah: ["ابو هريره", "عبد الرحمن بن صخر"],
  ibn_abbas: ["ابن عباس", "حبر الامه"],
  ibn_umar: ["ابن عمر"],
  anas: ["انس بن مالك"],
  muadh: ["معاذ بن جبل"],
  salman: ["سلمان الفارسي"],
  zubayr: ["الزبير بن العوام"],
  talha: ["طلحه بن عبيد الله"],
  saad: ["سعد بن ابي وقاص"],
  mahdi: ["المهدي", "مهدي", "عترتي", "اهل بيتي", "ولد فاطمه", "يملا الارض قسطا"],
  dajjal: ["الدجال", "دجال", "المسيح الدجال", "اعور"],
  isa: ["عيسي", "ابن مريم", "نزول عيسي"],
  jesus: ["عيسي", "ابن مريم"],
  moses: ["موسي", "كليم الله", "هارون وموسي", "هارون من موسي", "اخي هارون"],
  musa: ["موسي", "كليم الله", "هارون وموسي", "هارون من موسي", "اخي هارون"],
  haroon: ["هارون", "هارون من موسي", "هارون وموسي", "اخي هارون", "منزله هارون", "يا اخت هارون"],
  harun: ["هارون", "هارون من موسي", "هارون وموسي", "اخي هارون", "منزله هارون", "يا اخت هارون"],
  aaron: ["هارون", "هارون من موسي", "هارون وموسي", "اخي هارون", "منزله هارون"],
  abraham: ["ابراهيم", "خليل الله"],
  ibrahim: ["ابراهيم"],
  gabriel: ["جبريل", "الروح الامين"],
  jibril: ["جبريل"],

  // Animals & Nature
  camel: ["جمل", "ناقه", "بعير", "ابل", "ركاب"],
  horse: ["فرس", "خيل", "حصان", "جياد"],
  dog: ["كلب", "كلاب"],
  cat: ["هره", "قط"],
  sheep: ["شاه", "غنم"],
  goat: ["ماعز", "تيس"],
  bird: ["طير", "طائر", "عصفور"],
  water: ["ماء", "الماء", "سقيا", "شرب", "نهر", "بئر"],
  tree: ["شجر", "شجره", "نخل", "نخله"],

  // Virtues, Character & Actions
  smile: ["تبسم", "يبتسم", "ضحك", "يضحك", "بشاشه"],
  smiling: ["تبسم", "يبتسم", "ضحك"],
  laugh: ["ضحك", "يضحك", "تبسم"],
  mercy: ["رحمه", "يرحم", "الراحمون", "ارحموا"],
  merciful: ["رحيم", "يرحم", "الراحمون"],
  patience: ["صبر", "الصبر", "صابر", "يصبر"],
  truth: ["صدق", "صادق", "الصدق"],
  honest: ["امين", "صدوق", "صدق"],
  lie: ["كذب", "كاذب", "الكذب", "يكذب"],
  falsehood: ["باطل", "كذب", "زور"],
  anger: ["غضب", "يغضب", "لا تغضب"],
  angry: ["غضب", "غضبان"],
  neighbor: ["جار", "الجار", "جاره", "جيران"],
  parents: ["والدين", "والد", "بر الوالدين", "امه", "ابيه"],
  mother: ["ام", "امه", "الام", "والدتك"],
  father: ["اب", "ابوه", "الاب", "والدك"],
  charity: ["صدقه", "زكاه", "انفق", "ينفق", "اطعام"],
  sadaqah: ["صدقه", "تصدق"],
  intention: ["نيه", "النيات", "اخلاص", "انوي"],
  sincerity: ["اخلاص", "مخلص", "نصيحه"],
  forgiveness: ["استغفار", "توبه", "يغفر", "غفران", "عفو"],
  repentance: ["توبه", "تائب", "يتوب", "استغفار"],
  modesty: ["حياء", "الحياء", "عفه"],
  peace: ["سلام", "السلام", "افشوا السلام"],
  justice: ["عدل", "قسط", "انصاف"],
  injustice: ["ظلم", "الظلم", "ظالم", "مظلوم"],
  oppression: ["ظلم", "بغي"],
  arrogance: ["كبر", "تكبر", "خيلاء", "بطر"],
  humility: ["تواضع", "يتواضع"],

  // Worship & Pillars
  prayer: ["صلاه", "يصلي", "سجود", "ركوع", "الصلوات"],
  salah: ["صلاه", "صلوا"],
  salat: ["صلاه"],
  wudu: ["وضوء", "توضا", "طهور", "طهاره"],
  ablution: ["وضوء", "توضا", "طهور"],
  purification: ["طهاره", "طهور", "نظافه", "غسل"],
  fasting: ["صوم", "صيام", "صائم", "يصوم", "سحور", "افطار"],
  fast: ["صوم", "صيام"],
  ramadan: ["رمضان", "شهر رمضان", "ليله القدر"],
  zakat: ["زكاه", "الزكاه", "صدقه الفطر"],
  hajj: ["حج", "الحج", "عمره", "عرفات", "طواف"],
  pilgrimage: ["حج", "عمره", "احرام"],
  umrah: ["عمره", "المعتمر"],
  tahajjud: ["تهجد", "قيام الليل", "وتر"],
  quran: ["قران", "القران", "يتلو", "ايه", "سوره"],
  dua: ["دعاء", "يدعو", "استجاب", "سل"],
  supplication: ["دعاء", "ابتهال"],
  dhikr: ["ذكر", "تسبيح", "تهليل", "تكبير", "سبحان الله"],
  adhan: ["اذان", "المؤذن", "نودي للصلاه"],
  mosque: ["مسجد", "مساجد", "بيت الله"],
  masjid: ["مسجد", "مساجد"],
  funeral: ["جنازه", "جنائز", "دفن", "كفن"],
  grave: ["قبر", "القبور", "لحد"],
  death: ["موت", "ميت", "يموت", "وفاه"],

  // Creed & Hereafter
  paradise: ["جنه", "الجنه", "الفردوس", "نعيم"],
  heaven: ["جنه", "سماء"],
  jannah: ["جنه", "الجنه"],
  hell: ["نار", "النار", "جهنم", "سعير", "عذاب"],
  hellfire: ["نار", "جهنم"],
  jahannam: ["جهنم", "النار"],
  faith: ["ايمان", "مؤمن", "توحيد", "عقيده"],
  belief: ["ايمان", "يؤمن"],
  tawhid: ["توحيد", "لا اله الا الله", "وحده"],
  resurrection: ["قيامه", "البعث", "الحشر", "الساعه"],
  qiyamah: ["قيامه", "الساعه"],
  destiny: ["قدر", "القدر", "مكتوب"],
  sin: ["ذنب", "ذنوب", "خطيئه", "معصيه"],

  // Transactions & Life
  food: ["طعام", "اكل", "ياكل", "وليمه"],
  eat: ["اكل", "طعام"],
  drink: ["شراب", "يشرب", "سقيا"],
  marriage: ["نكاح", "تزويج", "زواج", "عروس", "خطبه"],
  nikah: ["نكاح", "تزويج"],
  divorce: ["طلاق", "طلقه"],
  trade: ["بيع", "تجاره", "شراء", "سوق"],
  business: ["تجاره", "بيع"],
  debt: ["دين", "يقضي", "غريم"],
  interest: ["ربا", "الربا"],
  sick: ["مريض", "مرض", "عياده المريض"],
  cure: ["شفاء", "دواء", "تداووا"],
  medicine: ["طب", "دواء", "حجامه", "عسل", "حبه سوداء"],
  ruqyah: ["رقيه", "استرقي"],
  dream: ["رويا", "منام", "حلم"],
  vision: ["رويا", "بشري"],
  sleep: ["نوم", "ينام", "اضطجع"],
  travel: ["سفر", "مسافر"],
  journey: ["سفر", "رحله"],
  knowledge: ["علم", "طلب العلم", "علماء", "يتعلم"]
};

export function searchCorpus(query: string, bookFilter?: string, gradeFilter?: string, limit: number = 40): SearchHadithItem[] {
  const corpus = loadCorpus();
  const qRaw = (query || '').trim();
  if (!qRaw) {
    return corpus.filter(h => {
      if (bookFilter && h.book !== bookFilter) return false;
      if (gradeFilter && h.grade !== gradeFilter) return false;
      return true;
    }).slice(0, limit);
  }

  const qClean = qRaw.toLowerCase();
  const qArabic = stripArabic(qRaw);
  const tokens = qArabic.split(/\s+/).filter(Boolean);
  const qNumeric = qClean.replace(/^[#№no.\s]+/i, '');

  // Extract matching concept keywords
  const matchedArabicRoots: string[] = [];
  for (const [key, roots] of Object.entries(CONCEPT_DICTIONARY)) {
    const keyClean = key.replace(/_/g, ' ');
    if (qClean.includes(keyClean) || keyClean.includes(qClean)) {
      matchedArabicRoots.push(...roots);
    }
  }

  const matches: { item: SearchHadithItem; score: number }[] = [];

  for (const h of corpus) {
    if (bookFilter && h.book.toLowerCase() !== bookFilter.toLowerCase()) continue;
    if (gradeFilter && h.grade.toLowerCase() !== gradeFilter.toLowerCase()) continue;

    const numStr = String(h.num || '').toLowerCase();
    const bookStr = h.book.toLowerCase();
    const chapStr = h.chapter.toLowerCase();
    const enStr = (h.en || '').toLowerCase();
    const arClean = stripArabic(h.ar || '');
    const arFullClean = stripArabic(h.arFull || '');
    const commStr = (h.c || []).map(x => `${x.scholar} ${x.text} ${x.full}`).join(' ').toLowerCase();

    let score = 0;

    // 1. Exact Hadith Number Match
    if (qNumeric && numStr === qNumeric) {
      score += 180;
    }

    // 2. Direct Arabic query match
    if (arClean.includes(qArabic)) {
      score += 120;
    } else if (arFullClean.includes(qArabic)) {
      score += 90;
    }

    // 3. Direct English text match
    if (enStr.includes(qClean)) {
      score += 110;
    }

    // 4. Chapter or Commentary match
    if (chapStr.includes(qClean)) {
      score += 70;
    }
    if (commStr.includes(qClean)) {
      score += 50;
    }

    // 5. Semantic Dictionary match (Bridges English search terms into authentic Arabic corpus)
    if (matchedArabicRoots.length > 0) {
      let rootHits = 0;
      for (const root of matchedArabicRoots) {
        if (arClean.includes(root)) {
          score += 85;
          rootHits++;
          if (rootHits >= 2) break;
        } else if (arFullClean.includes(root)) {
          score += 65;
          rootHits++;
          if (rootHits >= 2) break;
        }
      }
    }

    // 5b. Prioritize Prophetic Brotherhood of Harun & Musa (Aaron & Moses)
    const isHarunQuery = qClean.includes('haroon') || qClean.includes('harun') || qClean.includes('aaron');
    const hasHarunInMatn = arClean.includes('هارون') || arFullClean.includes('هارون');
    const hasMusaInMatn = arClean.includes('موسي') || arFullClean.includes('موسي') || arClean.includes('موسى') || arFullClean.includes('موسى');
    
    if (isHarunQuery && hasHarunInMatn && hasMusaInMatn) {
      score += 300; // Strongest boost for narrations of Harun, the brother of Moses
    } else if (isHarunQuery && (arClean.includes('بمنزله هارون') || arFullClean.includes('بمنزله هارون') || arClean.includes('يا اخت هارون') || arFullClean.includes('يا اخت هارون'))) {
      score += 350;
    }

    // 6. Multi-token match across all fields
    if (tokens.length > 1) {
      const combined = `${bookStr} ${numStr} ${chapStr} ${enStr} ${commStr} ${arClean} ${arFullClean}`;
      const allTokensMatch = tokens.every(tok => combined.includes(tok));
      if (allTokensMatch) {
        score += 75;
      }
    }

    if (score > 0) {
      matches.push({ item: h, score });
    }
  }

  // Sort by highest relevance score
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, limit).map(m => m.item);
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const book = typeof req.query.book === 'string' ? req.query.book : undefined;
    const grade = typeof req.query.grade === 'string' ? req.query.grade : undefined;
    const limit = Math.min(100, Math.max(1, parseInt(typeof req.query.limit === 'string' ? req.query.limit : '40', 10) || 40));

    const results = searchCorpus(q, book, grade, limit);
    const totalCorpus = cachedCorpus ? cachedCorpus.length : 31945;

    return res.status(200).json({
      query: q,
      totalMatches: results.length,
      corpusSize: totalCorpus,
      hadiths: results
    });
  } catch (err: any) {
    console.error('[Search API Error]:', err);
    return res.status(500).json({ error: err.message || 'Internal search engine error' });
  }
}
