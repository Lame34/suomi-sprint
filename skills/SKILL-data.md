# SKILL — Data (Finnish Language Content Generation)

> Read this skill before generating or modifying ANY vocabulary or phrase data.

## Finnish Language Essentials for Data Generation

### Alphabet & Special Characters
Finnish uses: a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, **ä, ö, å**
- **ä** and **ö** are SEPARATE letters (not accented a/o) — they appear at the END of the alphabet
- **å** is rare in Finnish (mostly Swedish loanwords)
- Double letters are extremely common and meaningful: `tuli` (fire) vs `tulli` (customs) vs `tuuli` (wind)

### Key Grammar Notes (for phrase accuracy)
- **No articles**: Finnish has no "a/an/the"
- **No gender**: No he/she distinction in pronouns (`hän` = he/she)
- **15 grammatical cases**: Nouns change endings (don't need to teach all, but data must be accurate)
- **Vowel harmony**: Back vowels (a, o, u) and front vowels (ä, ö, y) don't mix in native words
- **Verb conjugation**: 6 persons, multiple tenses
- **Word order**: SVO (Subject-Verb-Object) like English, relatively flexible

### Critical Accuracy Rules
1. **Every Finnish word/phrase MUST be verified** — Finnish has many false friends and subtle distinctions
2. **Include pronunciation hints** in `notes` field where non-obvious (e.g., "y" is like German "ü")
3. **Mark formality**: Finnish has formal (`Te/teitä`) vs informal (`sinä/sua`) — note in data
4. **Compound words**: Finnish loves them (`lentokone` = airplane, lit. "flying machine") — note in `literalTranslation`

## Data File Format

### Vocabulary JSON
```json
{
  "category": "greetings",
  "categoryLabel": "Greetings & Basics",
  "icon": "hand-wave",
  "description": "Essential greetings and polite expressions",
  "difficulty": 1,
  "items": [
    {
      "id": "greetings-001",
      "finnish": "Hei",
      "english": "Hello / Hi",
      "partOfSpeech": "phrase",
      "difficulty": 1,
      "notes": "Universal greeting, works in all situations",
      "examples": ["Hei, miten menee? — Hi, how's it going?"]
    }
  ]
}
```

### Phrase JSON
```json
{
  "category": "survival",
  "categoryLabel": "Survival Phrases",
  "icon": "life-buoy",
  "description": "Essential phrases for getting by in Finland",
  "difficulty": 1,
  "items": [
    {
      "id": "survival-001",
      "finnish": "Puhutko englantia?",
      "english": "Do you speak English?",
      "difficulty": 1,
      "literalTranslation": "Speak-you English?",
      "notes": "Informal 'sinä' form. Formal: 'Puhutteko englantia?'",
      "words": ["puhua", "englanti"]
    }
  ]
}
```

## Category Definitions & Content Plan

Generate categories in this order (priority = learning value for a beginner):

### Vocabulary Categories (18 categories)

| # | Category ID | Label | Target Count | Difficulty | Priority |
|---|------------|-------|-------------|------------|----------|
| 1 | `greetings` | Greetings & Basics | 25-30 | 1 | Essential |
| 2 | `pronouns` | Pronouns & Determiners | 20-25 | 1 | Essential |
| 3 | `numbers` | Numbers | 30-40 | 1 | Essential |
| 4 | `colors` | Colors | 15-20 | 1 | High |
| 5 | `family` | Family & People | 25-30 | 1 | High |
| 6 | `food-drink` | Food & Drink | 40-50 | 1-2 | High |
| 7 | `body` | Body & Health | 25-30 | 1-2 | High |
| 8 | `home` | Home & Objects | 30-40 | 1-2 | Medium |
| 9 | `animals` | Animals & Nature | 25-30 | 1-2 | Medium |
| 10 | `time-calendar` | Time & Calendar | 35-40 | 1-2 | High |
| 11 | `weather-nature` | Weather & Seasons | 25-30 | 2 | Medium |
| 12 | `transport` | Transport & Places | 30-35 | 2 | Medium |
| 13 | `shopping` | Shopping & Money | 25-30 | 2 | Medium |
| 14 | `work-study` | Work & Study | 25-30 | 2 | Medium |
| 15 | `travel` | Travel & Directions | 25-30 | 2 | Medium |
| 16 | `emotions` | Emotions & Feelings | 25-30 | 2 | Medium |
| 17 | `verbs-common` | Common Verbs | 50-60 | 1-3 | Essential |
| 18 | `adjectives` | Common Adjectives | 40-50 | 1-3 | High |

**Target total: ~550-650 vocabulary items**

### Phrase Categories (6 categories)

| # | Category ID | Label | Target Count | Difficulty |
|---|------------|-------|-------------|------------|
| 1 | `survival` | Survival Phrases | 30-40 | 1 |
| 2 | `conversation` | Daily Conversation | 35-45 | 1-2 |
| 3 | `restaurant` | At a Restaurant | 25-30 | 1-2 |
| 4 | `directions` | Directions & Location | 25-30 | 2 |
| 5 | `emergency` | Emergency & Help | 15-20 | 1 |
| 6 | `daily-life` | Daily Life & Routine | 30-40 | 2-3 |

**Target total: ~160-205 phrase items**

**Grand total: ~710-855 items**

## Content Quality Rules

### MUST include for every item:
- ✅ Accurate Finnish spelling (including ä, ö)
- ✅ Natural English translation (not robotic literal)
- ✅ Correct `partOfSpeech`
- ✅ Appropriate `difficulty` rating
- ✅ At least 1 `notes` entry for non-obvious items

### SHOULD include:
- Example sentence for vocabulary words
- Literal translation for phrases
- Pronunciation hints for tricky words
- Formality level (informal/formal) where relevant

### NEVER:
- ❌ Guess a Finnish word — verify every single one
- ❌ Mix spoken Finnish slang with standard Finnish (use standard)
- ❌ Use archaic or extremely rare words for beginners
- ❌ Include duplicate items across categories (one canonical location per word)
- ❌ Leave `notes` empty for difficulty 2+ items

## ID Naming Convention
```
{category}-{3-digit-number}
```
Examples: `greetings-001`, `food-drink-042`, `verbs-common-015`

Phrase IDs follow same pattern: `survival-001`, `restaurant-012`

## Exercise Compatibility Notes

Each data item should work with ALL 4 exercise types:
- **MCQ**: Needs enough items per category for 4 distractor options (min 5 per category)
- **Match pairs**: Needs items of similar difficulty within a category
- **Free translation**: `finnish` field must be typeable (note special chars)
- **Fill blank**: Phrases must have clear "blankable" words; vocabulary must have example sentences

When generating phrases, ensure at least 2-3 words per phrase are also in the vocabulary data, so cross-referencing works.

## Incremental Generation Strategy

Claude Code should generate data files ONE CATEGORY AT A TIME:
1. Generate the JSON file
2. Validate: no duplicate IDs, all fields present, Finnish accuracy
3. Import into the category index
4. Move to next category

Start with difficulty 1 categories, then 2, then 3.
