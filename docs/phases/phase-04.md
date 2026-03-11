# Phase 04 — Phrase Data (All 6 Categories)

## Started: 2026-03-11

### Actions
- [17:00] Read CLAUDE.md and skills/SKILL-data.md for phrase format specs, Finnish accuracy rules
- [17:01] Read existing types/index.ts for PhraseEntry interface
- [17:05] Generated survival.json — 35 items (essential survival phrases: greetings, help, directions, basic needs)
- [17:05] Generated conversation.json — 40 items (small talk: introductions, age, work, opinions, goodbyes)
- [17:05] Generated restaurant.json — 28 items (ordering, dietary needs, paying, compliments)
- [17:05] Generated directions.json — 27 items (asking/giving directions, locations, landmarks)
- [17:05] Generated emergency.json — 18 items (medical, police, fire, urgent help)
- [17:05] Generated daily-life.json — 33 items (shopping, appointments, transport, daily routines)
- [17:10] Built src/data/phrases/_index.ts with register pattern, categories array, allPhrases flat array, getPhrasesByCategory() and getPhraseCategoryMeta() functions
- [17:11] Built src/data/index.ts — master data index with getAllItems(), getItemById(), searchItems(), getDataStats()
- [17:12] Created scripts/validate-phrases.cjs validation script
- [17:13] Ran validation — 2 errors found:
  - conversation-013 and conversation-035 had empty words arrays
  - "Olen eksynyt." duplicated between survival-013 and directions-021
- [17:14] Fixed conversation-013: added words ["opiskella"]
- [17:14] Fixed conversation-035: added words ["toivoa"]
- [17:14] Fixed directions-021: replaced duplicate "Olen eksynyt." with "Miten pääsen takaisin hotellille?" (How do I get back to the hotel?)
- [17:15] Ran validation again — ALL CHECKS PASSED (0 errors, 0 warnings)
- [17:15] Fixed unused imports in src/data/index.ts (VocabEntry, PhraseEntry removed)
- [17:16] Ran npm run build — zero TypeScript errors

### Item Counts per Category

| Category | Count | Target | Status |
|----------|-------|--------|--------|
| survival | 35 | 30-40 | In range |
| conversation | 40 | 35-45 | In range |
| restaurant | 28 | 25-35 | In range |
| directions | 27 | 25-30 | In range |
| emergency | 18 | 15-20 | In range |
| daily-life | 33 | 30-40 | In range |
| **TOTAL** | **181** | **160-210** | **In range** |

### Validation Results
- Duplicate IDs: 0
- Duplicate Finnish phrases: 0
- Missing required fields: 0
- Empty strings: 0
- Empty words arrays: 0
- Missing notes for difficulty 2+: 0
- Unique IDs: 181
- Unique Finnish phrases: 181

### Master Data Index (src/data/index.ts)
- getAllItems() — returns all 755 items (574 vocab + 181 phrases)
- getItemById() — O(1) lookup via Map
- searchItems() — relevance-ranked search (exact → prefix → contains)
- getDataStats() — total counts for display

### Decisions
- **No duplicate phrases across categories**: "Olen eksynyt." appeared in both survival and directions. Kept in survival (its primary use context), replaced directions entry with "Miten pääsen takaisin hotellille?"
- **Words arrays reference vocabulary**: Each phrase's words array references Finnish word stems from vocabulary data for cross-referencing
- **Literal translations included**: All phrases have literalTranslation field showing word-by-word Finnish→English mapping
- **Formality documented**: Notes indicate formal (Te) vs informal (sinä) register where relevant
- **Case grammar explained**: Notes explain Finnish cases used (partitive, elative, adessive, allative, inessive, etc.)

### Completed: 2026-03-11
