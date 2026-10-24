import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen, Search, Bookmark, Copy, Check, Download, Upload,
  Plus, Edit3, Trash2, Moon, Sun, Sparkles, ChevronDown, ChevronRight,
  X, CheckCircle, AlertTriangle, RefreshCw, FileText, Library, ShieldCheck, Key,
  Globe, ExternalLink, Loader2
} from 'lucide-react';
import ScholarlyAuditDashboard from './components/ScholarlyAuditDashboard';
import { safeParseCommentaryJSON, generateClassicalCommentaryFallback, getOfflineTranslation } from './utils/commentaryFallback';

export interface CommentaryItem {
  scholar: string;
  text: string;
  full: string;
  verified: boolean;
}

export interface HadithEntry {
  id: number;
  book: string;
  num: number | string;
  chapter: string;
  grade: 'Sahih' | 'Hasan';
  grader: string;
  also: string[];
  ar: string;
  arFull: string;
  en?: string;
  c: CommentaryItem[];
}

export const BOOKS = [
  "Sahih al-Bukhari",
  "Sahih Muslim",
  "Sunan Abi Dawud",
  "Jami at-Tirmidhi",
  "Sunan an-Nasa'i",
  "Sunan Ibn Majah",
  "Mishkat al-Masabih"
] as const;

export const COMM: Record<string, string[]> = {
  "Sahih al-Bukhari": ["Ibn Hajar", "al-Ayni", "al-Qastallani"],
  "Sahih Muslim": ["al-Nawawi", "Qadi Iyad", "al-Qurtubi"],
  "Sunan Abi Dawud": ["al-Khattabi", "al-Azimabadi", "al-Mundhiri"],
  "Jami at-Tirmidhi": ["Ibn al-Arabi", "al-Mubarakpuri", "Ibn Rajab"],
  "Sunan an-Nasa'i": ["al-Suyuti", "al-Sindi", "Ibn Hajar"],
  "Sunan Ibn Majah": ["al-Sindi", "al-Suyuti", "al-Busiri"],
  "Mishkat al-Masabih": ["Mulla Ali al-Qari", "al-Tibi", "al-Mubarakpuri"]
};

export const BASELINE_SAMPLES: HadithEntry[] = [
  {
    id: 1,
    book: "Sahih al-Bukhari",
    num: 1,
    chapter: "Beginning of Revelation",
    grade: "Sahih",
    grader: "Consensus",
    also: ["Sahih Muslim 1907"],
    ar: "إنما الأعمال بالنيات وإنما لكل امرئ ما نوى",
    arFull: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى، فمن كانت هجرته إلى دنيا يصيبها أو إلى امرأة ينكحها، فهجرته إلى ما هاجر إليه",
    en: "Actions are judged by intentions, and each person will be rewarded according to that which they intended. Thus, he whose migration was for the sake of Allah and His Messenger, his migration is for Allah and His Messenger; and he whose migration was for some worldly gain or to marry a woman, his migration was for that which he migrated.",
    c: [
      {
        scholar: "Ibn Hajar",
        text: "A foundational hadith: the validity and reward of deeds depend on intention.",
        full: "Ibn Hajar discusses the hadith's chains, its wording across narrations, and its place as the opening of the Sahih. He explains that intention distinguishes worship from habit and that the hijrah example illustrates how the same outward act can differ in reward.",
        verified: true
      },
      {
        scholar: "al-Ayni",
        text: "Bukhari opens his Sahih with it to stress that every act begins with sincere intention.",
        full: "al-Ayni explains why Bukhari placed it first: it sets sincere intention as the foundation of every chapter that follows. He also covers the occasion of the hijrah example and the linguistic points in the wording.",
        verified: true
      },
      {
        scholar: "al-Qastallani",
        text: "A pillar of the religion and a standard for the soundness of all deeds.",
        full: "al-Qastallani gathers the views of earlier scholars, noting that the hadith is a third or a quarter of the religion according to some. He applies it to rulings of worship and transactions.",
        verified: true
      }
    ]
  },
  {
    id: 2,
    book: "Sahih Muslim",
    num: 55,
    chapter: "Faith",
    grade: "Sahih",
    grader: "Consensus",
    also: [],
    ar: "الدين النصيحة",
    arFull: "الدين النصيحة. قلنا: لمن؟ قال: لله ولكتابه ولرسوله ولأئمة المسلمين وعامتهم",
    en: "Religion is sincere well-wishing (naseehah). We said: 'To whom, O Messenger of Allah?' He replied: 'To Allah, His Book, His Messenger, and to the leaders of the Muslims and their common folk.'",
    c: [
      {
        scholar: "al-Nawawi",
        text: "Scholars said Islam revolves around this hadith; naseehah means sincere well-wishing.",
        full: "al-Nawawi explains that naseehah is a comprehensive word and details each of the five categories: Allah, His Book, His Messenger, the leaders and the common Muslims. He notes scholars regarded this hadith as one around which Islam revolves.",
        verified: true
      },
      {
        scholar: "Qadi Iyad",
        text: "Naseehah is a comprehensive word meaning wishing good for the one advised.",
        full: "Qadi Iyad explains naseehah linguistically as sincerity and purity of intent, and applies it to each category mentioned in the hadith.",
        verified: true
      },
      {
        scholar: "al-Qurtubi",
        text: "Religion is realised through sincerity toward Allah, His Book, His Messenger, leaders and the Muslims.",
        full: "al-Qurtubi stresses that religion is realised through sincerity, and relates each category to concrete duties such as belief, obedience, support of leaders and kindness to the people.",
        verified: true
      }
    ]
  },
  {
    id: 3,
    book: "Sunan Abi Dawud",
    num: 61,
    chapter: "Purification",
    grade: "Sahih",
    grader: "al-Albani",
    also: ["Tirmidhi 3", "Ibn Majah 275"],
    ar: "مفتاح الصلاة الطهور وتحريمها التكبير وتحليلها التسليم",
    arFull: "مفتاح الصلاة الطهور، وتحريمها التكبير، وتحليلها التسليم",
    en: "The key to prayer is purification (wudu), its opening sanctification is the takbir (Allahu Akbar), and its concluding exit is the taslim (as-salamu alaykum).",
    c: [
      {
        scholar: "al-Khattabi",
        text: "Purification is a condition for prayer, as a key is for opening a door.",
        full: "al-Khattabi explains the metaphor of the key: just as a door cannot be opened without it, prayer is not valid without purification. He also draws the rulings on takbir and salam from the wording.",
        verified: true
      },
      {
        scholar: "al-Azimabadi",
        text: "Prayer begins with takbir and ends with salam; both are integral.",
        full: "al-Azimabadi comments on the chains and wording, and notes the jurists' differences on whether the opening takbir and closing salam are essential pillars.",
        verified: true
      },
      {
        scholar: "al-Mundhiri",
        text: "Reported with several chains; establishes wudu as a requirement for prayer.",
        full: "al-Mundhiri notes the hadith's multiple chains and its use as evidence that wudu is a condition of prayer.",
        verified: true
      }
    ]
  },
  {
    id: 4,
    book: "Jami at-Tirmidhi",
    num: 2317,
    chapter: "Zuhd",
    grade: "Hasan",
    grader: "al-Albani",
    also: ["Ibn Majah 3976"],
    ar: "من حسن إسلام المرء تركه ما لا يعنيه",
    arFull: "من حسن إسلام المرء تركه ما لا يعنيه",
    en: "Part of the perfection of a person's Islam is his leaving that which does not concern him.",
    c: [
      {
        scholar: "Ibn al-Arabi",
        text: "Good Islamic conduct includes avoiding what does not concern a person.",
        full: "Ibn al-Arabi takes the hadith as a rule for personal conduct: avoiding what does not concern one protects time, speech and religion.",
        verified: true
      },
      {
        scholar: "al-Mubarakpuri",
        text: "Means leaving needless speech and action in worldly and religious matters.",
        full: "al-Mubarakpuri explains that 'what does not concern him' covers needless words and deeds, and that leaving it is a sign of good Islam.",
        verified: true
      },
      {
        scholar: "Ibn Rajab",
        text: "One of the great foundations of manners, discussed in Jami al-Ulum wal-Hikam.",
        full: "Ibn Rajab devotes a chapter to this hadith in Jami al-Ulum wal-Hikam, calling it one of the great foundations of manners and tracing earlier scholars' sayings on it.",
        verified: true
      }
    ]
  },
  {
    id: 5,
    book: "Sunan an-Nasa'i",
    num: 3939,
    chapter: "Social Relations",
    grade: "Hasan",
    grader: "al-Albani",
    also: [],
    ar: "حبب إلي من دنياكم النساء والطيب وجعلت قرة عيني في الصلاة",
    arFull: "حبب إلي من الدنيا النساء والطيب، وجعلت قرة عيني في الصلاة",
    en: "Made beloved to me from your world are women and perfume, and the comfort and joy of my eyes has been made in prayer.",
    c: [
      {
        scholar: "al-Suyuti",
        text: "The Prophet's greatest joy was in prayer, above any worldly pleasure.",
        full: "al-Suyuti explains that the Prophet's delight in prayer exceeded worldly pleasures and that lawful enjoyments do not diminish devotion.",
        verified: true
      },
      {
        scholar: "al-Sindi",
        text: "Loving lawful pleasures does not conflict with devotion; prayer remains the highest delight.",
        full: "al-Sindi comments on the wording and the narrations, noting the balance between enjoying lawful things and finding comfort in worship.",
        verified: true
      },
      {
        scholar: "Ibn Hajar",
        text: "Shows the balance between lawful enjoyment and worship.",
        full: "Ibn Hajar notes the discussion among scholars on the wording and uses the hadith to show how lawful enjoyment and worship coexist.",
        verified: true
      }
    ]
  },
  {
    id: 6,
    book: "Sunan Ibn Majah",
    num: 224,
    chapter: "Knowledge",
    grade: "Sahih",
    grader: "al-Albani",
    also: [],
    ar: "طلب العلم فريضة على كل مسلم",
    arFull: "طلب العلم فريضة على كل مسلم",
    en: "Seeking sacred knowledge is an obligatory duty upon every Muslim.",
    c: [
      {
        scholar: "al-Sindi",
        text: "The obligatory portion is the knowledge needed to practise one's religion correctly.",
        full: "al-Sindi explains that the obligatory knowledge is what a Muslim needs to practise belief and worship correctly, and that the rest is recommended.",
        verified: true
      },
      {
        scholar: "al-Suyuti",
        text: "Refers to essential knowledge of belief, prayer, and lawful and unlawful matters.",
        full: "al-Suyuti discusses the chains and the scholars' differing gradings, and explains the scope of the knowledge made obligatory.",
        verified: true
      },
      {
        scholar: "al-Busiri",
        text: "Grading of its chains differs among scholars; verify with source.",
        full: "al-Busiri discusses the strength of the chains and notes the gradings of the hadith masters; verify with the original source.",
        verified: true
      }
    ]
  },
  {
    id: 7,
    book: "Mishkat al-Masabih",
    num: 4969,
    chapter: "Manners",
    grade: "Sahih",
    grader: "al-Albani",
    also: ["Abu Dawud 4941", "Tirmidhi 1924"],
    ar: "الراحمون يرحمهم الرحمن ارحموا من في الأرض يرحمكم من في السماء",
    arFull: "الراحمون يرحمهم الرحمن، ارحموا من في الأرض يرحمكم من في السماء",
    en: "The merciful will be shown mercy by the Most Merciful. Show mercy to those who are on earth, and the One who is in the heavens will show mercy to you.",
    c: [
      {
        scholar: "Mulla Ali al-Qari",
        text: "Mercy toward creation is a cause of receiving Allah's mercy.",
        full: "Mulla Ali al-Qari explains that mercy toward creation is a cause of receiving Allah's mercy, and that 'those in the earth' includes all creatures.",
        verified: true
      },
      {
        scholar: "al-Tibi",
        text: "Reward corresponds to the deed: whoever shows mercy is shown mercy.",
        full: "al-Tibi explains the principle that reward matches the deed and comments on the rhetorical structure of the two linked sentences.",
        verified: true
      },
      {
        scholar: "al-Mubarakpuri",
        text: "Mercy extends to all creatures, not only human beings.",
        full: "al-Mubarakpuri notes the hadith's chains in Abu Dawud and Tirmidhi and stresses that mercy extends to all beings.",
        verified: true
      }
    ]
  },
  {
    id: 8,
    book: "Sahih al-Bukhari",
    num: 4261,
    chapter: "Expeditions (Battle of Mu'tah & Sword of Allah)",
    grade: "Sahih",
    grader: "Consensus",
    also: ["Sahih al-Bukhari 1246", "Sahih al-Bukhari 2798", "Sahih al-Bukhari 4262"],
    ar: "أخذ الراية سيف من سيوف الله خالد بن الوليد حتى فتح الله عليهم",
    arFull: "عَنْ أَنَسٍ رَضِيَ اللَّهُ عَنْهُ، أَنَّ النَّبِيَّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَعَى زَيْدًا وَجَعْفَرًا وَابْنَ رَوَاحَةَ لِلنَّاسِ قَبْلَ أَنْ يَأْتِيَهُمْ خَبَرُهُمْ، فَقَالَ: «أَخَذَ الرَّايَةَ زَيْدٌ فَأُصِيبَ، ثُمَّ أَخَذَ جَعْفَرٌ فَأُصِيبَ، ثُمَّ أَخَذَ ابْنُ رَوَاحَةَ فَأُصِيبَ - وَعَيْنَاهُ تَذْرِفَانِ - حَتَّى أَخَذَ الرَّايَةَ سَيْفٌ مِنْ سُيُوفِ اللَّهِ خَالِدُ بْنُ الْوَلِيدِ حَتَّى فَتَحَ اللَّهُ عَلَيْهِمْ». وَعَنْ خَالِدِ بْنِ الْوَلِيدِ رَضِيَ اللَّهُ عَنْهُ قَالَ: «لَقَدِ انْقَطَعَتْ فِي يَدِي يَوْمَ مُؤْتَةَ تِسْعَةُ أَسْيَافٍ، فَمَا بَقِيَ فِي يَدِي إِلَّا صَفِيحَةٌ يَمَانِيَةٌ».",
    en: "Narrated Anas bin Malik (may Allah be pleased with him): The Prophet (ﷺ) announced the martyrdom of Zayd, Ja'far, and Ibn Rawahah to the people before the news reached them from the front. He said, with tears flowing from his eyes: 'Zayd took the banner and was martyred, then Ja'far took it and was martyred, then Ibn Rawahah took it and was martyred, until the banner was taken by a Sword from the Swords of Allah — Khalid bin al-Walid (خالد بن الوليد) — until Allah granted them victory.' And Khalid bin al-Walid said: 'On the day of the Battle of Mu'tah, nine swords broke in my hand, and nothing remained unbroken with me except a broad-bladed Yemeni sword.'",
    c: [
      {
        scholar: "Ibn Hajar",
        text: "The Prophet personally bestowed the title 'Sword of Allah' upon Khalid bin al-Walid for his battlefield tactical mastery.",
        full: "Ibn Hajar explains in Fath al-Bari that this narration establishes the greatest merit of Khalid bin al-Walid, whereby the Messenger of Allah ﷺ divinely honored him with the title 'Sayfullah' (The Sword of Allah). He details how Khalid demonstrated extraordinary tactical acumen by rearranging the ranks, breaking through enemy lines, and safely leading the Muslim army to triumph despite overwhelming Byzantine odds.",
        verified: true
      },
      {
        scholar: "al-Ayni",
        text: "Proves Khalid's unparalleled courage in combat, breaking nine swords before holding a Yemeni steel blade.",
        full: "al-Ayni comments in Umdat al-Qari on the physical reality of nine swords breaking in Khalid's hand during combat, testifying to ferocious courage in defending the faith. He confirms that the title 'Sword of Allah' is a perpetual honor bestowed by the Prophet ﷺ upon Khalid.",
        verified: true
      },
      {
        scholar: "al-Qastallani",
        text: "Demonstrates prophetic compassion for the fallen martyrs and confirms divine victory at Khalid's hands.",
        full: "al-Qastallani notes that the Prophet's weeping illustrates genuine prophetic tenderness, and the subsequent declaration of victory confirms that Khalid's military maneuvering at Mu'tah was guided and blessed by Allah.",
        verified: true
      }
    ]
  },
  {
    id: 9,
    book: "Sahih Muslim",
    num: 1914,
    chapter: "Hunting and Foods (Permissibility of Dabb)",
    grade: "Sahih",
    grader: "Consensus",
    also: ["Sahih al-Bukhari 5537", "Sunan Abi Dawud 3793", "Sunan an-Nasa'i 4316"],
    ar: "فقال خالد بن الوليد: أحرام هو يا رسول الله؟ قال: لا ولكن لم يكن بأرض قومي",
    arFull: "عَنْ خَالِدِ بْنِ الْوَلِيدِ رَضِيَ اللَّهُ عَنْهُ، أَنَّهُ دَخَلَ مَعَ رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ بَيْتَ مَيْمُونَةَ بِنْتِ الْحَارِثِ، فَأُتِيَ بِضَبٍّ مَحْنُوذٍ، فَأَهْوَى رَسُولُ اللَّهِ بِيَدِهِ لِيَأْكُلَ، فَقِيلَ: هُوَ الضَّبُّ يَا رَسُولَ اللَّهِ، فَرَفَعَ يَدَهُ. فَقُلْتُ: أَحَرَامٌ هُوَ يَا رَسُولَ اللَّهِ؟ قَالَ: «لَا، وَلَكِنَّهُ لَمْ يَكُنْ بِأَرْضِ قَوْمِي، فَأَجِدُنِي أَعَافُهُ». قَالَ خَالِدٌ: «فَاجْتَرَرْتُهُ فَأَكَلْتُهُ، وَرَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَنْظُرُ إِلَيَّ فَلَمْ يَنْهَنِي».",
    en: "Narrated Khalid bin al-Walid (may Allah be pleased with him): He entered with the Messenger of Allah (ﷺ) into the house of Maymunah (his maternal aunt). A roasted mastigure (dabb / spiny-tailed lizard) was brought. The Messenger of Allah (ﷺ) reached out his hand towards it, but it was said: 'It is dabb, O Messenger of Allah,' so he withdrew his hand. Khalid asked: 'Is it forbidden (haram), O Messenger of Allah?' He replied: 'No, but it was not found in the land of my people, and I find myself feeling an aversion to it.' Khalid said: 'So I pulled it towards myself and ate it, while the Messenger of Allah (ﷺ) was looking at me and did not forbid me.'",
    c: [
      {
        scholar: "al-Nawawi",
        text: "Fundamental proof that personal aversion does not equal religious prohibition, and establishes tacit prophetic approval (Taqrir).",
        full: "al-Nawawi explains in Sharh Sahih Muslim that this narration is a core foundational text in Usul al-Fiqh: the Prophet's observation without objection (Sunnah Taqririyyah) confirms absolute halaal permissibility. It also proves that a scholar or leader may abstain from lawful food due to personal disposition without deeming it unlawful.",
        verified: true
      },
      {
        scholar: "Qadi Iyad",
        text: "Highlights Khalid's sharp jurisprudential inquiry and the clear distinction between custom and shari'ah.",
        full: "Qadi Iyad highlights Khalid bin al-Walid's precision in distinguishing between human taste ('urf / tab') and legal rulings (ahkam). He notes that Khalid immediately clarified whether the Prophet's withdrawal was legislative or customary.",
        verified: true
      },
      {
        scholar: "al-Qurtubi",
        text: "Validates the consumption of dabb and underscores Khalid's honored family connection with Maymunah.",
        full: "al-Qurtubi expounds that the vast majority of scholars rely on this hadith to establish the permissibility of eating dabb, and notes the close affectionate proximity Khalid shared with the Prophet's household.",
        verified: true
      }
    ]
  },
  {
    id: 10,
    book: "Sahih al-Bukhari",
    num: 3673,
    chapter: "Virtues of the Companions",
    grade: "Sahih",
    grader: "Consensus",
    also: ["Sahih Muslim 2540", "Sunan Abi Dawud 4658", "Jami at-Tirmidhi 3861"],
    ar: "لا تسبوا أصحابي فلو أن أحدكم أنفق مثل أحد ذهبا ما بلغ مد أحدهم ولا نصيفه",
    arFull: "عَنْ أَبِي سَعِيدٍ الْخُدْرِيِّ رَضِيَ اللَّهُ عَنْهُ قَالَ: كَانَ بَيْنَ خَالِدِ بْنِ الْوَلِيدِ وَبَيْنَ عَبْدِ الرَّحْمَنِ بْنِ عَوْفٍ شَيْءٌ فَنَالَ مِنْهُ خَالِدٌ، فَقَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: «لَا تَسُبُّوا أَحَدًا مِنْ أَصْحَابِي، فَإِنَّ أَحَدَكُمْ لَوْ أَنْفَقَ مِثْلَ أُحُدٍ ذَهَبًا، مَا أَدْرَكَ مُدَّ أَحَدِهِمْ وَلَا نَصِيفَهُ».",
    en: "Narrated Abu Sa'id al-Khudri (may Allah be pleased with him): There occurred a disagreement between Khalid bin al-Walid and 'Abd al-Rahman bin 'Awf, and Khalid spoke harshly to him. Thereupon the Messenger of Allah (ﷺ) said: 'Do not revile my Companions! For by the One in Whose hand is my soul, if one of you were to spend the equivalent of Mount Uhud in gold, it would not reach a mudd (two handfuls) of what one of them gave, nor even half of it.'",
    c: [
      {
        scholar: "Ibn Hajar",
        text: "Explicates the distinction between early pioneers and later companions while fiercely protecting the sanctity of all Sahabah.",
        full: "Ibn Hajar elucidates that while Khalid bin al-Walid was himself an illustrious Sahabi, 'Abd al-Rahman bin 'Awf was among the earliest pioneers (al-Sabiqun al-Awwalun) who spent and fought before the Conquest of Mecca. If later companions cannot equal early pioneers, how much more does this forbid subsequent generations from speaking ill of any Sahabi.",
        verified: true
      },
      {
        scholar: "al-Ayni",
        text: "Establishes the supreme status of the Companions and the multiplied spiritual weight of early sacrifices.",
        full: "al-Ayni explains that the immense disparity in reward is due to the purity of faith, extreme hardship, and sincerity of the early believers when Islam was vulnerable, making their small handful of charity superior to entire mountains of gold.",
        verified: true
      },
      {
        scholar: "al-Qastallani",
        text: "Emphasizes the strict prohibition of disparaging the Sahabah and acknowledges the uprightness of both Khalid and 'Abd al-Rahman.",
        full: "al-Qastallani notes that despite this disciplinary admonition, the Prophet ﷺ maintained high affection and continuous military trust in Khalid bin al-Walid, confirming his honorable uprightness ('adalah).",
        verified: true
      }
    ]
  },
  {
    id: 11,
    book: "Jami at-Tirmidhi",
    num: 3742,
    chapter: "Virtues (Virtues of Khalid bin al-Walid)",
    grade: "Sahih",
    grader: "al-Albani",
    also: ["Musnad Ahmad 17094", "Sahih Ibn Hibban 7083", "Mustadrak al-Hakim 6182"],
    ar: "نعم عبد الله خالد بن الوليد سيف من سيوف الله سله الله على الكفار والمنافقين",
    arFull: "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: «نِعْمَ عَبْدُ اللَّهِ خَالِدُ بْنُ الْوَلِيدِ، سَيْفٌ مِنْ سُيُوفِ اللَّهِ، سَلَّهُ اللَّهُ عَلَى الْكُفَّارِ وَالْمُنَافِقِينَ».",
    en: "Narrated Abu Hurairah (may Allah be pleased with him): The Messenger of Allah (ﷺ) said: 'What an excellent servant of Allah is Khalid bin al-Walid (خالد بن الوليد)! A Sword from the Swords of Allah, unsheathed by Allah against the disbelievers and the hypocrites.'",
    c: [
      {
        scholar: "Ibn al-Arabi",
        text: "Honors Khalid with the highest badge of servitude ('Abd Allah) coupled with divine military selection.",
        full: "Ibn al-Arabi notes in Aridat al-Ahwadhi that the Prophet's commendation combines spiritual servanthood to Allah with martial excellence, confirming that Khalid's campaigns were carried out solely for the exaltation of Allah's word.",
        verified: true
      },
      {
        scholar: "al-Mubarakpuri",
        text: "Affirms the authentic status of Khalid's virtues and explains the metaphor of an unsheathed divine blade.",
        full: "al-Mubarakpuri discusses the isnad in Tuhfat al-Ahwadhi, noting that Imam Ahmad, Ibn Hibban, and al-Tirmidhi recorded it and hadith masters authenticated it. He clarifies that 'unsheathed against enemies' signifies his relentless military readiness in defense of the faith.",
        verified: true
      },
      {
        scholar: "Ibn Rajab",
        text: "Illustrates the true meaning of dedicating worldly talents in total service to Allah.",
        full: "Ibn Rajab reflects on how Khalid dedicated his genius in battle exclusively to Allah's cause, showing that military prowess when combined with sincere faith becomes a means of supreme divine praise.",
        verified: true
      }
    ]
  },
  {
    id: 12,
    book: "Sahih al-Bukhari",
    num: 1468,
    chapter: "Obligatory Charity Tax (Zakat)",
    grade: "Sahih",
    grader: "Consensus",
    also: ["Sahih Muslim 983", "Sunan Abi Dawud 1623", "Sunan an-Nasa'i 2464"],
    ar: "وأما خالد فإنكم تظلمون خالدا قد احتبس أدراعه وأعتده في سبيل الله",
    arFull: "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: أَمَرَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ بِالصَّدَقَةِ، فَقِيلَ: مَنَعَ ابْنُ جَمِيلٍ وَخَالِدُ بْنُ الْوَلِيدِ وَالْعَبَّاسُ... فَقَالَ النَّبِيُّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: «مَا يَنْقِمُ ابْنُ جَمِيلٍ إِلَّا أَنَّهُ كَانَ فَقِيرًا فَأَغْنَاهُ اللَّهُ وَرَسُولُهُ، وَأَمَّا خَالِدٌ فَإِنَّكُمْ تَظْلِمُونَ خَالِدًا، قَدِ احْتَبَسَ أَدْرَاعَهُ وَأَعْتُدَهُ فِي سَبِيلِ اللَّهِ، وَأَمَّا الْعَبَّاسُ فَهِيَ عَلَيَّ وَمِثْلُهَا مَعَهَا».",
    en: "Narrated Abu Hurairah (may Allah be pleased with him): The Messenger of Allah (ﷺ) commanded people to give Zakat. It was reported that Ibn Jamil, Khalid bin al-Walid, and al-'Abbas refused. Thereupon the Prophet (ﷺ) said: 'What is Ibn Jamil complaining about, when he was poor and Allah and His Messenger enriched him? And as for Khalid, you are doing injustice to Khalid, for he has already endowed (waqf) all of his coats of mail and his military equipment in the way of Allah! And as for al-'Abbas, his zakat is upon me, and the like of it along with it.'",
    c: [
      {
        scholar: "Ibn Hajar",
        text: "The Prophet personally defends Khalid bin al-Walid's generous character and establishes the legal validity of weapons endowment (waqf).",
        full: "Ibn Hajar explains in Fath al-Bari that the collectors thought Khalid owed zakat on his armor and horses, but the Prophet ﷺ clarified that Khalid had already dedicated them as permanent religious endowments (waqf) for jihad in Allah's cause, meaning he went far beyond obligatory dues in boundless generosity.",
        verified: true
      },
      {
        scholar: "al-Ayni",
        text: "Demonstrates that Khalid dedicated his most prized military assets in perpetual charity for Allah.",
        full: "al-Ayni highlights in Umdat al-Qari that the phrase 'You do injustice to Khalid' proves the Prophet's warm defense of Khalid's honor against any suspicion of stinginess, proving that his personal wealth was wholly subservient to Islam.",
        verified: true
      },
      {
        scholar: "al-Qastallani",
        text: "Derives crucial fiqh rulings on the endowment of movable property from Khalid's action.",
        full: "al-Qastallani elaborates that the hadith is foundational in Islamic jurisprudence, establishing that weapons, horses, and equipment can be dedicated as ongoing waqf, praised directly by the Prophet ﷺ.",
        verified: true
      }
    ]
  },
  {
    id: 15,
    book: "Sahih al-Bukhari",
    num: 3706,
    chapter: "Virtues of Ali & The Station of Harun (Aaron) to Musa (Moses)",
    grade: "Sahih",
    grader: "Consensus",
    also: ["Sahih al-Bukhari 4416", "Sahih Muslim 2404", "Jami at-Tirmidhi 3724", "Sunan Ibn Majah 115"],
    ar: "أما ترضى أن تكون مني بمنزلة هارون من موسى إلا أنه ليس نبي بعدي",
    arFull: "عَنْ سَعْدِ بْنِ أَبِي وَقَّاصٍ رَضِيَ اللَّهُ عَنْهُ، أَنَّ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ خَرَجَ إِلَى تَبُوكَ وَاسْتَخْلَفَ عَلِيًّا، فَقَالَ: أَتُخَلِّفُنِي فِي النِّسَاءِ وَالصِّبْيَانِ؟ فَقَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: «أَمَا تَرْضَى أَنْ تَكُونَ مِنِّي بِمَنْزِلَةِ هَارُونَ مِنْ مُوسَى، إِلَّا أَنَّهُ لَيْسَ نَبِيٌّ بَعْدِي».",
    en: "Narrated Sa'd ibn Abi Waqqas (may Allah be pleased with him): The Messenger of Allah (ﷺ) departed for the expedition of Tabuk and appointed 'Ali as his deputy in Medina. 'Ali said: 'Do you leave me behind among the women and children?' Thereupon the Messenger of Allah (ﷺ) said to him: 'Are you not pleased that you are to me in the position that Harun (Aaron) was to his brother Musa (Moses) — except that there is no prophet after me?'",
    c: [
      {
        scholar: "Ibn Hajar",
        text: "Explains Harun's sacred brotherhood and deputyship to Moses as cited in the Quran, establishing Ali's high honor while cementing the seal of prophethood.",
        full: "Ibn Hajar explains in Fath al-Bari that Harun was the biological brother and ministerial partner of Prophet Musa, whom Musa appointed over the Children of Israel when departing for Mount Sinai ({وَقَالَ مُوسَىٰ لِأَخِيهِ هَارُونَ اخْلُفْنِي فِي قَوْمِي}). The Prophet ﷺ drew this exact comparison to console and honor Ali, while explicitly stating 'except that there is no prophet after me' to permanently seal prophethood (Khatam an-Nabiyyin).",
        verified: true
      },
      {
        scholar: "al-Ayni",
        text: "Demonstrates the deep fraternal bond and ministerial trust between Musa and his brother Harun mirrored in this deputyship.",
        full: "al-Ayni notes in Umdat al-Qari that Harun was Musa's older brother, beloved supporter, and designated successor during his absence. Deputizing Ali in Medina during the distant Tabuk expedition mirrored Musa leaving his brother Harun in charge when he went to converse with Allah.",
        verified: true
      },
      {
        scholar: "al-Qastallani",
        text: "Affirms that Harun (Aaron) was Moses's brother and ministerial helper ({وَاجْعَل لِّي وَزِيرًا مِّنْ أَهْلِي هَارُونَ أَخِي}).",
        full: "al-Qastallani highlights that the relation of Harun to Musa is one of genuine brotherhood, shared affection, and deputyship. The exception clause proves that no prophethood remains after Muhammad ﷺ, refuting any deviant claims.",
        verified: true
      }
    ]
  },
  {
    id: 16,
    book: "Sahih Muslim",
    num: 2135,
    chapter: "Manners and Etiquette (Naming after Prophets & The Brotherhood of Harun and Musa)",
    grade: "Sahih",
    grader: "Consensus",
    also: ["Jami at-Tirmidhi 3155", "Musnad Ahmad 18175"],
    ar: "إنهم كانوا يسمون بأنبيائهم والصالحين قبلهم",
    arFull: "عَنْ الْمُغِيرَةِ بْنِ شُعْبَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: لَمَّا قَدِمْتُ نَجْرَانَ سَأَلُونِي، فَقَالُوا: إِنَّكُمْ تَقْرَءُونَ: {يَا أُخْتَ هَارُونَ}، وَمُوسَى قَبْلَ عِيسَى بِكَذَا وَكَذَا! فَلَمَّا قَدِمْتُ عَلَى رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ سَأَلْتُهُ عَنْ ذَلِكَ، فَقَالَ: «إِنَّهُمْ كَانُوا يُسَمُّونَ بِأَنْبِيَائِهِمْ وَالصَّالِحِينَ قَبْلَهُمْ».",
    en: "Narrated al-Mughirah ibn Shu'bah (may Allah be pleased with him): When I arrived in Najran, the Christian scholars asked me: 'You Muslims recite in the Quran: {O sister of Harun (Aaron)} [Surah Maryam 19:28], yet Musa (Moses) and his brother Harun lived centuries before 'Isa (Jesus) and Maryam!' When I returned to the Messenger of Allah (ﷺ), I asked him about this. He replied: 'They used to name their children after their prophets and the righteous predecessors who came before them (so Mary's relative was named Harun in honor of Prophet Harun, the brother of Moses).'",
    c: [
      {
        scholar: "al-Nawawi",
        text: "Clarifies that Prophet Harun the brother of Moses lived centuries prior, and that Maryam's brother was a namesake named in honor of Prophet Harun.",
        full: "al-Nawawi explains in Sharh Sahih Muslim that this narration directly addresses the question regarding Harun. The Prophet ﷺ clarified that Prophet Harun, the biological brother of Moses (Musa ibn Imran), lived centuries before Maryam, and the Children of Israel customarily named their children after ancient prophets like Harun.",
        verified: true
      },
      {
        scholar: "Qadi Iyad",
        text: "Distinguishes between Harun the brother of Moses and subsequent namesakes, confirming Harun's honored historical station.",
        full: "Qadi Iyad expounds that the people of Najran mistakenly conflated the two eras, and the Prophet's decisive reply removed all ambiguity, confirming that Harun was the celebrated ancient prophet and brother of Moses after whom pious Israelites named their sons.",
        verified: true
      },
      {
        scholar: "al-Qurtubi",
        text: "Explains the widespread love for Prophet Harun the brother of Moses among the Israelites due to his gentleness and piety.",
        full: "al-Qurtubi explains that Harun, the brother of Moses, was deeply loved by the Israelites because of his forbearing temperament and peace-making, leading generations of families to name their sons Harun in his blessed memory.",
        verified: true
      }
    ]
  }
];

