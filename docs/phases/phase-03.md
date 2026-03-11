# Phase 03 — Vocabulary Data (All 18 Categories)

## Started: 2026-03-11

### Actions
- [16:00] Read CLAUDE.md and skills/SKILL-data.md for data format specs, Finnish accuracy rules
- [16:01] Read existing types/index.ts for VocabEntry interface
- [16:05] Generated greetings.json — 28 items (greetings, polite expressions, yes/no, farewells)
- [16:05] Generated pronouns.json — 25 items (personal, possessive, demonstrative, question words)
- [16:05] Generated numbers.json — 35 items (0-90, 100, 1000, ordinals 1st-3rd, half, pair, many)
- [16:10] Generated colors.json — 18 items (basic + compound colors like vaaleanpunainen)
- [16:10] Generated family.json — 28 items (immediate/extended family, relationships, friend)
- [16:10] Generated food-drink.json — 45 items (foods, drinks, meals, Finnish specialties)
- [16:15] Generated body.json — 28 items (body parts, health words, doctor, medicine)
- [16:15] Generated home.json — 35 items (rooms, furniture, appliances, electronics)
- [16:15] Generated animals.json — 27 items (pets, farm, wildlife, insects — avoided duplicates with food-drink)
- [16:20] Generated time-calendar.json — 38 items (7 days, 12 months, 4 seasons, time words)
- [16:20] Generated weather-nature.json — 27 items (weather, temperature, landscape, nature)
- [16:20] Generated transport.json — 32 items (vehicles, places, buildings)
- [16:25] Generated shopping.json — 27 items (money, prices, shopping vocabulary — no verbs)
- [16:25] Generated work-study.json — 27 items (workplace, education — avoided duplicates with transport/time)
- [16:25] Generated travel.json — 27 items (travel, directions, compass points — no verbs, no duplicates)
- [16:30] Generated emotions.json — 27 items (feelings, emotional states, participle adjectives)
- [16:30] Generated verbs-common.json — 55 items (essential verbs with conjugation/gradation notes)
- [16:30] Generated adjectives.json — 45 items (opposites, descriptors — no duplicates with colors/emotions)
- [16:35] Added resolveJsonModule: true to tsconfig.app.json for JSON imports
- [16:36] Built _index.ts with register pattern, categories array, allVocabulary flat array, getVocabByCategory() and getCategoryMeta() functions
- [16:37] Fixed duplicate: "terve" appeared in both greetings (hello) and body (healthy) — replaced body-026 with "kuume" (fever)
- [16:38] Created scripts/validate-vocab.cjs validation script
- [16:39] Ran validation — ALL CHECKS PASSED
- [16:40] Ran npm run build — zero TypeScript errors

### Item Counts per Category

| Category | Count | Target | Status |
|----------|-------|--------|--------|
| greetings | 28 | 25-30 | In range |
| pronouns | 25 | 20-25 | In range |
| numbers | 35 | 30-40 | In range |
| colors | 18 | 15-20 | In range |
| family | 28 | 25-30 | In range |
| food-drink | 45 | 40-50 | In range |
| body | 28 | 25-30 | In range |
| home | 35 | 30-40 | In range |
| animals | 27 | 25-30 | In range |
| time-calendar | 38 | 35-40 | In range |
| weather-nature | 27 | 25-30 | In range |
| transport | 32 | 30-35 | In range |
| shopping | 27 | 25-30 | In range |
| work-study | 27 | 25-30 | In range |
| travel | 27 | 25-30 | In range |
| emotions | 27 | 25-30 | In range |
| verbs-common | 55 | 50-60 | In range |
| adjectives | 45 | 40-50 | In range |
| **TOTAL** | **574** | **550-650** | **In range** |

### Validation Results
- Duplicate IDs: 0
- Duplicate Finnish words: 0
- Missing required fields: 0
- Empty strings: 0
- Missing notes for difficulty 2+: 0
- Missing examples: 0
- Unique IDs: 574
- Unique Finnish words: 574

### Decisions
- **No duplicate words across categories**: Strictly enforced. Removed "terve" from body (kept in greetings as its primary use). Avoided kana/kala in animals (already in food-drink). Avoided koulu in work-study (already in transport). Avoided tunti in work-study (already in time-calendar). Avoided loma in travel (already in work-study). Avoided oikea in adjectives (already in travel).
- **Verbs excluded from non-verb categories**: Shopping, travel, and other categories use noun forms (ostos, maksu, varaus) instead of verb forms (ostaa, maksaa, varata) — all verbs consolidated in verbs-common.
- **Finnish month literal meanings preserved in notes**: tammikuu (oak month), lokakuu (mud month), marraskuu (death month), etc.
- **Consonant gradation documented**: All verb entries include gradation patterns (pp→p, tt→t, kk→k, nt→nn, rt→rr, lk→lj, t→d, k→∅).
- **Stem changes documented**: Irregular noun stems noted (hammas→hampaa-, sydän→sydäme-, hevonen→hevose-, etc.).
- **Cultural context included**: Finnish uncle distinction (setä vs eno), coffee culture, Alko monopoly, berry-picking rights, sauna, poro/reindeer.

### Completed: 2026-03-11