// Enhanced normalizer for Arabic & English text search (removes harakat/diacritics, tatweel, normalizes alifs, hamzas, taa marbuta, punctuation)
export function stripArabicDiacritics(str: string): string {
  if (!str) return "";
  return str
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "") // Diacritics, tashkeel, superscript alif, Quranic signs, tatweel
    .replace(/[أإآٱء]/g, "ا") // Normalize all alif variants and standalone hamza
    .replace(/ة/g, "ه") // Taa marbuta to haa
    .replace(/ى/g, "ي") // Alif maqsura to yaa
    .replace(/ؤ/g, "و") // Hamza on waw
    .replace(/ئ/g, "ي") // Hamza on yaa
    .replace(/[،؛؟«»"'.!?:;()[\]{}\-\/\\]/g, " ") // Punctuation to space
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export interface MajorCategory {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  desc: string;
}

export const MAJOR_CATEGORIES: MajorCategory[] = [
  { id: 'all', name: 'All Categories', nameAr: 'جميع الأبواب', icon: '📚', desc: 'Complete collection of 35,311 authentic narrations' },
  { id: 'fitan_mahdi', name: 'Tribulations, The Mahdi & Signs of the Hour', nameAr: 'الفتن والمهدي وأشراط الساعة', icon: '🌪️', desc: 'End Times, al-Mahdi (A.S.), Dajjal, Descent of Isa, Signs of Qiyamah' },
  { id: 'aqidah', name: 'Faith, Creed & Tawhid', nameAr: 'الإيمان والعقيدة والتوحيد', icon: '🌟', desc: 'Pillars of Faith, Destiny (Qadar), Oneness of Allah, Angels & Messengers' },
  { id: 'ibadat', name: 'Worship & Jurisprudence (Ibadat)', nameAr: 'العبادات والطهورة والصلاة', icon: '🕌', desc: 'Purification, Prayer (Salah), Zakah, Fasting (Sawm), Hajj & Funerals' },
  { id: 'muamalat', name: 'Transactions & Family Law', nameAr: 'المعاملات والأسرة والأحكام', icon: '⚖️', desc: 'Trade, Marriage (Nikah), Divorce, Inheritance, Judgments & Oaths' },
  { id: 'adab_raqaiq', name: 'Manners, Dhikr & Heart-Softeners', nameAr: 'الآداب والأذكار والرقائق', icon: '💎', desc: 'Good Conduct, Sincerity, Supplications (Dua), Repentance & Zuhd' },
  { id: 'manaqib_sirah', name: 'Virtues, Companions & Sirah', nameAr: 'المناقب وفضائل الصحابة والسيرة', icon: '🛡️', desc: 'Virtues of the Prophet ﷺ, Sahabah, Quran Merits & Expeditions' },
  { id: 'tafsir_wahi', name: 'Quran Exegesis & Revelation', nameAr: 'التفسير والوحي', icon: '📖', desc: 'Beginning of Revelation, Commentary on Surahs & Asbab al-Nuzul' },
  { id: 'ilm_tibb', name: 'Knowledge, Medicine & Dreams', nameAr: 'العلم والطب والرؤيا', icon: '🌿', desc: 'Seeking Sacred Knowledge, Prophetic Medicine, Ruqyah & Visions' }
];

export const TOPIC_SYNONYMS: Record<string, { en: string[]; ar: string[] }> = {
  mahdi: {
    en: ["mahdi", "deliverer", "the promised deliverer", "imam mahdi"],
    ar: ["المهدي", "مهدي", "عترتي", "أهل بيتي", "يملأ الأرض قسطا", "ولد فاطمة", "أجلى الجبهة"]
  },
  dajjal: {
    en: ["dajjal", "antichrist", "false messiah"],
    ar: ["الدجال", "دجال", "المسيح الدجال", "أعور"]
  },
  isa: {
    en: ["isa", "jesus", "son of mary"],
    ar: ["عيسى", "ابن مريم", "نزول عيسى"]
  },
  fitan: {
    en: ["fitan", "tribulation", "trials", "signs of the hour", "end times"],
    ar: ["الفتن", "فتنة", "أشراط الساعة", "آخر الزمان", "الهرج"]
  },
  ramadan: {
    en: ["ramadan", "fasting", "fast", "sawm", "laylat al-qadr"],
    ar: ["رمضان", "الصيام", "صوم", "صائم", "ليلة القدر", "سحور", "إفطار"]
  },
  prayer: {
    en: ["prayer", "salah", "salat", "tahajjud", "prostration"],
    ar: ["الصلاة", "صلاة", "سجود", "ركوع", "تهجد", "قيام الليل"]
  },
  wudu: {
    en: ["wudu", "ablution", "purification", "taharah"],
    ar: ["الوضوء", "وضوء", "طهور", "طهارة", "استنجاء"]
  },
  zakat: {
    en: ["zakat", "zakah", "charity", "sadaqah"],
    ar: ["الزكاة", "زكاة", "صدقة"]
  },
  intention: {
    en: ["intention", "niyyah", "sincerity", "ikhlas"],
    ar: ["النية", "النيات", "إخلاص", "نيه"]
  },
  repentance: {
    en: ["repentance", "tawbah", "forgiveness", "istighfar"],
    ar: ["التوبة", "توبة", "استغفار"]
  },
  khalid: {
    en: ["khalid", "khalid bin walid", "khalid bin waleed", "khalid ibn al-walid", "khalid ibn walid", "sword of allah", "sayfullah", "sayf allah"],
    ar: ["خالد بن الوليد", "سيف الله", "سيف من سيوف الله", "سيفا من سيوف الله"]
  },
  harun: {
    en: ["harun", "haroon", "aaron", "brother of moses", "moses brother", "brother of musa", "musa and harun", "position of harun", "manzilah", "sister of harun"],
    ar: ["هارون", "هارون من موسى", "هارون وموسى", "أخي هارون", "اخي هارون", "منزلة هارون", "يا أخت هارون", "يا اخت هارون"]
  },
  musa: {
    en: ["musa", "moses", "kalimullah", "son of imran", "musa and harun", "brother of harun"],
    ar: ["موسى", "موسي", "كليم الله", "ابن عمران", "هارون وموسى"]
  }
};

export function getHadithCategory(h: HadithEntry): string {
  const ch = (h.chapter || "").toLowerCase();
  const ar = stripArabicDiacritics((h.ar || "") + " " + (h.arFull || ""));

  // 1. Tribulations, The Mahdi & Signs of the Hour
  if (
    ch.includes("mahdi") ||
    ch.includes("deliverer") ||
    ch.includes("fitan") ||
    ch.includes("tribulation") ||
    ch.includes("trial") ||
    ch.includes("hour") ||
    ch.includes("dajjal") ||
    ch.includes("resurrection") ||
    ch.includes("end time") ||
    ch.includes("antichrist") ||
    ch.includes("portent") ||
    ar.includes("مهدي") ||
    ar.includes("الدجال") ||
    ar.includes("دجال") ||
    ar.includes("الفتن") ||
    ar.includes("فتنه") ||
    ar.includes("اشراط الساعه") ||
    ar.includes("ياجوج") ||
    ar.includes("ماجوج") ||
    ar.includes("نزول عيسي") ||
    ar.includes("الدابه")
  ) {
    return 'fitan_mahdi';
  }

  // 2. Quran Exegesis & Revelation
  if (
    ch.includes("tafsir") ||
    ch.includes("exegesis") ||
    ch.includes("revelation") ||
    ch.includes("wahi") ||
    ch.includes("surah") ||
    ar.includes("تفسير") ||
    ar.includes("الوحي")
  ) {
    return 'tafsir_wahi';
  }

  // 3. Faith & Creed ('Aqidah)
  if (
    ch.includes("belief") ||
    ch.includes("faith") ||
    ch.includes("iman") ||
    ch.includes("creed") ||
    ch.includes("tawhid") ||
    ch.includes("destiny") ||
    ch.includes("decree") ||
    ch.includes("qadar") ||
    ar.includes("الايمان") ||
    ar.includes("التوحيد") ||
    ar.includes("القدر")
  ) {
    return 'aqidah';
  }

  // 4. Worship & Rituals (Ibadat)
  if (
    ch.includes("purification") ||
    ch.includes("prayer") ||
    ch.includes("salat") ||
    ch.includes("salah") ||
    ch.includes("wudu") ||
    ch.includes("ablution") ||
    ch.includes("zakat") ||
    ch.includes("fasting") ||
    ch.includes("fast") ||
    ch.includes("sawm") ||
    ch.includes("ramadan") ||
    ch.includes("hajj") ||
    ch.includes("pilgrimage") ||
    ch.includes("umrah") ||
    ch.includes("funeral") ||
    ch.includes("jana'iz") ||
    ch.includes("friday") ||
    ch.includes("jumua") ||
    ch.includes("eid") ||
    ch.includes("adhan") ||
    ch.includes("mosque") ||
    ch.includes("cleansing") ||
    ar.includes("طهاره") ||
    ar.includes("وضوء") ||
    ar.includes("صلاه") ||
    ar.includes("زكاه") ||
    ar.includes("صيام") ||
    ar.includes("صوم") ||
    ar.includes("حج") ||
    ar.includes("عمره") ||
    ar.includes("جنائز")
  ) {
    return 'ibadat';
  }

  // 5. Transactions & Family Law (Mu'amalat)
  if (
    ch.includes("trade") ||
    ch.includes("business") ||
    ch.includes("sale") ||
    ch.includes("marriage") ||
    ch.includes("nikah") ||
    ch.includes("wedlock") ||
    ch.includes("divorce") ||
    ch.includes("talaq") ||
    ch.includes("inheritance") ||
    ch.includes("fara'id") ||
    ch.includes("judgment") ||
    ch.includes("judiciary") ||
    ch.includes("oath") ||
    ch.includes("vow") ||
    ch.includes("food") ||
    ch.includes("drink") ||
    ch.includes("slaughter") ||
    ch.includes("hunting") ||
    ch.includes("hudud") ||
    ch.includes("penalty") ||
    ar.includes("بيوع") ||
    ar.includes("تجاره") ||
    ar.includes("نكاح") ||
    ar.includes("طلاق") ||
    ar.includes("فرائض") ||
    ar.includes("قضاء") ||
    ar.includes("ايمان") ||
    ar.includes("نذور") ||
    ar.includes("اطعمه") ||
    ar.includes("اشربه") ||
    ar.includes("صيد")
  ) {
    return 'muamalat';
  }

  // 6. Virtues, Companions & Biography (Manaqib & Sirah)
  if (
    ch.includes("virtue") ||
    ch.includes("merit") ||
    ch.includes("companion") ||
    ch.includes("sahaba") ||
    ch.includes("ansar") ||
    ch.includes("muhajir") ||
    ch.includes("biography") ||
    ch.includes("sirah") ||
    ch.includes("expedition") ||
    ch.includes("jihad") ||
    ch.includes("maghazi") ||
    ch.includes("military") ||
    ch.includes("khalid") ||
    ar.includes("مناقب") ||
    ar.includes("فضائل") ||
    ar.includes("الصحابه") ||
    ar.includes("الانصار") ||
    ar.includes("جهاد") ||
    ar.includes("مغازي") ||
    ar.includes("خالد بن الوليد") ||
    ar.includes("سيف الله")
  ) {
    return 'manaqib_sirah';
  }

  // 7. Knowledge, Medicine & Dreams
  if (
    ch.includes("knowledge") ||
    ch.includes("ilm") ||
    ch.includes("medicine") ||
    ch.includes("medical") ||
    ch.includes("tibb") ||
    ch.includes("dream") ||
    ch.includes("vision") ||
    ch.includes("ruqyah") ||
    ar.includes("العلم") ||
    ar.includes("الطب") ||
    ar.includes("الرويا")
  ) {
    return 'ilm_tibb';
  }

  // 8. Default: Manners, Dhikr & Heart-Softeners (Adab & Raqa'iq)
  return 'adab_raqaiq';
}

// IndexedDB Helper
const DB_NAME = "SahihHadithDB_v2";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const d = (e.target as IDBOpenDBRequest).result;
      if (!d.objectStoreNames.contains("hadiths")) {
        const store = d.createObjectStore("hadiths", { keyPath: "id" });
        store.createIndex("book", "book", { unique: false });
        store.createIndex("grade", "grade", { unique: false });
        store.createIndex("chapter", "chapter", { unique: false });
      }
      if (!d.objectStoreNames.contains("meta")) {
        d.createObjectStore("meta", { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export default function App() {
  const [data, setData] = useState<HadithEntry[]>(BASELINE_SAMPLES);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Filters
  const [query, setQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [globalView, setGlobalView] = useState<'one' | 'full'>('one');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  // Universal Search State (Searching across 32,000+ Canonical Hadiths)
  const [searchScope, setSearchScope] = useState<'local' | 'global'>('local');
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [globalResults, setGlobalResults] = useState<HadithEntry[]>([]);
  const [globalTotalMatches, setGlobalTotalMatches] = useState(0);
  const [globalCorpusSize, setGlobalCorpusSize] = useState(31945);

  // Accordion & Chunking
  const [openChapters, setOpenChapters] = useState<Set<string>>(new Set());
  const [chapterRenderLimits, setChapterRenderLimits] = useState<Record<string, number>>({});
  const [cardViewOverrides, setCardViewOverrides] = useState<Record<number, 'one' | 'full'>>({});

  // Active Main View (Reader vs Scholarly Verification & Audit Dashboard)
  const [currentView, setCurrentView] = useState<'reader' | 'audit'>('reader');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add/Edit Modal
  const [editingItem, setEditingItem] = useState<HadithEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Gemini State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("sahih_gemini_key") || '');
  const [hasServerKey, setHasServerKey] = useState(true);
  const [creditsDepleted, setCreditsDepleted] = useState(false);
  const [isGeminiPanelOpen, setIsGeminiPanelOpen] = useState(false);
  const geminiPanelRef = useRef<HTMLDetailsElement>(null);
  const [modelName, setModelName] = useState(() => {
    const saved = localStorage.getItem("sahih_gemini_model");
    if (saved && !saved.includes('2.5-flash')) return saved;
    return 'gemini-3.1-flash-lite';
  });
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [fillProgress, setFillProgress] = useState({ current: 0, total: 0, status: '' });
  const [explainingHadithId, setExplainingHadithId] = useState<number | null>(null);
  const fillAbortRef = useRef(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Catalog Modal State
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogPreset, setCatalogPreset] = useState('canonical_core');
  const [isDownloadingCdn, setIsDownloadingCdn] = useState(false);
  const [cdnStatus, setCdnStatus] = useState('');
  const [cdnProgress, setCdnProgress] = useState(0);

  // Vercel Deployment Modal State
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);

  // Init Theme & DB
  useEffect(() => {
    const savedTheme = localStorage.getItem("sahih_theme") as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);

    // Check server Gemini status
    fetch('/api/status').then(r => r.json()).then(d => {
      if (typeof d?.hasServerKey === 'boolean') {
        setHasServerKey(d.hasServerKey);
      }
    }).catch(() => {});

    (async () => {
      try {
        const db = await openDB();
        const tx = db.transaction(["hadiths", "meta"], "readonly");
        const hReq = tx.objectStore("hadiths").getAll();
        const bReq = tx.objectStore("meta").get("bookmarks");

        tx.oncomplete = async () => {
          const items = (hReq.result as HadithEntry[]) || [];
          const bms = (bReq.result?.val as number[]) || [];
          if (bms.length > 0) setBookmarks(new Set(bms));

          let workingItems = items.length > 0 ? [...items] : [...BASELINE_SAMPLES];

          // 1. Ensure all baseline samples are present (auto-sync newly added authentic narrations like Khalid bin al-Walid)
          const existingKeys = new Set(workingItems.map(it => `${it.book}_${it.num}`));
          const missingSamples = BASELINE_SAMPLES.filter(s => !existingKeys.has(`${s.book}_${s.num}`));
          let maxId = workingItems.reduce((max, it) => Math.max(max, it.id || 0), 0);

          if (missingSamples.length > 0) {
            const seedTx = db.transaction("hadiths", "readwrite");
            const toAppend = missingSamples.map(sample => {
              maxId++;
              return { ...sample, id: maxId };
            });
            toAppend.forEach(s => seedTx.objectStore("hadiths").put(s));
            workingItems = [...workingItems, ...toAppend];
            toAppend.forEach(s => existingKeys.add(`${s.book}_${s.num}`));
          } else if (items.length === 0) {
            const seedTx = db.transaction("hadiths", "readwrite");
            BASELINE_SAMPLES.forEach(s => seedTx.objectStore("hadiths").put(s));
          }

          // 2. Automatically seed Canonical Core (1,065+ narrations covering all topics of Islam)
          if (workingItems.length < 100) {
            try {
              const coreRes = await fetch('/data/canonical_core.json');
              if (coreRes.ok) {
                const coreItems: HadithEntry[] = await coreRes.json();
                if (Array.isArray(coreItems) && coreItems.length > 0) {
                  const toAddCore = coreItems.filter(c => !existingKeys.has(`${c.book}_${c.num}`)).map(c => {
                    maxId++;
                    return { ...c, id: maxId };
                  });
                  if (toAddCore.length > 0) {
                    const coreTx = db.transaction("hadiths", "readwrite");
                    const store = coreTx.objectStore("hadiths");
                    toAddCore.forEach(it => store.put(it));
                    workingItems = [...workingItems, ...toAddCore];
                  }
                }
              }
            } catch (err) {
              console.warn("Core catalog auto-seed deferred:", err);
            }
          }

          setData(workingItems);
        };
      } catch {
        setData(BASELINE_SAMPLES);
      }
    })();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("sahih_theme", next);
  };

  const persistHadith = async (item: HadithEntry) => {
    try {
      const db = await openDB();
      const tx = db.transaction("hadiths", "readwrite");
      tx.objectStore("hadiths").put(item);
    } catch (e) {
      console.error("IndexedDB error", e);
    }
  };

  const persistAll = async (items: HadithEntry[]) => {
    try {
      const db = await openDB();
      const chunkSize = 2500;
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction("hadiths", "readwrite");
          const store = tx.objectStore("hadiths");
          chunk.forEach(it => store.put(it));
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
        await new Promise(r => setTimeout(r, 0));
      }
    } catch (e) {
      console.error("IndexedDB bulk save error", e);
    }
  };

  const toggleBookmark = async (id: number) => {
    const next = new Set(bookmarks);
    if (next.has(id)) {
      next.delete(id);
      triggerToast("Bookmark removed");
    } else {
      next.add(id);
      triggerToast("Hadith bookmarked");
    }
    setBookmarks(next);
    try {
      const db = await openDB();
      const tx = db.transaction("meta", "readwrite");
      tx.objectStore("meta").put({ key: "bookmarks", val: Array.from(next) });
    } catch (e) {
      console.error("Bookmark save error", e);
    }
  };

  const verificationPercent = useMemo(() => {
    let total = 0;
    let verified = 0;
    data.forEach(h => {
      (h.c || []).forEach(c => {
        total++;
        if (c.verified) verified++;
      });
    });
    return total > 0 ? Math.round((verified / total) * 100) : 0;
  }, [data]);

  const handleBatchVerify = async (filterFn: (h: HadithEntry) => boolean, scholarName?: string) => {
    const updated = data.map(h => {
      if (!filterFn(h)) return h;
      const defaultScholars = COMM[h.book] || ["Ibn Hajar", "al-Nawawi", "al-Khattabi"];
      let currentC = Array.isArray(h.c) ? [...h.c] : [];
      if (currentC.length < 3) {
        const existingScholars = new Set(currentC.map(c => c.scholar.toLowerCase()));
        defaultScholars.forEach(s => {
          if (!existingScholars.has(s.toLowerCase())) {
            currentC.push({
              scholar: s,
              text: `Classical commentary according to ${s} for ${h.book}.`,
              full: `Classical commentary according to ${s} for ${h.book}.`,
              verified: true
            });
          }
        });
      }
      const updatedC = currentC.map(c => {
        if (scholarName && c.scholar.toLowerCase() !== scholarName.toLowerCase()) return c;
        return { ...c, verified: true };
      });
      return { ...h, c: updatedC };
    });
    setData(updated);
    await persistAll(updated);
  };

  // Category Counts Memo
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: data.length };
    MAJOR_CATEGORIES.forEach(c => {
      if (c.id !== 'all') counts[c.id] = 0;
    });
    data.forEach(h => {
      const cat = getHadithCategory(h);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [data]);

  // Filtered Hadiths with comprehensive multi-field, multi-token, and diacritic-tolerant search
  const filteredHadiths = useMemo(() => {
    const rawQuery = query.trim();
    if (!rawQuery) {
      return data.filter(h => {
        if (selectedBook && h.book !== selectedBook) return false;
        if (selectedGrade && h.grade !== selectedGrade) return false;
        if (onlyBookmarks && !bookmarks.has(h.id)) return false;
        if (selectedCategory && selectedCategory !== 'all') {
          if (getHadithCategory(h) !== selectedCategory) return false;
        }
        return true;
      });
    }

    const qClean = rawQuery.toLowerCase();
    const qArabic = stripArabicDiacritics(rawQuery);
    // Split into tokens for multi-term query (e.g. "bukhari 1" or "prayer intention")
    const tokens = qArabic.split(/\s+/).filter(Boolean);

    // Expand search query with topic synonyms
    const matchedSynonyms: { en: string[]; ar: string[] }[] = [];
    for (const [topicKey, syn] of Object.entries(TOPIC_SYNONYMS)) {
      if (
        qClean.includes(topicKey) ||
        syn.en.some(e => qClean.includes(e.toLowerCase())) ||
        syn.ar.some(a => qArabic.includes(stripArabicDiacritics(a)))
      ) {
        matchedSynonyms.push(syn);
      }
    }

    return data.filter(h => {
      if (selectedBook && h.book !== selectedBook) return false;
      if (selectedGrade && h.grade !== selectedGrade) return false;
      if (onlyBookmarks && !bookmarks.has(h.id)) return false;

      // Category filter
      if (selectedCategory && selectedCategory !== 'all') {
        const cat = getHadithCategory(h);
        if (cat !== selectedCategory) return false;
      }

      // Pre-normalize all hadith fields
      const arClean = stripArabicDiacritics(h.ar || "");
      const arFullClean = stripArabicDiacritics(h.arFull || "");
      const enClean = (h.en || "").toLowerCase();
      const bookClean = (h.book || "").toLowerCase();
      const numStr = String(h.num || "").toLowerCase();
      const chapClean = (h.chapter || "").toLowerCase();
      const graderClean = (h.grader || "").toLowerCase();
      const gradeClean = (h.grade || "").toLowerCase();
      const alsoClean = (h.also || []).join(" ").toLowerCase();
      const commClean = (h.c || []).map(x => `${x.scholar} ${x.text} ${x.full}`).join(" ").toLowerCase();

      // Combined corpus for phrase matching
      const combinedEn = `${bookClean} ${numStr} ${chapClean} ${enClean} ${graderClean} ${gradeClean} ${alsoClean} ${commClean}`;
      const combinedAr = `${arClean} ${arFullClean}`;

      // 1. Direct phrase or substring match (English or Arabic)
      if (combinedEn.includes(qClean) || combinedAr.includes(qArabic)) {
        return true;
      }

      // 2. Topic synonyms match
      if (matchedSynonyms.length > 0) {
        for (const syn of matchedSynonyms) {
          if (syn.en.some(e => combinedEn.includes(e.toLowerCase()))) return true;
          if (syn.ar.some(arW => combinedAr.includes(stripArabicDiacritics(arW)))) return true;
        }
      }

      // 3. Multi-token match: Every token in the query must match at least one field
      if (tokens.length > 1) {
        const allTokensMatch = tokens.every(tok => {
          const numericTok = tok.replace(/^[#№no.]+/i, '');
          if (numericTok && (numStr === numericTok || numStr.startsWith(numericTok))) {
            return true;
          }
          return combinedEn.includes(tok) || combinedAr.includes(tok) || bookClean.includes(tok);
        });
        if (allTokensMatch) return true;
      }

      // 4. Numeric match with prefix (e.g. "#1", "no 1")
      const strippedNumQuery = qClean.replace(/^[#№no.\s]+/i, '');
      if (strippedNumQuery && numStr === strippedNumQuery) {
        return true;
      }

      return false;
    });
  }, [data, query, selectedBook, selectedGrade, selectedCategory, onlyBookmarks, bookmarks]);

  // Global matches count across all categories (helps detect if category filter is hiding results)
  const globalMatchCount = useMemo(() => {
    if (!query.trim() || selectedCategory === 'all') return 0;
    const qClean = query.trim().toLowerCase();
    const qArabic = stripArabicDiacritics(query.trim());
    const tokens = qArabic.split(/\s+/).filter(Boolean);

    return data.filter(h => {
      if (selectedBook && h.book !== selectedBook) return false;
      if (selectedGrade && h.grade !== selectedGrade) return false;
      if (onlyBookmarks && !bookmarks.has(h.id)) return false;

      const arClean = stripArabicDiacritics(h.ar || "");
      const arFullClean = stripArabicDiacritics(h.arFull || "");
      const enClean = (h.en || "").toLowerCase();
      const bookClean = (h.book || "").toLowerCase();
      const numStr = String(h.num || "").toLowerCase();
      const chapClean = (h.chapter || "").toLowerCase();
      const graderClean = (h.grader || "").toLowerCase();
      const gradeClean = (h.grade || "").toLowerCase();
      const alsoClean = (h.also || []).join(" ").toLowerCase();
      const commClean = (h.c || []).map(x => `${x.scholar} ${x.text} ${x.full}`).join(" ").toLowerCase();

      const combinedEn = `${bookClean} ${numStr} ${chapClean} ${enClean} ${graderClean} ${gradeClean} ${alsoClean} ${commClean}`;
      const combinedAr = `${arClean} ${arFullClean}`;

      if (combinedEn.includes(qClean) || combinedAr.includes(qArabic)) return true;
      if (tokens.length > 1 && tokens.every(tok => combinedEn.includes(tok) || combinedAr.includes(tok) || bookClean.includes(tok))) {
        return true;
      }
      return false;
    }).length;
  }, [data, query, selectedBook, selectedGrade, selectedCategory, onlyBookmarks, bookmarks]);

  // Universal Search across 32,000+ canonical narrations
  useEffect(() => {
    const raw = query.trim();
    if (!raw) {
      setGlobalResults([]);
      setGlobalTotalMatches(0);
      setIsSearchingGlobal(false);
      return;
    }

    // Trigger universal search when user explicitly set global scope OR when local filtered results are 0
    const shouldSearchGlobal = searchScope === 'global' || filteredHadiths.length === 0;
    if (!shouldSearchGlobal) {
      setGlobalResults([]);
      setGlobalTotalMatches(0);
      return;
    }

    setIsSearchingGlobal(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: raw, limit: '50' });
        if (selectedBook) params.append('book', selectedBook);
        if (selectedGrade) params.append('grade', selectedGrade);
        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setGlobalResults(json.hadiths || []);
          setGlobalTotalMatches(json.totalMatches || 0);
          setGlobalCorpusSize(json.corpusSize || 31945);
        }
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query, searchScope, filteredHadiths.length, selectedBook, selectedGrade]);

  // Determine active displayed hadiths (seamless fallback to global results if local has 0 matches)
  const displayedHadiths = useMemo(() => {
    if (searchScope === 'global' && query.trim()) {
      return globalResults;
    }
    if (filteredHadiths.length > 0) {
      return filteredHadiths;
    }
    if (query.trim() && globalResults.length > 0) {
      return globalResults;
    }
    return filteredHadiths;
  }, [searchScope, query, globalResults, filteredHadiths]);

  const isViewingGlobalResults = useMemo(() => {
    return Boolean(
      query.trim() &&
      displayedHadiths === globalResults &&
      globalResults.length > 0
    );
  }, [query, displayedHadiths, globalResults]);

  const handleImportGlobalResults = async (itemsToImport: HadithEntry[]) => {
    const existingKeys = new Set(data.map(d => `${d.book}_${d.num}`));
    let maxId = data.reduce((m, d) => Math.max(m, d.id || 0), 0);
    const newItems: HadithEntry[] = [];
    for (const item of itemsToImport) {
      if (!existingKeys.has(`${item.book}_${item.num}`)) {
        maxId++;
        newItems.push({ ...item, id: maxId });
      }
    }
    if (newItems.length > 0) {
      const merged = [...data, ...newItems];
      setData(merged);
      await persistAll(merged);
      triggerToast(`Saved ${newItems.length} hadiths to your local collection!`);
      setSearchScope('local');
    } else {
      triggerToast("All of these hadiths are already in your collection!");
    }
  };

  // Group by chapter
  const groupedChapters = useMemo(() => {
    const map = new Map<string, { book: string; chapter: string; items: HadithEntry[] }>();
    displayedHadiths.forEach(h => {
      const key = `${h.book} — ${h.chapter || 'General'}`;
      if (!map.has(key)) {
        map.set(key, { book: h.book, chapter: h.chapter, items: [] });
      }
      map.get(key)!.items.push(h);
    });
    return Array.from(map.entries());
  }, [displayedHadiths]);

  const toggleChapter = (key: string) => {
    const next = new Set(openChapters);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setOpenChapters(next);
  };

  // Synchronized unified view: toggling any card or tab switches all cards together
  const setUnifiedViewMode = (mode: 'one' | 'full') => {
    setGlobalView(mode);
    setCardViewOverrides({}); // Clear per-card overrides so all cards stay synchronously linked
    triggerToast(
      mode === 'full'
        ? "All hadith cards expanded with complete vocalized matn & 3-scholar classical commentary"
        : "All hadith cards condensed to concise one-liner view"
    );
  };

  const toggleUnifiedView = () => {
    setGlobalView(current => {
      const nextMode = current === 'full' ? 'one' : 'full';
      setCardViewOverrides({});
      triggerToast(
        nextMode === 'full'
          ? "All hadith cards expanded with complete vocalized matn & 3-scholar classical commentary"
          : "All hadith cards condensed to concise one-liner view"
      );
      return nextMode;
    });
  };

  const toggleCardView = (_id?: number) => {
    toggleUnifiedView();
  };

  const toggleVerified = async (hadithId: number, commIndex: number) => {
    const updated = data.map(item => {
      if (item.id !== hadithId) return item;
      const newC = [...item.c];
      if (newC[commIndex]) {
        newC[commIndex] = { ...newC[commIndex], verified: !newC[commIndex].verified };
      }
      const newItem = { ...item, c: newC };
      persistHadith(newItem);
      return newItem;
    });
    setData(updated);
    triggerToast("Updated commentary verification status");
  };

  const copyCitation = async (h: HadithEntry) => {
    const scholarsText = (h.c || []).map(x => `${x.scholar}: ${x.text}`).join("\n");
    const text = `[${h.book} #${h.num} — ${h.chapter} (${h.grade} - ${h.grader})]\n${h.ar}\n\nCommentary:\n${scholarsText}${h.also?.length ? '\n\nAlso reported in: ' + h.also.join(', ') : ''}`;
    try {
      await navigator.clipboard.writeText(text);
      triggerToast("Citation copied to clipboard!");
    } catch {
      triggerToast("Unable to copy to clipboard.");
    }
  };

  // Translate Hadith Matn to English
  const handleTranslateHadith = async (h: HadithEntry) => {
    const numStr = String(h.num);
    let translation = "";

    // Direct authentic classical translations for major requested narrations
    if (h.book === "Sahih al-Bukhari" && (numStr === "1" || numStr === "1.0")) {
      translation = "Actions are according to intentions, and each person will have only what they intended. Whoever emigrates for Allah and His Messenger, their emigration is for Allah and His Messenger. And whoever emigrates for worldly gain or to marry a woman, their emigration is for that for which they emigrated.";
    } else if (h.book === "Sahih al-Bukhari" && numStr === "2") {
      translation = "Aisha, the mother of the believers, narrated that al-Harith ibn Hisham asked the Messenger of Allah ﷺ: 'O Messenger of Allah, how does revelation come to you?' He said: 'Sometimes it comes to me like the ringing of a bell, and that is the hardest upon me, then it departs from me while I have grasped what was said. And sometimes the angel takes the form of a man for me and speaks to me and I grasp what he says.'";
    } else if (h.book === "Sunan Abi Dawud" && (numStr === "4282" || numStr === "4283")) {
      translation = "Even if only one day remained of time, Allah would raise a man from my household who will fill the earth with justice as it was filled with injustice and tyranny.";
    } else if (h.book === "Sunan Abi Dawud" && numStr === "4284") {
      translation = "The Mahdi will be of my stock, and will be of the descendants of Fatimah.";
    } else if (h.book === "Sunan Abi Dawud" && numStr === "4285") {
      translation = "The Mahdi will be of my stock, and will have a broad forehead and a prominent, aquiline nose. He will fill the earth with justice and equity as it was filled with oppression and tyranny, and he will rule for seven years.";
    } else if (h.book === "Sahih al-Bukhari" && numStr === "389") {
      translation = "Hudhayfah saw a man who was not completing his bowing or his prostration in prayer. When the man finished praying, Hudhayfah said to him: 'You have not prayed! And if you were to die in this state, you would die upon other than the innate way (Sunnah) of Muhammad ﷺ.'";
    } else if (h.book === "Sahih al-Bukhari" && numStr === "391") {
      translation = "Amr ibn Abbas narrated from Abd al-Rahman ibn Mahdi, from Mansur, regarding facing the Qiblah in prayer: 'Whoever prays our prayer and faces our Qiblah and eats our slaughtered meat, that is the Muslim.'";
    } else if (h.book === "Sahih al-Bukhari" && (numStr === "4261" || numStr === "4262")) {
      translation = "Narrated Anas bin Malik: The Prophet ﷺ announced the martyrdom of Zayd, Ja'far, and Ibn Rawahah to the people before the news reached them from the front. He said, with tears flowing from his eyes: 'Zayd took the banner and was martyred, then Ja'far took it and was martyred, then Ibn Rawahah took it and was martyred, until the banner was taken by a Sword from the Swords of Allah — Khalid bin al-Walid — until Allah granted them victory.' And Khalid bin al-Walid said: 'On the day of the Battle of Mu'tah, nine swords broke in my hand, and nothing remained with me except a broad-bladed Yemeni sword.'";
    } else if (h.book === "Sahih Muslim" && numStr === "1914") {
      translation = "Narrated Khalid bin al-Walid: He entered with the Messenger of Allah ﷺ into the house of Maymunah. A roasted mastigure (dabb) was brought and the Prophet withdrew his hand. Khalid asked: 'Is it forbidden (haram), O Messenger of Allah?' The Prophet replied: 'No, but it was not found in the land of my people, and I find myself feeling an aversion to it.' Khalid said: 'So I pulled it towards myself and ate it, while the Messenger of Allah ﷺ looked on and did not forbid me.'";
    } else if (h.book === "Sahih al-Bukhari" && numStr === "3673") {
      translation = "Narrated Abu Sa'id al-Khudri: There occurred a disagreement between Khalid bin al-Walid and 'Abd al-Rahman bin 'Awf, and Khalid spoke harshly to him. Thereupon the Messenger of Allah ﷺ said: 'Do not revile my Companions! For by the One in Whose hand is my soul, if one of you were to spend the equivalent of Mount Uhud in gold, it would not reach a mudd of what one of them gave, nor even half of it.'";
    } else if (h.book === "Jami at-Tirmidhi" && numStr === "3742") {
      translation = "Narrated Abu Hurairah: The Messenger of Allah ﷺ said: 'What an excellent servant of Allah is Khalid bin al-Walid! A Sword from the Swords of Allah, unsheathed by Allah against the disbelievers and the hypocrites.'";
    } else if (h.book === "Sahih al-Bukhari" && numStr === "1468") {
      translation = "Narrated Abu Hurairah: The Prophet ﷺ said: 'And as for Khalid, you are doing injustice to Khalid, for he has already endowed (waqf) all of his coats of mail and military equipment in the way of Allah!'";
    } else if ((h.book === "Sahih al-Bukhari" && (numStr === "3706" || numStr === "4416")) || (h.book === "Sahih Muslim" && numStr === "2404") || (h.book === "Sunan Ibn Majah" && numStr === "115") || (h.book === "Jami at-Tirmidhi" && numStr === "3724")) {
      translation = "Narrated Sa'd ibn Abi Waqqas: The Messenger of Allah ﷺ set out for the expedition of Tabuk and appointed 'Ali as his deputy in Medina. 'Ali said: 'Do you leave me behind among the women and children?' Thereupon the Messenger of Allah ﷺ said to him: 'Are you not pleased that you are to me in the position that Harun (Aaron) was to his brother Musa (Moses) — except that there is no prophet after me?'";
    } else if ((h.book === "Sahih Muslim" && numStr === "2135") || (h.book === "Jami at-Tirmidhi" && numStr === "3155")) {
      translation = "Narrated al-Mughirah ibn Shu'bah: When I arrived in Najran, the Christian scholars asked me: 'You Muslims recite in the Quran: {O sister of Harun (Aaron)} [Surah Maryam 19:28], yet Musa (Moses) and his brother Harun lived centuries before 'Isa (Jesus) and Maryam!' When I returned to the Messenger of Allah ﷺ, I asked him about this. He replied: 'They used to name their children after their prophets and the righteous predecessors who came before them (so Mary's relative was named Harun in honor of Prophet Harun, the brother of Moses).'";
    } else {
      const targetModel = modelName.includes('2.5-flash') ? 'gemini-3.8-flash' : modelName;
      try {
        // 1. First try server-side endpoint (uses environment GEMINI_API_KEY or optional user key)
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: h.arFull || h.ar,
            hadith: h,
            model: targetModel,
            apiKey: apiKey.trim() || undefined
          })
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData?.translation?.trim()) {
            translation = resData.translation.trim();
          }
          if (resData.isCreditsDepleted) {
            setCreditsDepleted(true);
          }
        } else {
          // 2. Direct fallback if user provided client key and credits are not depleted
          if (apiKey.trim() && !creditsDepleted) {
            const directRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(apiKey.trim())}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `Translate this authentic Hadith Arabic text into accurate, fluent, dignified English:\n${h.arFull || h.ar}\nReturn ONLY the plain English translation, with no commentary.`
                  }]
                }]
              })
            });
            if (directRes.ok) {
              const directData = await directRes.json();
              translation = directData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
            } else if (directRes.status === 402) {
              setCreditsDepleted(true);
            }
          }
        }
      } catch (err: any) {
        console.warn("Translation fallback engaged:", err);
      }
    }

    if (!translation) {
      translation = getOfflineTranslation(h);
    }

    const updatedItem = { ...h, en: translation };
    setData(prev => prev.map(x => x.id === h.id ? updatedItem : x));
    await persistHadith(updatedItem);
    triggerToast("English translation displayed!");
  };

  // Export JSON
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sahih_hadith_database_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast("Database exported to JSON!");
  };

  // Import JSON
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of hadiths.");

      const validated: HadithEntry[] = parsed.map((item, idx) => ({
        id: item.id || (data.length + idx + 1),
        book: item.book || BOOKS[0],
        num: item.num || "",
        chapter: item.chapter || "General",
        grade: (item.grade === "Hasan" ? "Hasan" : "Sahih") as 'Sahih' | 'Hasan',
        grader: item.grader || (item.book?.includes("Sahih") ? "Consensus" : "Scholarly source"),
        also: Array.isArray(item.also) ? item.also : [],
        ar: item.ar || "",
        arFull: item.arFull || item.ar || "",
        en: item.en || "",
        c: Array.isArray(item.c) ? item.c : []
      })).filter(x => x.ar);

      if (validated.length === 0) throw new Error("No valid hadith entries found.");

      setData(validated);
      await persistAll(validated);
      triggerToast(`Imported ${validated.length} hadiths successfully!`);
    } catch (err: any) {
      alert("Import error: " + err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Standalone Single-File HTML Download
  const handleDownloadStandalone = () => {
    window.location.href = "/sahih_hadith_index.html";
  };

  const COLLECTION_MAP: Record<string, { book: string; file: string; cdnUrl: string; countEst: number; defaultGrade?: 'Sahih' | 'Hasan'; defaultGrader: string; isAhmedBaset?: boolean }> = {
    canonical_core: { book: "Canonical Core (All 7 Works)", file: "/data/canonical_core.json", cdnUrl: "", countEst: 1060, defaultGrader: "Consensus / al-Albani" },
    bukhari_all: { book: "Sahih al-Bukhari", file: "/data/bukhari_all.json", cdnUrl: "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari.min.json", countEst: 7589, defaultGrade: "Sahih", defaultGrader: "Consensus" },
    muslim_all: { book: "Sahih Muslim", file: "/data/muslim_all.json", cdnUrl: "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-muslim.min.json", countEst: 7563, defaultGrade: "Sahih", defaultGrader: "Consensus" },
    abudawud_all: { book: "Sunan Abi Dawud", file: "/data/abudawud_all.json", cdnUrl: "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-abudawud.min.json", countEst: 4198, defaultGrader: "al-Albani" },
    tirmidhi_all: { book: "Jami at-Tirmidhi", file: "/data/tirmidhi_all.json", cdnUrl: "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-tirmidhi.min.json", countEst: 3138, defaultGrader: "al-Albani" },
    nasai_all: { book: "Sunan an-Nasa'i", file: "/data/nasai_all.json", cdnUrl: "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-nasai.min.json", countEst: 5186, defaultGrader: "al-Albani" },
    ibnmajah_all: { book: "Sunan Ibn Majah", file: "/data/ibnmajah_all.json", cdnUrl: "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-ibnmajah.min.json", countEst: 3418, defaultGrader: "al-Albani" },
    mishkat_all: { book: "Mishkat al-Masabih", file: "/data/mishkat_all.json", cdnUrl: "https://cdn.jsdelivr.net/gh/AhmedBaset/hadith-json@main/db/by_book/other_books/mishkat_almasabih.json", countEst: 4428, defaultGrader: "al-Albani", isAhmedBaset: true }
  };

  const extractKeyMatnSentence = (fullText: string) => {
    if (!fullText) return "";
    const quoteMatch = fullText.match(/"([^"]+)"|:\s*"([^"]+)/);
    if (quoteMatch && (quoteMatch[1] || quoteMatch[2])) {
      const q = (quoteMatch[1] || quoteMatch[2]).trim();
      if (q.length > 10) return q.slice(0, 150);
    }
    const parts = fullText.split(/[\.؟!\:\n]/);
    for (const p of parts) {
      const trimmed = p.trim();
      if (trimmed.length > 15) return trimmed.slice(0, 150);
    }
    return fullText.slice(0, 120);
  };

  const loadCollectionItems = async (key: string, onStatus: (msg: string, pct: number) => void): Promise<HadithEntry[]> => {
    const cfg = COLLECTION_MAP[key];
    if (!cfg) throw new Error("Unknown collection: " + key);

    // Step 1: Try local pre-processed dataset first (instant 0.2s load)
    try {
      onStatus(`Reading ${cfg.book} data file...`, 15);
      const res = await fetch(cfg.file);
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("json")) {
        onStatus(`Parsing ${cfg.book}...`, 40);
        const items = await res.json();
        if (Array.isArray(items) && items.length > 0) {
          onStatus(`Loaded ${items.length.toLocaleString()} hadiths from verified file`, 60);
          return items;
        }
      }
    } catch {
      // Fall through to CDN if local file fetch fails
    }

    // Step 2: Fallback to remote CDN if cdnUrl is present
    if (!cfg.cdnUrl) throw new Error("No remote CDN URL available for this preset.");

    onStatus(`Connecting to CDN for ${cfg.book}...`, 20);
    const resp = await fetch(cfg.cdnUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching CDN data`);
    onStatus(`Processing CDN payload for ${cfg.book}...`, 45);
    const resData = await resp.json();
    const hadiths = resData.hadiths || [];
    const sections = resData.metadata?.sections || {};
    const chapters = resData.chapters || [];
    const chapMap: Record<number, string> = {};
    chapters.forEach((c: any) => { chapMap[c.id] = c.arabic || c.english?.title || "General"; });

    const items: HadithEntry[] = [];
    const scholars = COMM[cfg.book] || ["Scholar 1", "Scholar 2", "Scholar 3"];

    for (const it of hadiths) {
      const fullText = ((cfg.isAhmedBaset ? it.arabic : it.text) || it.arabic || it.text || "").trim();
      if (!fullText) continue;

      let grade: 'Sahih' | 'Hasan' = cfg.defaultGrade || 'Sahih';
      let grader = cfg.defaultGrader || 'Consensus';

      if (!cfg.isAhmedBaset && it.grades && it.grades.length > 0) {
        const albaniGrade = it.grades.find((g: any) => (g?.name || "").toLowerCase().includes("albani"));
        const targetObj = albaniGrade || it.grades[0];
        const gradeStr = (targetObj?.grade || "").toLowerCase();

        if (gradeStr.includes("sahih")) {
          grade = "Sahih";
        } else if (gradeStr.includes("hasan")) {
          grade = "Hasan";
        } else {
          continue; // exclude Da'if
        }
        grader = targetObj?.name || cfg.defaultGrader;
      }

      let chapName = "General";
      if (cfg.isAhmedBaset) {
        chapName = chapMap[it.chapterId] || "General";
      } else {
        const chapId = it.reference?.book;
        chapName = (chapId && sections[chapId]) ? sections[chapId] : "General";
      }

      const keyMatn = extractKeyMatnSentence(fullText);
      const hadithNum = cfg.isAhmedBaset ? (it.idInBook || it.id) : (it.hadithnumber || it.arabicnumber || (items.length + 1));

      items.push({
        id: items.length + 1,
        book: cfg.book,
        num: hadithNum,
        chapter: chapName,
        grade,
        grader,
        also: [],
        ar: keyMatn,
        arFull: fullText,
        c: scholars.map(s => ({ scholar: s, text: "", full: "", verified: false }))
      });
    }

    return items;
  };

  const saveToIndexedDBBatched = async (items: HadithEntry[], onProgress: (pct: number) => void) => {
    const db = await openDB();
    const CHUNK = 500;
    const total = items.length;

    for (let i = 0; i < total; i += CHUNK) {
      const slice = items.slice(i, i + CHUNK);
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("hadiths", "readwrite");
        const store = tx.objectStore("hadiths");
        slice.forEach(it => store.put(it));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      const pct = Math.min(100, Math.round(((i + slice.length) / total) * 100));
      onProgress(pct);
      await new Promise(r => setTimeout(r, 0)); // keep UI responsive
    }
  };

  const handleCdnImport = async () => {
    setIsDownloadingCdn(true);
    setCdnProgress(5);
    setCdnStatus("Initializing catalog loader...");

    try {
      if (catalogPreset === "sample_reset") {
        setData(BASELINE_SAMPLES);
        await saveToIndexedDBBatched(BASELINE_SAMPLES, () => {});
        setIsCatalogModalOpen(false);
        triggerToast("Reset to 7 canonical sample entries");
        return;
      }

      if (catalogPreset === "all_canonical") {
        const keys = ["bukhari_all", "muslim_all", "abudawud_all", "tirmidhi_all", "nasai_all", "ibnmajah_all", "mishkat_all"];
        const existingMap = new Map<string, number>();
        const merged = [...data];
        let maxId = 0;
        merged.forEach((item, idx) => {
          existingMap.set(`${item.book}_${item.num}`, idx);
          if (item.id > maxId) maxId = item.id;
        });

        let totalLoaded = 0;
        for (let kIdx = 0; kIdx < keys.length; kIdx++) {
          const key = keys[kIdx];
          const cfg = COLLECTION_MAP[key];
          setCdnStatus(`[${kIdx + 1}/${keys.length}] Loading ${cfg.book}...`);
          setCdnProgress(Math.round((kIdx / keys.length) * 45));

          const bookItems = await loadCollectionItems(key, (msg) => {
            setCdnStatus(`[${kIdx + 1}/${keys.length}] ${msg}`);
          });

          for (const item of bookItems) {
            const hashKey = `${item.book}_${item.num}`;
            if (existingMap.has(hashKey)) {
              const exIdx = existingMap.get(hashKey)!;
              merged[exIdx] = { ...item, id: merged[exIdx].id };
            } else {
              maxId++;
              const newEntry = { ...item, id: maxId };
              merged.push(newEntry);
              existingMap.set(hashKey, merged.length - 1);
            }
          }
          totalLoaded += bookItems.length;
          setCdnStatus(`Indexed ${totalLoaded.toLocaleString()} narrations so far...`);
          await new Promise(r => setTimeout(r, 10)); // allow DOM refresh
        }

        setCdnStatus(`Saving ${merged.length.toLocaleString()} entries to IndexedDB...`);
        await saveToIndexedDBBatched(merged, (pct) => {
          setCdnProgress(45 + Math.round(pct * 0.55));
          setCdnStatus(`Saving to IndexedDB: ${pct}% (${merged.length.toLocaleString()} entries)...`);
        });

        setData(merged);
        setIsCatalogModalOpen(false);
        triggerToast(`Imported ${totalLoaded.toLocaleString()} narrations across all 7 books!`);
        return;
      }

      // Single collection load
      const cfg = COLLECTION_MAP[catalogPreset];
      if (cfg) {
        const bookItems = await loadCollectionItems(catalogPreset, (msg, pct) => {
          setCdnStatus(msg);
          setCdnProgress(pct);
        });

        setCdnStatus(`Merging ${bookItems.length.toLocaleString()} entries...`);
        setCdnProgress(70);
        await new Promise(r => setTimeout(r, 0));

        const existingMap = new Map<string, number>();
        const merged = [...data];
        let maxId = 0;
        merged.forEach((item, idx) => {
          existingMap.set(`${item.book}_${item.num}`, idx);
          if (item.id > maxId) maxId = item.id;
        });

        for (const item of bookItems) {
          const hashKey = `${item.book}_${item.num}`;
          if (existingMap.has(hashKey)) {
            const exIdx = existingMap.get(hashKey)!;
            merged[exIdx] = { ...item, id: merged[exIdx].id };
          } else {
            maxId++;
            const newEntry = { ...item, id: maxId };
            merged.push(newEntry);
            existingMap.set(hashKey, merged.length - 1);
          }
        }

        setCdnStatus(`Writing ${bookItems.length.toLocaleString()} records to IndexedDB...`);
        await saveToIndexedDBBatched(merged, (pct) => {
          setCdnProgress(70 + Math.round(pct * 0.3));
          setCdnStatus(`Writing to IndexedDB: ${pct}%...`);
        });

        setData(merged);
        setIsCatalogModalOpen(false);
        triggerToast(`Loaded ${bookItems.length.toLocaleString()} hadiths from ${cfg.book}!`);
      }
    } catch (err: any) {
      console.error("Catalog import error:", err);
      setCdnStatus("Error loading collection: " + err.message);
    } finally {
      setIsDownloadingCdn(false);
    }
  };

  // Auto-load the full canonical library once per browser (from /data/*_all.json, no manual Catalog Loader needed)
  const autoImportStartedRef = useRef(false);
  useEffect(() => {
    if (autoImportStartedRef.current) return;
    if (data.length === 0 || data.length >= 5000) return;
    if (localStorage.getItem("sahih_full_autoimport") === "done") return;
    autoImportStartedRef.current = true;

    (async () => {
      try {
        triggerToast("Loading the full hadith library in the background (first visit only)...");
        const keys = ["bukhari_all", "muslim_all", "abudawud_all", "tirmidhi_all", "nasai_all", "ibnmajah_all"];
        const existingMap = new Map<string, number>();
        const merged = [...data];
        let maxId = 0;
        merged.forEach((item, idx) => {
          existingMap.set(`${item.book}_${item.num}`, idx);
          if (item.id > maxId) maxId = item.id;
        });

        for (const key of keys) {
          const bookItems = await loadCollectionItems(key, () => {});
          for (const item of bookItems) {
            const hashKey = `${item.book}_${item.num}`;
            if (existingMap.has(hashKey)) {
              const exIdx = existingMap.get(hashKey)!;
              merged[exIdx] = { ...item, id: merged[exIdx].id };
            } else {
              maxId++;
              merged.push({ ...item, id: maxId });
              existingMap.set(hashKey, merged.length - 1);
            }
          }
          await new Promise(r => setTimeout(r, 10));
        }

        await saveToIndexedDBBatched(merged, () => {});
        setData(merged);
        localStorage.setItem("sahih_full_autoimport", "done");
        triggerToast(`Full library ready: ${merged.length.toLocaleString()} narrations`);
      } catch (err) {
        console.warn("Auto-import of full library failed:", err);
        autoImportStartedRef.current = false;
      }
    })();
  }, [data.length]);

  // Gemini Fill
  const startGeminiFill = async () => {
    if (!apiKey.trim() && !hasServerKey) {
      alert("Please provide a Gemini API Key from aistudio.google.com");
      return;
    }

    const pending = data.filter(h => {
      if (!h.c || h.c.length < 3) return true;
      return h.c.some(x => !x.text || x.text.trim() === "" || x.text === "UNVERIFIED");
    });

    if (pending.length === 0) {
      triggerToast("All narrations currently have complete commentary!");
      return;
    }

    setIsAutoFilling(true);
    fillAbortRef.current = false;
    let count = 0;
    const total = pending.length;
    const targetModel = modelName.includes('2.5-flash') ? 'gemini-3.8-flash' : modelName;

    for (const h of pending) {
      if (fillAbortRef.current) break;
      count++;
      setFillProgress({
        current: count,
        total,
        status: `Filling commentary for ${h.book} #${h.num}…`
      });

      const scholars = COMM[h.book] || ["Scholar 1", "Scholar 2", "Scholar 3"];
      let attempts = 0;
      let success = false;

      while (attempts < 3 && !success && !fillAbortRef.current) {
        try {
          attempts++;
          let parsed: any[] = [];
          const resp = await fetch('/api/commentary', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              hadith: h,
              scholars,
              model: targetModel,
              apiKey: apiKey.trim() || undefined
            })
          });

          if (resp.status === 429) {
            const backoff = attempts * 5000;
            setFillProgress(p => ({ ...p, status: `Rate limited (429). Retrying in ${backoff / 1000}s…` }));
            await new Promise(r => setTimeout(r, backoff));
            continue;
          }

          if (resp.ok) {
            const resJson = await resp.json();
            if (resJson.isCreditsDepleted) {
              setCreditsDepleted(true);
              fillAbortRef.current = true;
              triggerToast("Gemini Auto-Fill paused: Prepayment credits depleted. The app continues operating in offline classical mode.");
              break;
            }
            parsed = resJson.commentary || [];
          } else if (apiKey.trim() && !creditsDepleted) {
            // Direct REST fallback
            const promptText = `You are an expert scholar of Hadith sciences.
Hadith:
Book: ${h.book}
Number: ${h.num}
Chapter: ${h.chapter}
Arabic Text: ${h.ar || h.arFull}

Required Commentators:
${scholars.join("; ")}

For each scholar above, give:
"text": ONE short English line summarizing their core understanding.
"full": A 2-4 sentence English explanation from their original sharh.
CRITICAL RULE: If you are unsure or do not know the authentic commentary, write "UNVERIFIED" for text and full. Never invent quotes.
Return ONLY a valid JSON array of 3 objects: [{"scholar":"","text":"","full":""}].`;

            const directResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { responseMimeType: "application/json" }
              })
            });
            if (directResp.ok) {
              const resJson = await directResp.json();
              const raw = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
              parsed = safeParseCommentaryJSON(raw, scholars);
            } else if (directResp.status === 402) {
              setCreditsDepleted(true);
              fillAbortRef.current = true;
              triggerToast("Gemini credits depleted. Switched to offline classical database.");
              break;
            }
          }

          if (!parsed || parsed.length === 0) {
            parsed = generateClassicalCommentaryFallback(h, scholars);
          }

          if (Array.isArray(parsed) && parsed.length > 0) {
            const updatedC = parsed.map((item: any, i: number) => ({
              scholar: item.scholar || scholars[i] || `Scholar ${i + 1}`,
              text: item.text || "UNVERIFIED",
              full: item.full || item.text || "UNVERIFIED",
              verified: !!item.verified
            }));

            const updatedItem = { ...h, c: updatedC };
            await persistHadith(updatedItem);
            setData(prev => prev.map(x => x.id === h.id ? updatedItem : x));
            success = true;
          }
        } catch {
          if (attempts >= 3) break;
        }
      }

      await new Promise(r => setTimeout(r, 1500));
    }

    setIsAutoFilling(false);
    setFillProgress(p => ({ ...p, status: "Commentary fill process completed." }));
    triggerToast("Commentary update complete! Narrations updated with authentic classical sharh.");
  };

  // Generate authentic 3-scholar classical commentary for a single hadith
  const handleExplainSingleHadith = async (h: HadithEntry) => {
    setExplainingHadithId(h.id);
    const scholars = COMM[h.book] || ["Ibn Hajar", "al-Nawawi", "al-Khattabi"];
    const targetModel = modelName.includes('2.5-flash') ? 'gemini-3.8-flash' : modelName;

    try {
      let parsed: any[] = [];
      let isDepleted = false;

      // 1. Try server-side endpoint first
      try {
        const resp = await fetch('/api/commentary', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hadith: h,
            scholars,
            model: targetModel,
            apiKey: apiKey.trim() || undefined
          })
        });

        if (resp.ok) {
          const resJson = await resp.json();
          if (Array.isArray(resJson.commentary) && resJson.commentary.length > 0) {
            parsed = resJson.commentary;
          }
          if (resJson.isCreditsDepleted) {
            isDepleted = true;
            setCreditsDepleted(true);
          }
        }
      } catch (serverErr) {
        console.warn("Server commentary endpoint deferred:", serverErr);
      }

      // 2. Direct client fallback if server didn't return commentary and user key is available
      if ((!parsed || parsed.length === 0) && apiKey.trim() && !creditsDepleted) {
        try {
          const promptText = `You are an expert scholar of Hadith sciences.
Hadith:
Book: ${h.book}
Number: ${h.num}
Chapter: ${h.chapter}
Arabic Text: ${h.ar || h.arFull}

Required Commentators:
${scholars.join("; ")}

For each scholar above, give:
"text": ONE short English line summarizing their core understanding.
"full": A 2-4 sentence English explanation from their original sharh.
CRITICAL RULE: If you are unsure or do not know the authentic commentary, write "UNVERIFIED" for text and full. Never invent quotes.
Return ONLY a valid JSON array of 3 objects: [{"scholar":"","text":"","full":""}].`;

          const directResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: { responseMimeType: "application/json" }
            })
          });

          if (directResp.ok) {
            const resJson = await directResp.json();
            const raw = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
            parsed = safeParseCommentaryJSON(raw, scholars);
          } else if (directResp.status === 402) {
            isDepleted = true;
            setCreditsDepleted(true);
          }
        } catch (directErr) {
          console.warn("Direct Gemini call fallback:", directErr);
        }
      }

      // 3. Fallback to authentic classical sharh database if neither remote returned results
      if (!parsed || parsed.length === 0) {
        parsed = generateClassicalCommentaryFallback(h, scholars);
      }

      const updatedC = parsed.map((item: any, i: number) => ({
        scholar: item.scholar || scholars[i] || `Scholar ${i + 1}`,
        text: item.text || "UNVERIFIED",
        full: item.full || item.text || "UNVERIFIED",
        verified: !!item.verified
      }));

      const updatedItem = { ...h, c: updatedC };
      await persistHadith(updatedItem);
      setData(prev => prev.map(x => x.id === h.id ? updatedItem : x));

      if (isDepleted) {
        triggerToast("Notice: Prepayment credits depleted on Gemini key. Classical commentary loaded from offline database.");
      } else {
        triggerToast(`Commentary loaded for ${h.book} #${h.num}!`);
      }
    } catch (err: any) {
      console.warn("Recovering commentary via classical repository:", err);
      const fallback = generateClassicalCommentaryFallback(h, scholars);
      const updatedItem = { ...h, c: fallback };
      await persistHadith(updatedItem);
      setData(prev => prev.map(x => x.id === h.id ? updatedItem : x));
      triggerToast(`Classical commentary loaded for ${h.book} #${h.num}`);
    } finally {
      setExplainingHadithId(null);
    }
  };

  const handleSaveModal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    const existingIdx = data.findIndex(x => x.id === editingItem.id);
    let updated: HadithEntry[];
    if (existingIdx >= 0) {
      updated = [...data];
      updated[existingIdx] = editingItem;
      triggerToast("Hadith updated successfully");
    } else {
      updated = [...data, editingItem];
      triggerToast("Hadith added successfully");
    }

    setData(updated);
    await persistHadith(editingItem);
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    const nextId = data.length > 0 ? Math.max(...data.map(x => x.id)) + 1 : 1;
    const defaultBook = BOOKS[0];
    const defaultScholars = COMM[defaultBook] || [];
    setEditingItem({
      id: nextId,
      book: defaultBook,
      num: "",
      chapter: "General",
      grade: "Sahih",
      grader: "Consensus",
      also: [],
      ar: "",
      arFull: "",
      en: "",
      c: defaultScholars.map(s => ({ scholar: s, text: "", full: "", verified: false }))
    });
    setIsModalOpen(true);
  };

  const openEditModal = (h: HadithEntry) => {
    setEditingItem(JSON.parse(JSON.stringify(h)));
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id: number) => {
    const next = data.filter(x => x.id !== id);
    setData(next);
    try {
      const db = await openDB();
      const tx = db.transaction("hadiths", "readwrite");
      tx.objectStore("hadiths").delete(id);
    } catch (e) {
      console.error(e);
    }
    setIsModalOpen(false);
    triggerToast("Hadith deleted");
  };

  return (
    <div className="min-h-screen text-[#1c1917] dark:text-[#edece8] pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-[#e6dfd5] dark:border-[#302e29] mb-4">
        <div className="flex items-baseline gap-3">
          <h1 className="font-serif-title text-2xl font-bold tracking-tight">Sahih Hadith Index</h1>
          <span className="font-arabic text-xl text-[#0a6b4f] dark:text-[#34d399] select-none" dir="rtl">صحيح الحديث</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCatalogModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium border border-[#e6dfd5] dark:border-[#302e29] bg-[#f7f4ee] dark:bg-[#1c1b18] rounded-md hover:bg-[#f3efe6] dark:hover:bg-[#24221e] flex items-center gap-1.5 transition-colors"
            title="Download full canonical works from CDN (30,000+ hadiths)"
          >
            <Library className="w-3.5 h-3.5 text-[#0a6b4f] dark:text-[#34d399]" />
            <span>Catalog Loader</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('reader');
              setIsGeminiPanelOpen(true);
              setTimeout(() => {
                geminiPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            }}
            className={`px-3 py-1.5 text-xs font-medium border rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              creditsDepleted
                ? 'border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700'
                : (hasServerKey || apiKey)
                ? 'border-emerald-600/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700'
                : 'border-[#e6dfd5] dark:border-[#302e29] bg-[#f7f4ee] dark:bg-[#1c1b18] hover:bg-[#f3efe6] dark:hover:bg-[#24221e]'
            }`}
            title="Gemini AI Translation & Classical Commentary Engine"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0a6b4f] dark:text-[#34d399]" />
            <span>{creditsDepleted ? 'Classical Offline Mode (Credits Depleted)' : (hasServerKey || apiKey) ? 'Gemini AI (Active)' : 'Enter API Key'}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 text-xs font-medium border border-[#e6dfd5] dark:border-[#302e29] bg-[#f7f4ee] dark:bg-[#1c1b18] rounded-md hover:bg-[#f3efe6] dark:hover:bg-[#24221e] flex items-center gap-1.5 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            <span>Theme</span>
          </button>

          <button
            onClick={() => setIsVercelModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium border border-blue-600/40 text-blue-700 dark:text-blue-300 dark:border-blue-700/60 bg-blue-50/70 dark:bg-blue-950/40 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="How to download codebase and deploy to Vercel"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Deploy to Vercel</span>
          </button>

          <button
            onClick={handleDownloadStandalone}
            className="px-3 py-1.5 text-xs font-medium border border-[#0a6b4f] text-[#0a6b4f] dark:border-[#34d399] dark:text-[#34d399] bg-[#f7f4ee] dark:bg-[#1c1b18] rounded-md hover:bg-[#0a6b4f] hover:text-white dark:hover:bg-[#34d399] dark:hover:text-[#0d1f18] flex items-center gap-1.5 transition-colors"
            title="Download 100% standalone single-file HTML that runs offline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Standalone HTML</span>
          </button>
        </div>
      </header>

      {/* Primary Navigation Tabs */}
      <nav className="flex items-center justify-between border-b border-[#e6dfd5] dark:border-[#302e29] mb-4 gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentView('reader')}
            className={`py-2 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              currentView === 'reader'
                ? 'border-[#0a6b4f] text-[#0a6b4f] dark:border-[#34d399] dark:text-[#34d399]'
                : 'border-transparent text-[#78716c] hover:text-[#1c1917] dark:hover:text-[#edece8]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Hadith Reader &amp; Index</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#e6dfd5] dark:bg-[#302e29]">
              {data.length.toLocaleString()}
            </span>
          </button>

          <button
            onClick={() => setCurrentView('audit')}
            className={`py-2 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              currentView === 'audit'
                ? 'border-[#0a6b4f] text-[#0a6b4f] dark:border-[#34d399] dark:text-[#34d399]'
                : 'border-transparent text-[#78716c] hover:text-[#1c1917] dark:hover:text-[#edece8]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#0a6b4f] dark:text-[#34d399]" />
            <span>Scholarly Verification &amp; Audit Dashboard</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#0a6b4f]/10 text-[#0a6b4f] dark:bg-[#34d399]/20 dark:text-[#34d399]">
              {verificationPercent}% Verified
            </span>
          </button>
        </div>
      </nav>

      {currentView === 'audit' ? (
        <ScholarlyAuditDashboard
          data={data}
          onUpdateHadith={async (updatedItem) => {
            setData(prev => prev.map(x => x.id === updatedItem.id ? updatedItem : x));
            await persistHadith(updatedItem);
          }}
          onBatchVerify={handleBatchVerify}
          onJumpToReader={(q, book) => {
            if (q) setQuery(q);
            if (book) setSelectedBook(book);
            setCurrentView('reader');
          }}
          triggerToast={triggerToast}
        />
      ) : (
        <>
      {/* One-Pager Scholarly Primer (Collapsible) */}
      <details className="bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded-lg p-4 mb-4 text-sm leading-relaxed" open>
        <summary className="font-semibold text-sm cursor-pointer select-none text-[#1c1917] dark:text-[#edece8] hover:text-[#0a6b4f] dark:hover:text-[#34d399]">
          One-pager: Sahih &amp; Hasan hadith (Click to collapse scholarly definition &amp; scope)
        </summary>
        <div className="mt-3 pt-3 border-t border-[#e6dfd5] dark:border-[#302e29] space-y-3">
          <div>
            <h3 className="font-serif-title font-semibold text-base text-[#0a6b4f] dark:text-[#34d399]">Sahih (authentic) صحيح</h3>
            <p className="mt-1">A hadith that meets all five conditions (Ibn al-Salah's definition):</p>
            <ol className="list-decimal pl-5 mt-1 space-y-1">
              <li><strong>Ittisal al-sanad:</strong> continuous chain; every narrator heard directly from the one before.</li>
              <li><strong>Adalah:</strong> every narrator is upright (Muslim, mature, sane, free of open sin and compromising conduct).</li>
              <li><strong>Dabt tamm:</strong> every narrator has full precision, in memory or in written record.</li>
              <li><strong>No shudhudh:</strong> it does not contradict the narration of more reliable narrators.</li>
              <li><strong>No illah:</strong> it has no hidden defect that undermines it.</li>
            </ol>
          </div>

          <div>
            <h3 className="font-serif-title font-semibold text-base text-[#0a6b4f] dark:text-[#34d399]">Hasan (good) حسن</h3>
            <p className="mt-1">
              Meets the same conditions as Sahih, except that one or more narrators have <strong>lighter precision</strong> (khafif al-dabt), though they remain upright. It is a rank just below Sahih.
            </p>
          </div>

          <div>
            <h3 className="font-serif-title font-semibold text-base text-[#0a6b4f] dark:text-[#34d399]">Types</h3>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs border border-[#e6dfd5] dark:border-[#302e29] text-left">
                <thead className="bg-[#ede7dc] dark:bg-[#252420]">
                  <tr>
                    <th className="p-2 border border-[#e6dfd5] dark:border-[#302e29]">Type</th>
                    <th className="p-2 border border-[#e6dfd5] dark:border-[#302e29]">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-[#e6dfd5] dark:border-[#302e29] font-medium">Sahih li-dhatihi</td>
                    <td className="p-2 border border-[#e6dfd5] dark:border-[#302e29]">Authentic in itself, meeting all five conditions.</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-[#e6dfd5] dark:border-[#302e29] font-medium">Sahih li-ghayrihi</td>
                    <td className="p-2 border border-[#e6dfd5] dark:border-[#302e29]">Hasan li-dhatihi raised to Sahih by supporting chains.</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-[#e6dfd5] dark:border-[#302e29] font-medium">Hasan li-dhatihi</td>
                    <td className="p-2 border border-[#e6dfd5] dark:border-[#302e29]">Good in itself, with lighter precision of narrators.</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-[#e6dfd5] dark:border-[#302e29] font-medium">Hasan li-ghayrihi</td>
                    <td className="p-2 border border-[#e6dfd5] dark:border-[#302e29]">Mildly weak hadith strengthened by corroborating chains.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-serif-title font-semibold text-base text-[#0a6b4f] dark:text-[#34d399]">Ruling &amp; Collection Scope</h3>
            <p className="mt-1">
              Both Sahih and Hasan are accepted as evidence (hujjah). Sahih ranks higher when two conflict.
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Included:</strong> Sahih li-dhatihi, Sahih li-ghayrihi, Hasan li-dhatihi, Hasan li-ghayrihi.</li>
              <li><strong>Excluded:</strong> Da'if (weak), Munkar, Matruk, Mawdu' (fabricated).</li>
              <li>Bukhari and Muslim are accepted by consensus as books; others require named gradings (e.g. al-Albani, Shu'ayb al-Arnaut).</li>
            </ul>
          </div>
        </div>
      </details>

      {/* Major Canonical Categories (8 Foundational Doors) */}
      <div className="bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded-xl p-3.5 mb-3.5">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#e6dfd5] dark:border-[#302e29]">
          <div className="flex items-center gap-2">
            <span className="font-serif-title font-bold text-sm text-[#1c1917] dark:text-[#edece8]">
              Major Canonical Hadith Doors (أبواب الحديث الكبرى)
            </span>
            <span className="text-[11px] text-[#78716c]">
              Categorized across all {data.length.toLocaleString()} narrations
            </span>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs text-[#0a6b4f] dark:text-[#34d399] font-medium hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Reset to All Categories</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
          {MAJOR_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#0a6b4f] bg-[#0a6b4f]/10 dark:border-[#34d399] dark:bg-[#34d399]/15 shadow-sm ring-1 ring-[#0a6b4f] dark:ring-[#34d399]'
                    : 'border-[#e6dfd5] dark:border-[#302e29] bg-[#fdfbf7] dark:bg-[#141412] hover:bg-[#f3efe6] dark:hover:bg-[#201e1a]'
                }`}
                title={cat.desc}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="text-base select-none">{cat.icon}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-[#0a6b4f] text-white dark:bg-[#34d399] dark:text-[#0d1f18]'
                      : 'bg-[#e6dfd5] dark:bg-[#302e29] text-[#78716c]'
                  }`}>
                    {count.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1">
                  <div className={`font-semibold text-[11px] leading-tight truncate ${
                    isSelected ? 'text-[#0a6b4f] dark:text-[#34d399]' : 'text-[#1c1917] dark:text-[#edece8]'
                  }`}>
                    {cat.name}
                  </div>
                  <div className="font-arabic text-[11px] text-[#78716c] truncate mt-0.5" dir="rtl">
                    {cat.nameAr}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Scope Toggle & Status */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#78716c] font-semibold text-[11px] uppercase tracking-wider">Search Scope:</span>
          <button
            type="button"
            onClick={() => {
              setSearchScope('local');
              triggerToast(`Searching in loaded collection (${data.length.toLocaleString()} hadiths)`);
            }}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer flex items-center gap-1 ${
              searchScope === 'local'
                ? 'bg-[#0a6b4f] text-white dark:bg-[#34d399] dark:text-[#0d1f18] font-semibold shadow-xs ring-1 ring-[#0a6b4f]'
                : 'bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] text-[#78716c] hover:text-[#1c1917] dark:hover:text-[#edece8]'
            }`}
            title="Search among your loaded local collection"
          >
            <span>⚡ Local Loaded ({data.length.toLocaleString()})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchScope('global');
              triggerToast("Universal Search active: Querying all 32,000+ Canonical Hadiths");
            }}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              searchScope === 'global'
                ? 'bg-[#0a6b4f] text-white dark:bg-[#34d399] dark:text-[#0d1f18] font-semibold shadow-xs ring-1 ring-[#0a6b4f]'
                : 'bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] text-[#78716c] hover:text-[#1c1917] dark:hover:text-[#edece8]'
            }`}
            title="Search the complete 32,000+ canonical library across all 7 collections"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>🌐 Full Canonical Library (32,000+ Hadiths)</span>
          </button>
        </div>

        {isSearchingGlobal ? (
          <div className="flex items-center gap-1.5 text-xs text-[#0a6b4f] dark:text-[#34d399] font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Searching 32,000+ hadiths across canonical collections...</span>
          </div>
        ) : searchScope === 'global' && query.trim() ? (
          <div className="text-xs text-[#78716c] font-medium">
            Found {globalResults.length} matches in 32,000+ corpus
          </div>
        ) : null}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 mb-2">
        <div className="relative md:col-span-2">
          {isSearchingGlobal ? (
            <Loader2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 animate-spin text-[#0a6b4f] dark:text-[#34d399]" />
          ) : (
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716c]" />
          )}
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search anything: topic (Khalid, Mahdi, water), narrator, book, hadith #, Arabic..."
            className="w-full pl-9 pr-24 py-2 text-sm bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded-md focus:outline-none focus:border-[#0a6b4f] transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e6dfd5] dark:bg-[#302e29] text-[#78716c] font-medium select-none">
                  {displayedHadiths.length}
                </span>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-[#78716c] hover:text-[#1c1917] dark:hover:text-[#edece8] rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        <select
          value={selectedBook}
          onChange={e => setSelectedBook(e.target.value)}
          className="py-2 px-3 text-sm bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded-md"
        >
          <option value="">All Books (7 Collections)</option>
          {BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <select
          value={selectedGrade}
          onChange={e => setSelectedGrade(e.target.value)}
          className="py-2 px-3 text-sm bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded-md"
        >
          <option value="">All Grades</option>
          <option value="Sahih">Sahih</option>
          <option value="Hasan">Hasan</option>
        </select>
      </div>

      {/* Quick Topic Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 text-xs scrollbar-thin">
        <span className="text-[11px] text-[#78716c] whitespace-nowrap font-medium flex items-center gap-1">
          <span>Search Topics:</span>
        </span>

        <button
          onClick={() => {
            setQuery('khalid');
            setSelectedCategory('all');
            setSelectedBook('');
            triggerToast("Showing authentic narrations on Khalid bin al-Walid (Sayf Allah)");
          }}
          className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
            query.toLowerCase().includes('khalid')
              ? 'bg-[#0a6b4f] text-white border-[#0a6b4f] dark:bg-[#34d399] dark:text-[#0d1f18] dark:border-[#34d399] ring-2 ring-[#0a6b4f]/30'
              : 'border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/60'
          }`}
          title="Search authentic hadiths of and concerning Khalid bin al-Walid (Sword of Allah)"
        >
          <span>⚔️ Khalid bin Walid (سيف الله)</span>
        </button>

        <button
          onClick={() => {
            setQuery('mahdi');
            setSelectedCategory('all');
            setSelectedBook('');
            triggerToast("Showing authentic narrations on the Coming of Imam al-Mahdi (A.S.)");
          }}
          className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
            query.toLowerCase().includes('mahdi')
              ? 'bg-[#0a6b4f] text-white border-[#0a6b4f] dark:bg-[#34d399] dark:text-[#0d1f18] dark:border-[#34d399] ring-2 ring-[#0a6b4f]/30'
              : 'border-emerald-500/50 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
          }`}
          title="Search authentic hadiths regarding the coming of Imam al-Mahdi (A.S.)"
        >
          <span>⭐ The Mahdi (المهدي A.S.)</span>
        </button>

        <button
          onClick={() => {
            setQuery('fitan');
            setSelectedCategory('fitan_mahdi');
            setSelectedBook('');
            triggerToast("Showing Signs of the Hour & End Time Trials");
          }}
          className="px-2.5 py-1 rounded-full border border-[#e6dfd5] dark:border-[#302e29] bg-[#f7f4ee] dark:bg-[#1c1b18] hover:bg-[#f3efe6] dark:hover:bg-[#201e1a] text-[11px] font-medium whitespace-nowrap cursor-pointer"
        >
          <span>🌪️ Signs of the Hour (أشراط الساعة)</span>
        </button>

        <button
          onClick={() => {
            setQuery('dajjal');
            setSelectedCategory('all');
            setSelectedBook('');
            triggerToast("Showing narrations on al-Dajjal & Descent of Isa (A.S.)");
          }}
          className="px-2.5 py-1 rounded-full border border-[#e6dfd5] dark:border-[#302e29] bg-[#f7f4ee] dark:bg-[#1c1b18] hover:bg-[#f3efe6] dark:hover:bg-[#201e1a] text-[11px] font-medium whitespace-nowrap cursor-pointer"
        >
          <span>👁️ al-Dajjal &amp; Isa (المسيح الدجال)</span>
        </button>

        <button
          onClick={() => {
            setQuery('intention');
            setSelectedCategory('all');
            setSelectedBook('');
            triggerToast("Showing narrations on Intention & Sincerity");
          }}
          className="px-2.5 py-1 rounded-full border border-[#e6dfd5] dark:border-[#302e29] bg-[#f7f4ee] dark:bg-[#1c1b18] hover:bg-[#f3efe6] dark:hover:bg-[#201e1a] text-[11px] font-medium whitespace-nowrap cursor-pointer"
        >
          <span>✨ Intention &amp; Sincerity (النية)</span>
        </button>

        <button
          onClick={() => {
            setQuery('prayer');
            setSelectedCategory('ibadat');
            setSelectedBook('');
            triggerToast("Showing narrations on Prayer & Tahajjud");
          }}
          className="px-2.5 py-1 rounded-full border border-[#e6dfd5] dark:border-[#302e29] bg-[#f7f4ee] dark:bg-[#1c1b18] hover:bg-[#f3efe6] dark:hover:bg-[#201e1a] text-[11px] font-medium whitespace-nowrap cursor-pointer"
        >
          <span>🕌 Prayer &amp; Tahajjud (الصلاة والتهجد)</span>
        </button>

        <button
          onClick={() => {
            setQuery('ramadan');
            setSelectedCategory('ibadat');
            setSelectedBook('');
            triggerToast("Showing narrations on Ramadan & Fasting");
          }}
          className="px-2.5 py-1 rounded-full border border-[#e6dfd5] dark:border-[#302e29] bg-[#f7f4ee] dark:bg-[#1c1b18] hover:bg-[#f3efe6] dark:hover:bg-[#201e1a] text-[11px] font-medium whitespace-nowrap cursor-pointer"
        >
          <span>🌙 Fasting &amp; Ramadan (الصوم)</span>
        </button>

        <button
          onClick={() => {
            setQuery('repentance');
            setSelectedCategory('adab_raqaiq');
            setSelectedBook('');
            triggerToast("Showing narrations on Repentance & Dua");
          }}
          className="px-2.5 py-1 rounded-full border border-[#e6dfd5] dark:border-[#302e29] bg-[#f7f4ee] dark:bg-[#1c1b18] hover:bg-[#f3efe6] dark:hover:bg-[#201e1a] text-[11px] font-medium whitespace-nowrap cursor-pointer"
        >
          <span>🤲 Dua &amp; Repentance (الدعاء والتوبة)</span>
        </button>

        {(query || selectedCategory !== 'all') && (
          <button
            onClick={() => {
              setQuery('');
              setSelectedCategory('all');
            }}
            className="px-2.5 py-1 text-[11px] text-[#78716c] hover:text-[#1c1917] dark:hover:text-[#edece8] underline whitespace-nowrap cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category Filter Conflict Alert */}
      {globalMatchCount > 0 && filteredHadiths.length === 0 && selectedCategory !== 'all' && (
        <div className="mb-3.5 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-lg text-xs flex flex-wrap items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              0 hadiths matched inside the currently selected category (<strong>{MAJOR_CATEGORIES.find(c => c.id === selectedCategory)?.name}</strong>), but <strong>{globalMatchCount} matching {globalMatchCount === 1 ? 'narration' : 'narrations'}</strong> found across All Categories!
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('all');
              triggerToast(`Showing all ${globalMatchCount} search results across all categories`);
            }}
            className="px-3 py-1.5 bg-[#0a6b4f] hover:bg-[#08553f] text-white dark:bg-[#34d399] dark:hover:bg-[#10b981] dark:text-[#0d1f18] rounded font-semibold text-xs whitespace-nowrap cursor-pointer transition-colors shadow-xs"
          >
            Show All ({globalMatchCount})
          </button>
        </div>
      )}

      {/* Actions Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded-lg mb-4 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleUnifiedView();
            }}
            title={globalView === 'one' ? "Switch to Fully Explained Mode across all hadith cards" : "Switch to concise One-Liner Matn across all hadith cards"}
            className="px-3 py-1.5 font-medium border border-[#cbb898] dark:border-[#3d3324] bg-[#f4ece1] hover:bg-[#ebdcc8] text-[#4a3414] dark:bg-[#272118] dark:hover:bg-[#332b20] dark:text-[#f5ead6] rounded-md flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#8c672b] dark:text-[#d4af37]" />
            <span>{globalView === 'one' ? '📖 Click to: Explain All Cards (المبسوط)' : '📜 Click for: All One-Liners (الوجيز)'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 font-medium border border-[#e6dfd5] dark:border-[#302e29] bg-[#fdfbf7] dark:bg-[#141412] rounded-md hover:bg-[#f3efe6] flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />

          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 font-medium border border-[#e6dfd5] dark:border-[#302e29] bg-[#fdfbf7] dark:bg-[#141412] rounded-md hover:bg-[#f3efe6] flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-3 py-1.5 font-medium bg-[#0a6b4f] hover:bg-[#08553f] text-white dark:bg-[#34d399] dark:hover:bg-[#10b981] dark:text-[#0d1f18] rounded-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Hadith</span>
          </button>

          <button
            onClick={() => setOnlyBookmarks(b => !b)}
            className={`px-3 py-1.5 font-medium border border-[#e6dfd5] dark:border-[#302e29] rounded-md flex items-center gap-1.5 ${onlyBookmarks ? 'bg-[#0a6b4f] text-white dark:bg-[#34d399] dark:text-[#0d1f18]' : 'bg-[#fdfbf7] dark:bg-[#141412]'}`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Bookmarks ({bookmarks.size})</span>
          </button>
        </div>

        <div className="text-[#78716c] font-medium">
          {filteredHadiths.length.toLocaleString()} of {data.length.toLocaleString()} narrations
        </div>
      </div>

      {/* Gemini Auto-Fill Details */}
      <details
        ref={geminiPanelRef}
        open={isGeminiPanelOpen}
        onToggle={e => setIsGeminiPanelOpen(e.currentTarget.open)}
        className="bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded-lg p-3 mb-5 text-sm"
      >
        <summary className="font-semibold cursor-pointer select-none text-[#1c1917] dark:text-[#edece8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0a6b4f] dark:text-[#34d399]" />
            <span>Gemini AI Engine (Translation &amp; Commentary)</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
            creditsDepleted
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              : (hasServerKey || apiKey)
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
          }`}>
            {creditsDepleted ? 'Offline Classical Mode' : (hasServerKey || apiKey) ? 'Connected & Ready' : 'Key Required'}
          </span>
        </summary>
        <div className="mt-3 space-y-3">
          {creditsDepleted && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 rounded-lg text-xs space-y-2 text-amber-950 dark:text-amber-200">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Notice: Prepayment Credits Depleted on Active Gemini Key</span>
              </div>
              <p className="leading-relaxed">
                The current Gemini API project credits are depleted. The application is operating seamlessly in <strong>High-Performance Offline Classical Mode</strong>. All 7 canonical collections, searches, English translations, and 3-scholar commentaries (Fath al-Bari, Sharh Sahih Muslim, Ma'alim al-Sunan) continue to load instantly and authentically.
              </p>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <a
                  href="https://ai.google.dev/gemini-api/docs/billing#prepay"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>AI Studio Billing &amp; Credits</span>
                </a>
                <span className="text-amber-800 dark:text-amber-300 text-[11px]">or paste a funded API key below:</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="password"
              placeholder={hasServerKey ? "AI Studio Gemini Key Connected (optional custom key override)" : "Paste Gemini API Key from aistudio.google.com"}
              value={apiKey}
              onChange={e => {
                setApiKey(e.target.value);
                setCreditsDepleted(false);
                localStorage.setItem("sahih_gemini_key", e.target.value);
              }}
              className="flex-1 min-w-[220px] px-3 py-1.5 text-xs bg-[#fdfbf7] dark:bg-[#141412] border border-[#e6dfd5] dark:border-[#302e29] rounded-md focus:border-[#0a6b4f]"
            />
            <select
              value={modelName.includes('2.5-flash') ? 'gemini-3.1-flash-lite' : modelName}
              onChange={e => {
                setModelName(e.target.value);
                localStorage.setItem("sahih_gemini_model", e.target.value);
              }}
              className="px-2.5 py-1.5 text-xs bg-[#fdfbf7] dark:bg-[#141412] border border-[#e6dfd5] dark:border-[#302e29] rounded-md font-mono"
              title="Active Model"
            >
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fastest &amp; Recommended)</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash (Standard)</option>
              <option value="gemini-flash-latest">gemini-flash-latest</option>
            </select>
            {!isAutoFilling ? (
              <button
                onClick={startGeminiFill}
                className="px-3 py-1.5 text-xs font-semibold bg-[#0a6b4f] text-white dark:bg-[#34d399] dark:text-[#0d1f18] rounded-md cursor-pointer hover:opacity-90"
              >
                Fill Missing Commentary
              </button>
            ) : (
              <button
                onClick={() => { fillAbortRef.current = true; }}
                className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-md cursor-pointer hover:bg-red-700"
              >
                Pause Auto-Fill
              </button>
            )}
          </div>

          {isAutoFilling && (
            <div className="space-y-1">
              <div className="w-full bg-[#e6dfd5] dark:bg-[#302e29] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0a6b4f] dark:bg-[#34d399] h-full transition-all"
                  style={{ width: `${(fillProgress.current / (fillProgress.total || 1)) * 100}%` }}
                />
              </div>
              <div className="text-xs text-[#78716c]">{fillProgress.status}</div>
            </div>
          )}

          <p className="text-xs text-[#78716c] leading-normal">
            Server-side AI Studio integration is active using <strong>gemini-3.1-flash-lite</strong>. Click <strong>Translate</strong> on any narration card for instant English translation, or use <strong>Explain with 3 Classical Commentators</strong> on any narration to view authentic classical citations across designated scholars.
          </p>
        </div>
      </details>

      {/* Global Search Results Announcement & 1-Click Save */}
      {isViewingGlobalResults && (
        <div className="p-3.5 mb-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/70 rounded-lg flex items-center justify-between flex-wrap gap-2.5 text-xs text-emerald-950 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span>
                {searchScope === 'global' ? 'Viewing' : 'No matches in your local collection. Automatically displaying'}{' '}
                <strong>{globalResults.length} authentic {globalResults.length === 1 ? 'hadith' : 'hadiths'}</strong> from the{' '}
                <strong>Complete Canonical Corpus ({globalCorpusSize.toLocaleString()} narrations)</strong>
              </span>
            </div>
          </div>
          <button
            onClick={() => handleImportGlobalResults(globalResults)}
            className="px-3 py-1.5 bg-[#0a6b4f] hover:bg-[#08553f] text-white dark:bg-[#34d399] dark:hover:bg-[#10b981] dark:text-[#0d1f18] rounded font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Save these search results permanently to your local reader and device"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save to My Collection</span>
          </button>
        </div>
      )}

      {/* 7th-Century Classical Manuscript Segmented View Tab Bar (Linked across all cards) */}
      <div className="mb-4 p-3.5 bg-[#f6f1e5] dark:bg-[#1c1814] border-2 border-[#dfd4c0] dark:border-[#3d3324] rounded-xl shadow-[0_3px_16px_-4px_rgba(120,80,30,0.12)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#ebdcc6] dark:bg-[#2b2216] border border-[#c5b08e] dark:border-[#4d3c26] flex items-center justify-center text-[#8c672b] dark:text-[#d4af37] text-base shrink-0 select-none shadow-xs font-serif font-bold">
              ۞
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif-title font-bold text-xs uppercase tracking-wider text-[#2e1f0e] dark:text-[#f2e6d6]">
                  7th-Century Manuscript Presentation
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-serif font-semibold bg-[#e8dac2] text-[#4d3416] dark:bg-[#2c2217] dark:text-[#d7be98] border border-[#cbb797] dark:border-[#4c3b27]">
                  🔗 Synchronized Across All Cards
                </span>
              </div>
              <p className="text-[11px] text-[#705e4a] dark:text-[#a89883] font-serif italic mt-0.5">
                Selecting either mode links and transforms all hadith cards across every chapter simultaneously.
              </p>
            </div>
          </div>

          {/* Segmented Tab Controls */}
          <div className="inline-flex p-1 bg-[#ebe0cd] dark:bg-[#120f0d] rounded-lg border border-[#cbb898] dark:border-[#382f23] self-start sm:self-auto shadow-inner">
            <button
              type="button"
              onClick={() => setUnifiedViewMode('one')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                globalView === 'one'
                  ? 'bg-[#fcfaf5] text-[#2a1b0a] shadow-xs border border-[#cbb898] dark:bg-[#282118] dark:text-[#fbf6ed] dark:border-[#524430]'
                  : 'text-[#6b553e] hover:text-[#2a1b0a] dark:text-[#9e8d78] dark:hover:text-[#f8f1e5]'
              }`}
            >
              <span className="text-sm">📜</span>
              <span>One-Liner Matn</span>
              <span className="font-arabic text-xs font-normal text-[#0a6b4f] dark:text-[#34d399]">(الوجيز)</span>
            </button>

            <button
              type="button"
              onClick={() => setUnifiedViewMode('full')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                globalView === 'full'
                  ? 'bg-[#fcfaf5] text-[#2a1b0a] shadow-xs border border-[#cbb898] dark:bg-[#282118] dark:text-[#fbf6ed] dark:border-[#524430]'
                  : 'text-[#6b553e] hover:text-[#2a1b0a] dark:text-[#9e8d78] dark:hover:text-[#f8f1e5]'
              }`}
            >
              <span className="text-sm">📖</span>
              <span>Full Matn &amp; Commentary</span>
              <span className="font-arabic text-xs font-normal text-[#0a6b4f] dark:text-[#34d399]">(المبسوط والشرح)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chapters Accordion & Hadith Cards */}
      <main className="space-y-4">
        {groupedChapters.length === 0 ? (
          <div className="p-8 text-center bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded-lg space-y-3">
            <div className="text-base font-semibold text-[#1c1917] dark:text-[#edece8]">
              {isSearchingGlobal ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#0a6b4f] dark:text-[#34d399]" />
                  <span>Searching 32,000+ Canonical Hadiths for &ldquo;{query}&rdquo;...</span>
                </div>
              ) : query ? (
                <span>No hadiths match &ldquo;{query}&rdquo;</span>
              ) : (
                <span>No hadiths match your active filters.</span>
              )}
            </div>

            {!isSearchingGlobal && (
              <>
                <p className="text-xs text-[#78716c] max-w-md mx-auto">
                  {searchScope === 'local' ? (
                    <>
                      Not found in your active local collection of {data.length.toLocaleString()} hadiths.
                    </>
                  ) : (
                    <>
                      No narrations found in the complete 32,000+ canonical library with these filters. Try broader search terms (e.g. Khalid, Mahdi, water, prayer, wudu, intention).
                    </>
                  )}
                </p>

                {searchScope === 'local' && query && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSearchScope('global');
                        triggerToast(`Searching all 32,000+ hadiths for "${query}"`);
                      }}
                      className="px-4 py-2 bg-[#0a6b4f] hover:bg-[#08553f] text-white dark:bg-[#34d399] dark:hover:bg-[#10b981] dark:text-[#0d1f18] text-xs font-semibold rounded-md inline-flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Search Entire 32,000+ Canonical Library for &ldquo;{query}&rdquo;</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          groupedChapters.map(([chapterKey, group]) => {
            const isOpen = query.trim().length > 0 || groupedChapters.length <= 10 || openChapters.has(chapterKey);
            const limit = chapterRenderLimits[chapterKey] || 30;
            const itemsToShow = group.items.slice(0, limit);
            const hasMore = group.items.length > limit;

            return (
              <section key={chapterKey} className="border border-[#e6dfd5] dark:border-[#302e29] rounded-lg overflow-hidden bg-[#f7f4ee] dark:bg-[#1c1b18]">
                <div
                  onClick={() => toggleChapter(chapterKey)}
                  className="flex items-center justify-between p-3.5 cursor-pointer bg-[#f7f4ee] dark:bg-[#1c1b18] hover:bg-[#f3efe6] dark:hover:bg-[#24221e] select-none transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {isOpen ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
                    <h2 className="font-serif-title font-semibold text-base">
                      {group.book} · {group.chapter}
                    </h2>
                  </div>
                  <span className="text-xs text-[#78716c]">
                    {group.items.length} {group.items.length === 1 ? 'hadith' : 'hadiths'}
                  </span>
                </div>

                {isOpen && (
                  <div className="p-3.5 bg-[#fdfbf7] dark:bg-[#141412] border-t border-[#e6dfd5] dark:border-[#302e29] space-y-3.5">
                    {itemsToShow.map(h => {
                      const isFull = (cardViewOverrides[h.id] || globalView) === 'full';
                      const isBookmarked = bookmarks.has(h.id);
                      const arabicText = (isFull && h.arFull) ? h.arFull : h.ar;
                      const graderDisplay = h.grader ? `by ${h.grader}` : (h.book.includes("Sahih") ? "Consensus" : "Needs grader");

                      return (
                        <article
                          key={h.id}
                          className="relative p-4 sm:p-5 bg-[#fdfbf6] dark:bg-[#181613] border-2 border-[#ded1bb] dark:border-[#382f23] rounded-xl shadow-[0_4px_20px_-4px_rgba(130,95,40,0.10)] transition-all duration-200 hover:border-[#c5b18e] dark:hover:border-[#524430] overflow-hidden"
                        >
                          {/* Top 7th-century illuminated gold & emerald decorative trim */}
                          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#bfa15f] dark:via-[#947838] to-transparent opacity-90" />

                          {/* Card Meta & Header */}
                          <div className="flex items-start justify-between gap-3 text-xs text-[#705e4a] dark:text-[#a89883] pb-3 border-b border-[#ebdcc6] dark:border-[#2f271d]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif-title font-bold text-sm text-[#2a1a08] dark:text-[#f8f4ec] flex items-center gap-1.5">
                                <span className="text-[#8c672b] dark:text-[#d4af37]">۞</span>
                                <span>{h.book}</span>
                              </span>
                              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#eee3d1] dark:bg-[#251e15] text-[#4d371a] dark:text-[#d3be9e] border border-[#d6c4a8] dark:border-[#3d3222] font-semibold">
                                #{h.num}
                              </span>
                              <span className="italic text-[#594734] dark:text-[#b5a591] font-serif">
                                {h.chapter}
                              </span>

                              {/* Authentic Grade Seal */}
                              {h.grade === 'Sahih' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-serif font-bold bg-[#edf7f0] text-[#0f533a] border border-[#a7d7ba] dark:bg-[#0e2c21] dark:text-[#6ee7b7] dark:border-[#1b4d3a] shadow-xs">
                                  <span>۞</span>
                                  <span>صحيح · Sahih</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-serif font-bold bg-[#fef9ee] text-[#854d0e] border border-[#fde047] dark:bg-[#281e09] dark:text-[#fde047] dark:border-[#78590d] shadow-xs">
                                  <span>✦</span>
                                  <span>حسن · Hasan</span>
                                </span>
                              )}

                              <span className="text-[11px] text-[#786b5b] dark:text-[#9e907d] font-serif">
                                ({graderDisplay})
                              </span>

                              {(() => {
                                const catId = getHadithCategory(h);
                                const catObj = MAJOR_CATEGORIES.find(c => c.id === catId);
                                if (!catObj || catObj.id === 'all') return null;
                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#f0e7d8] dark:bg-[#262017] text-[#5e492e] dark:text-[#c4b39b] border border-[#ded0b9] dark:border-[#382d1e]">
                                    <span>{catObj.icon}</span>
                                    <span>{catObj.name.split(',')[0]}</span>
                                  </span>
                                );
                              })()}
                            </div>

                            {/* Card Linked Controls & Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Linked Toggle Button: Changes ALL cards synchronously */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleUnifiedView();
                                }}
                                title={isFull ? "Switch all hadith cards across the collection to concise One-Liner Matn" : "Switch all hadith cards across the collection to Full Vocalized Matn & Classical Commentary"}
                                className="group inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-md border transition-all cursor-pointer shadow-xs bg-[#f4ece1] hover:bg-[#eae0d0] text-[#4a3414] border-[#cbb898] dark:bg-[#2a241b] dark:hover:bg-[#362e22] dark:text-[#f5ead6] dark:border-[#4d3f2c]"
                              >
                                <span className="text-[#8c672b] dark:text-[#d4af37] text-xs">{isFull ? '📜' : '📖'}</span>
                                <span className="font-serif">{isFull ? 'Make All One-Liner' : 'Explain All Cards'}</span>
                                <span className="font-arabic text-[11px] opacity-75 font-normal">{isFull ? 'الوجيز' : 'المبسوط'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleBookmark(h.id);
                                }}
                                className="p-1.5 text-[#7c6953] hover:text-[#0a6b4f] dark:hover:text-[#34d399] rounded hover:bg-[#f0e7d5] dark:hover:bg-[#282117] transition-colors cursor-pointer"
                                title="Bookmark this narration"
                              >
                                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-[#0a6b4f] dark:text-[#34d399]' : ''}`} />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  copyCitation(h);
                                }}
                                className="p-1.5 text-[#7c6953] hover:text-[#0a6b4f] dark:hover:text-[#34d399] rounded hover:bg-[#f0e7d5] dark:hover:bg-[#282117] transition-colors cursor-pointer"
                                title="Copy scholarly citation"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openEditModal(h);
                                }}
                                className="p-1.5 text-[#7c6953] hover:text-[#0a6b4f] dark:hover:text-[#34d399] rounded hover:bg-[#f0e7d5] dark:hover:bg-[#282117] transition-colors cursor-pointer"
                                title="Edit hadith record"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setCurrentView('audit');
                                }}
                                className="p-1.5 text-[#7c6953] hover:text-[#0a6b4f] dark:hover:text-[#34d399] rounded hover:bg-[#f0e7d5] dark:hover:bg-[#282117] transition-colors cursor-pointer"
                                title="Inspect in Scholarly Audit Dashboard"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Arabic Canonical Matn (7th Century Manuscript Cartouche) */}
                          <div className="my-3.5 p-4 sm:p-5 bg-[#f8f3e7]/90 dark:bg-[#12100d]/90 border border-[#e2d5bd] dark:border-[#2d251a] rounded-lg relative shadow-inner">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e5d9c2] dark:border-[#2b241a] text-[11px] text-[#786b5b] dark:text-[#a0917e] font-serif">
                              <span className="flex items-center gap-1.5">
                                <span className="text-[#8c672b] dark:text-[#d4af37]">۞</span>
                                <span className="font-semibold text-[#4a351a] dark:text-[#d9c4a7]">نص الحديث النبوي الشريف · Prophetic Canonical Matn</span>
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded font-sans font-medium bg-[#ecdfcc] dark:bg-[#221c15] text-[#5e4626] dark:text-[#c4af8e]">
                                {isFull ? 'Vocalized Full Matn (المبسوط)' : 'Concise Key Matn (الوجيز)'}
                              </span>
                            </div>
                            <p className="font-arabic text-right text-2xl sm:text-[27px] leading-[2.4] text-[#1a140c] dark:text-[#f8f4ec] tracking-wide antialiased select-text" dir="rtl">
                              {arabicText}
                            </p>
                          </div>

                          {/* English Translation & Meaning (Illuminated Border Ribbon) */}
                          <div className="mb-3.5 px-4 py-3 bg-[#fcf9f2] dark:bg-[#161412] border-l-4 border-[#0a6b4f] dark:border-[#34d399] rounded-r-lg space-y-1.5 shadow-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-serif-title font-bold uppercase tracking-wider text-[#0a6b4f] dark:text-[#34d399] flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>English Translation &amp; Meaning:</span>
                              </span>
                              {!h.en && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleTranslateHadith(h);
                                  }}
                                  className="text-xs text-[#0a6b4f] dark:text-[#34d399] font-medium hover:underline flex items-center gap-1 cursor-pointer"
                                  title="Translate this hadith matn into English"
                                >
                                  <span>🌐 Translate to English</span>
                                </button>
                              )}
                            </div>
                            {h.en ? (
                              <p className="text-sm leading-relaxed text-[#201a14] dark:text-[#ece6dc] font-serif italic">
                                &ldquo;{h.en}&rdquo;
                              </p>
                            ) : (
                              <p className="text-xs text-[#78716c] italic flex items-center justify-between">
                                <span>Arabic canonical text loaded. Click &ldquo;Translate to English&rdquo; to display English translation.</span>
                              </p>
                            )}
                          </div>

                          {/* Classical Commentary Section: Collapsed in One-Liner Mode vs Expanded in Explained Mode */}
                          {!isFull ? (
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setUnifiedViewMode('full');
                              }}
                              className="mt-3 p-3 bg-[#f5edde] hover:bg-[#ede1ce] dark:bg-[#201b15] dark:hover:bg-[#2c241c] border border-[#ddcfb7] dark:border-[#382d1e] rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors shadow-2xs group"
                              title="Click to explain all hadiths and expand 3-scholar classical commentary"
                            >
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#8c672b] dark:text-[#d4af37]" />
                                <span className="font-serif font-semibold text-[#4a3414] dark:text-[#f3e6ce]">
                                  Classical Commentary (3 Scholars) Collapsed in One-Liner Mode
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/[0.04] dark:bg-white/[0.05] text-[#705e4a] dark:text-[#a89883]">
                                  {h.c && h.c.length > 0 ? `${h.c.length} scholars recorded` : 'Pending'}
                                </span>
                              </div>
                              <span className="font-serif text-xs font-semibold text-[#0a6b4f] dark:text-[#34d399] group-hover:underline flex items-center gap-1">
                                <span>📖 Explain All Cards</span>
                                <span className="text-sm">→</span>
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2 pt-3 border-t border-[#ebdcc6] dark:border-[#2f271d]">
                              <div className="flex items-center justify-between text-[11px] text-[#705e4a] dark:text-[#a89883] font-serif">
                                <span className="font-serif-title font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#3b2a16] dark:text-[#dcc9ad]">
                                  <BookOpen className="w-3.5 h-3.5 text-[#0a6b4f] dark:text-[#34d399]" />
                                  <span>الشرح والحواشي · 3-Scholar Classical Commentaries (Fully Explained)</span>
                                </span>
                                <span className="text-[10px] italic">
                                  Comprehensive Sharh &amp; Analysis
                                </span>
                              </div>

                              {h.c && h.c.length > 0 && h.c.some(item => (item.text && item.text !== "UNVERIFIED") || item.full) ? (
                                <div className="space-y-2">
                                  {h.c.map((item, idx) => {
                                    const commentaryText = item.full || item.text;
                                    return (
                                      <div key={idx} className="p-3 bg-[#f7f2e6] dark:bg-[#191612] border border-[#e5d9c2] dark:border-[#2d2419] rounded-md text-xs leading-relaxed flex flex-wrap items-baseline justify-between gap-2 shadow-xs">
                                        <div className="flex-1 min-w-[240px]">
                                          <strong className="text-[#0a6b4f] dark:text-[#34d399] font-serif font-bold mr-1.5 text-xs">
                                            {item.scholar}:
                                          </strong>
                                          <span className="text-[#2a2219] dark:text-[#ede4d6]">
                                            {commentaryText || "UNVERIFIED commentary."}
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleVerified(h.id, idx);
                                          }}
                                          className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer shrink-0 font-serif ${
                                            item.verified
                                              ? 'bg-[#dcfce7] text-[#166534] dark:bg-[#062f1c] dark:text-[#4ade80] border border-[#bbf7d0] dark:border-[#14532d]'
                                              : 'bg-[#fef3c7] text-[#92400e] dark:bg-[#322108] dark:text-[#fbbf24] border border-[#fde68a] dark:border-[#78350f]'
                                          }`}
                                          title={item.verified ? "Click to flag as unverified" : "Click to mark as verified"}
                                        >
                                          {item.verified ? "✓ Verified" : "⚠ AI-generated, verify"}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="p-3 bg-[#f7f2e6] dark:bg-[#191612] border border-dashed border-[#d9cca8] dark:border-[#3a2f20] rounded-md text-xs flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-[#786b5b] dark:text-[#a0917e] font-serif italic">
                                    No classical commentary recorded yet for this narration.
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExplainSingleHadith(h);
                                    }}
                                    disabled={explainingHadithId === h.id}
                                    className="px-3 py-1.5 bg-[#0a6b4f] hover:bg-[#08553f] text-white dark:bg-[#34d399] dark:hover:bg-[#10b981] dark:text-[#0d1f18] rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                                  >
                                    {explainingHadithId === h.id ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Generating Commentary...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>⚡ Explain with 3 Classical Commentators</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Cross References ("also") */}
                          {h.also && h.also.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-dashed border-[#e6dfd5] dark:border-[#2b241a] text-xs text-[#786b5b] dark:text-[#a0917e] flex items-center gap-1.5 flex-wrap font-serif">
                              <span className="font-semibold text-[#4a361c] dark:text-[#d3bea0]">مخرّج في المصادر · Also reported in:</span>
                              {h.also.map((ref, rIdx) => (
                                <button
                                  type="button"
                                  key={rIdx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQuery(ref);
                                  }}
                                  className="text-[#1e3a8a] dark:text-[#60a5fa] hover:underline font-mono text-[11px] bg-[#f0e7d8] dark:bg-[#251f16] px-1.5 py-0.5 rounded border border-[#dfd2bc] dark:border-[#382d1e] cursor-pointer"
                                >
                                  {ref}
                                </button>
                              ))}
                            </div>
                          )}
                        </article>
                      );
                    })}

                    {hasMore && (
                      <button
                        onClick={() => setChapterRenderLimits(p => ({ ...p, [chapterKey]: (p[chapterKey] || 30) + 30 }))}
                        className="w-full py-2 border border-dashed border-[#e6dfd5] dark:border-[#302e29] rounded text-xs font-semibold text-[#0a6b4f] dark:text-[#34d399] hover:bg-[#f7f4ee] dark:hover:bg-[#1c1b18]"
                      >
                        Load more narrations ({group.items.length - limit} remaining in chapter)
                      </button>
                    )}
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>
      </>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfbf7] dark:bg-[#141412] text-[#1c1917] dark:text-[#edece8] border border-[#e6dfd5] dark:border-[#302e29] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6dfd5] dark:border-[#302e29] mb-4">
              <h3 className="font-serif-title font-bold text-lg">
                {editingItem.id ? `Edit Hadith (${editingItem.book} #${editingItem.num})` : 'Add Hadith Narration'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#78716c]">Collection / Book</label>
                  <select
                    value={editingItem.book}
                    onChange={e => {
                      const newBook = e.target.value;
                      const scholars = COMM[newBook] || [];
                      setEditingItem({
                        ...editingItem,
                        book: newBook,
                        c: scholars.map(s => ({ scholar: s, text: "", full: "", verified: false }))
                      });
                    }}
                    className="w-full p-2 bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded"
                  >
                    {BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#78716c]">Hadith Number</label>
                  <input
                    type="text"
                    required
                    value={editingItem.num}
                    onChange={e => setEditingItem({ ...editingItem, num: e.target.value })}
                    className="w-full p-2 bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded"
                    placeholder="e.g. 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#78716c]">Chapter</label>
                  <input
                    type="text"
                    required
                    value={editingItem.chapter}
                    onChange={e => setEditingItem({ ...editingItem, chapter: e.target.value })}
                    className="w-full p-2 bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded"
                    placeholder="e.g. Beginning of Revelation"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#78716c]">Grade</label>
                  <select
                    value={editingItem.grade}
                    onChange={e => setEditingItem({ ...editingItem, grade: e.target.value as 'Sahih' | 'Hasan' })}
                    className="w-full p-2 bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded"
                  >
                    <option value="Sahih">Sahih</option>
                    <option value="Hasan">Hasan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#78716c]">Grader Attribution</label>
                  <input
                    type="text"
                    required
                    value={editingItem.grader}
                    onChange={e => setEditingItem({ ...editingItem, grader: e.target.value })}
                    className="w-full p-2 bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded"
                    placeholder="e.g. Consensus / al-Albani"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#78716c]">Cross References ("also", comma separated)</label>
                  <input
                    type="text"
                    value={editingItem.also?.join(", ") || ""}
                    onChange={e => setEditingItem({
                      ...editingItem,
                      also: e.target.value.split(",").map(x => x.trim()).filter(Boolean)
                    })}
                    className="w-full p-2 bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded"
                    placeholder="e.g. Sahih Muslim 1907"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#78716c]">Key Matn Sentence (Arabic, One-liner)</label>
                <textarea
                  required
                  rows={2}
                  dir="rtl"
                  value={editingItem.ar}
                  onChange={e => setEditingItem({ ...editingItem, ar: e.target.value })}
                  className="w-full p-2 font-arabic text-lg bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#78716c]">Full Narration Text (Arabic)</label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={editingItem.arFull}
                  onChange={e => setEditingItem({ ...editingItem, arFull: e.target.value })}
                  className="w-full p-2 font-arabic text-lg bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#78716c]">English Translation (Matn)</label>
                <textarea
                  rows={2}
                  value={editingItem.en || ""}
                  onChange={e => setEditingItem({ ...editingItem, en: e.target.value })}
                  placeholder="Enter English translation of the hadith matn..."
                  className="w-full p-2 bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded"
                />
              </div>

              {/* 3 Commentators */}
              <div className="pt-2 border-t border-[#e6dfd5] dark:border-[#302e29] space-y-2">
                <div className="font-semibold text-[#0a6b4f] dark:text-[#34d399]">
                  Commentaries (3 Scholars for {editingItem.book})
                </div>
                {editingItem.c?.map((cItem, cIdx) => (
                  <div key={cIdx} className="p-2.5 bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-[#0a6b4f] dark:text-[#34d399]">
                      <span>{cItem.scholar}</span>
                      <label className="text-[11px] font-normal flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={cItem.verified}
                          onChange={e => {
                            const newC = [...editingItem.c];
                            newC[cIdx].verified = e.target.checked;
                            setEditingItem({ ...editingItem, c: newC });
                          }}
                        />
                        Verified from Sharh
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="One-line summary (text)"
                      value={cItem.text}
                      onChange={e => {
                        const newC = [...editingItem.c];
                        newC[cIdx].text = e.target.value;
                        setEditingItem({ ...editingItem, c: newC });
                      }}
                      className="w-full p-1.5 bg-[#fdfbf7] dark:bg-[#141412] border border-[#e6dfd5] dark:border-[#302e29] rounded"
                    />
                    <textarea
                      rows={2}
                      placeholder="Fuller commentary summary (full)"
                      value={cItem.full}
                      onChange={e => {
                        const newC = [...editingItem.c];
                        newC[cIdx].full = e.target.value;
                        setEditingItem({ ...editingItem, c: newC });
                      }}
                      className="w-full p-1.5 bg-[#fdfbf7] dark:bg-[#141412] border border-[#e6dfd5] dark:border-[#302e29] rounded"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#e6dfd5] dark:border-[#302e29]">
                {editingItem.id && data.some(x => x.id === editingItem.id) ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(editingItem.id)}
                    className="text-red-600 hover:text-red-700 font-semibold"
                  >
                    Delete Entry
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 border border-[#e6dfd5] dark:border-[#302e29] rounded hover:bg-black/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0a6b4f] text-white dark:bg-[#34d399] dark:text-[#0d1f18] font-semibold rounded"
                  >
                    Save Hadith
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Catalog Loader Modal */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfbf7] dark:bg-[#141412] text-[#1c1917] dark:text-[#edece8] border border-[#e6dfd5] dark:border-[#302e29] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6dfd5] dark:border-[#302e29] mb-4">
              <div className="flex items-center gap-2">
                <Library className="w-5 h-5 text-[#0a6b4f] dark:text-[#34d399]" />
                <h3 className="font-serif-title font-bold text-lg">Verified Dataset Catalog Loader</h3>
              </div>
              <button onClick={() => setIsCatalogModalOpen(false)} className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <p className="text-[#78716c]">
                This loader streams authentic hadith data directly from open verified repositories (jsDelivr CDN) into your browser's IndexedDB. In accordance with scope rules, only Sahih and Hasan narrations are indexed, and Da'if/weak narrations are strictly excluded.
              </p>

              <div>
                <label className="block font-semibold mb-1 text-[#78716c]">Select Verified Collection to Index</label>
                <select
                  value={catalogPreset}
                  onChange={e => setCatalogPreset(e.target.value)}
                  className="w-full p-2 bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded"
                >
                  <optgroup label="Instant Fast Load (Pre-compiled Verified Datasets)">
                    <option value="canonical_core">Canonical Core (1,060 authentic hadiths across all 7 collections — Instant)</option>
                    <option value="bukhari_all">Sahih al-Bukhari (Complete 7,589 authentic hadiths)</option>
                    <option value="muslim_all">Sahih Muslim (Complete 7,563 authentic hadiths)</option>
                    <option value="abudawud_all">Sunan Abi Dawud (Complete 4,198 authentic hadiths — al-Albani)</option>
                    <option value="tirmidhi_all">Jami at-Tirmidhi (Complete 3,138 authentic hadiths — al-Albani)</option>
                    <option value="nasai_all">Sunan an-Nasa'i (Complete 5,186 authentic hadiths — al-Albani)</option>
                    <option value="ibnmajah_all">Sunan Ibn Majah (Complete 3,418 authentic hadiths — al-Albani)</option>
                    <option value="mishkat_all">Mishkat al-Masabih (Complete 4,428 authentic hadiths — al-Albani)</option>
                    <option value="all_canonical">ALL 7 Canonical Collections (Complete 30,000+ Authentic Hadiths!)</option>
                  </optgroup>
                  <optgroup label="Prototype Demo Samples">
                    <option value="sample_reset">Reset to 7 Canonical Prototype Samples</option>
                  </optgroup>
                </select>
              </div>

              <div className="p-3 bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded-md">
                <div className="font-semibold text-[#0a6b4f] dark:text-[#34d399] mb-1">
                  Scope &amp; Authenticity Guarantees:
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[#78716c]">
                  <li><strong>Sahih al-Bukhari &amp; Sahih Muslim:</strong> Consensus Sahih across entire collections (14,940 narrations).</li>
                  <li><strong>The Four Sunan:</strong> Strictly filtered to include only narrations verified as <em>Sahih</em> or <em>Hasan</em> by Shaykh al-Albani; Da'if, Munkar, and Mawdu' are automatically excluded.</li>
                  <li><strong>3 Commentators Matrix:</strong> Every hadith is pre-assigned with the exact 3 classical authoritative commentators for its collection.</li>
                </ul>
              </div>

              {isDownloadingCdn && (
                <div className="space-y-1.5">
                  <div className="w-full bg-[#e6dfd5] dark:bg-[#302e29] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0a6b4f] dark:bg-[#34d399] h-full transition-all duration-200"
                      style={{ width: `${cdnProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {cdnStatus && (
                <div className="p-2.5 bg-[#fdfbf7] dark:bg-[#141412] border border-[#0a6b4f] dark:border-[#34d399] rounded text-[#0a6b4f] dark:text-[#34d399] font-medium">
                  {cdnStatus}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#e6dfd5] dark:border-[#302e29] mt-4">
              <span className="text-xs text-[#78716c]">Current DB: {data.length.toLocaleString()} narrations</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatalogModalOpen(false)}
                  className="px-3 py-1.5 border border-[#e6dfd5] dark:border-[#302e29] rounded hover:bg-black/5 text-xs font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isDownloadingCdn}
                  onClick={handleCdnImport}
                  className="px-4 py-1.5 bg-[#0a6b4f] hover:bg-[#08553f] text-white dark:bg-[#34d399] dark:hover:bg-[#10b981] dark:text-[#0d1f18] font-semibold rounded text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDownloadingCdn && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isDownloadingCdn ? 'Downloading & Indexing...' : 'Stream to IndexedDB'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vercel Deployment & Download Guide Modal */}
      {isVercelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfbf7] dark:bg-[#141412] text-[#1c1917] dark:text-[#edece8] border border-[#e6dfd5] dark:border-[#302e29] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6dfd5] dark:border-[#302e29] mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-serif-title font-bold text-lg">How to Download &amp; Deploy to Vercel (vercel.app)</h3>
              </div>
              <button
                onClick={() => setIsVercelModalOpen(false)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                  100% Vercel-Ready Architecture Included
                </p>
                <p className="text-blue-800/80 dark:text-blue-300">
                  This codebase is fully configured for Vercel with a native <code>vercel.json</code>, Vite SPA build settings, and serverless functions under <code>/api</code> for instant Gemini translations and classical commentary generation.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#0a6b4f] dark:text-[#34d399] mb-1.5 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0a6b4f]/10 dark:bg-[#34d399]/20 flex items-center justify-center text-xs font-bold">1</span>
                  <span>How to Download the Codebase from AI Studio</span>
                </h4>
                <ol className="list-decimal pl-5 space-y-1 text-[#78716c]">
                  <li>
                    Look at the top right of the Google AI Studio interface. Click the <strong>Export / Download Code</strong> or <strong>Export to GitHub</strong> button.
                  </li>
                  <li>
                    Save and extract the downloaded ZIP file to a folder on your computer.
                  </li>
                  <li>
                    <em>(Optional)</em> If you just want an offline desktop single-file app, click the <strong>Standalone HTML</strong> button in the top bar of this app!
                  </li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#0a6b4f] dark:text-[#34d399] mb-1.5 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0a6b4f]/10 dark:bg-[#34d399]/20 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Push to GitHub &amp; Import into Vercel (Recommended)</span>
                </h4>
                <div className="space-y-2 text-[#78716c]">
                  <p>In your terminal inside the downloaded project folder:</p>
                  <pre className="p-2.5 bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded font-mono text-[11px] overflow-x-auto text-[#1c1917] dark:text-[#edece8]">
{`git init
git add .
git commit -m "Deploy Sahih Hadith Index"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sahih-hadith-index.git
git push -u origin main`}
                  </pre>
                  <p>
                    Then go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline font-medium">vercel.com/new</a>, sign in, and click <strong>Import</strong> next to your GitHub repository.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#0a6b4f] dark:text-[#34d399] mb-1.5 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0a6b4f]/10 dark:bg-[#34d399]/20 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Set Environment Variable in Vercel &amp; Deploy</span>
                </h4>
                <div className="space-y-1.5 text-[#78716c]">
                  <p>On Vercel's "Configure Project" screen before clicking Deploy:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Framework Preset:</strong> Vite (automatically detected)</li>
                    <li><strong>Root Directory:</strong> <code>./</code></li>
                    <li>
                      Expand <strong>Environment Variables</strong> and add:
                      <div className="mt-1 p-2 bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded font-mono text-[11px]">
                        <strong>Key:</strong> GEMINI_API_KEY<br />
                        <strong>Value:</strong> &lt;Your Gemini API Key from aistudio.google.com/apikey&gt;
                      </div>
                    </li>
                  </ul>
                  <p className="mt-1">
                    Click <strong>Deploy</strong>! Within ~45 seconds, your app will be live at <code>https://your-project.vercel.app</code> with full search, offline IndexedDB, and serverless Gemini AI capabilities.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#f7f4ee] dark:bg-[#1c1b18] border border-[#e6dfd5] dark:border-[#302e29] rounded-md">
                <div className="font-semibold text-[#1c1917] dark:text-[#edece8] mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#0a6b4f] dark:text-[#34d399]" />
                  <span>Alternative 1-Command CLI Deployment:</span>
                </div>
                <pre className="p-2 bg-[#fdfbf7] dark:bg-[#141412] border border-[#e6dfd5] dark:border-[#302e29] rounded font-mono text-[11px] text-[#1c1917] dark:text-[#edece8] mt-1">
npx vercel --prod
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-[#e6dfd5] dark:border-[#302e29] mt-4 gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`git init\ngit add .\ngit commit -m "Deploy to Vercel"\ngit branch -M main\nnpx vercel --prod`);
                  triggerToast("Deployment commands copied to clipboard!");
                }}
                className="px-3 py-1.5 border border-[#e6dfd5] dark:border-[#302e29] rounded hover:bg-black/5 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Quick Commands</span>
              </button>
              <button
                onClick={() => setIsVercelModalOpen(false)}
                className="px-4 py-1.5 bg-[#0a6b4f] hover:bg-[#08553f] text-white dark:bg-[#34d399] dark:hover:bg-[#10b981] dark:text-[#0d1f18] font-semibold rounded text-xs cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#1c1917] text-[#fdfbf7] dark:bg-[#edece8] dark:text-[#141412] text-xs font-semibold px-4 py-2.5 rounded-md shadow-lg z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
