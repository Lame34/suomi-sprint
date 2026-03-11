const fs = require('fs');
const path = require('path');

const phraseDir = path.join(__dirname, '..', 'src', 'data', 'phrases');
const vocabDir = path.join(__dirname, '..', 'src', 'data', 'vocabulary');

// Load all vocab Finnish words for cross-reference checking
const vocabWords = new Set();
const vocabFiles = fs.readdirSync(vocabDir).filter(f => f.endsWith('.json'));
vocabFiles.forEach(f => {
  const data = JSON.parse(fs.readFileSync(path.join(vocabDir, f), 'utf8'));
  data.items.forEach(item => vocabWords.add(item.finnish));
});

const phraseFiles = fs.readdirSync(phraseDir).filter(f => f.endsWith('.json'));
const allIds = new Set();
const allFinnish = new Set();
const categoryCounts = {};
let totalItems = 0;
let errors = 0;
let warnings = 0;

phraseFiles.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(phraseDir, file), 'utf8'));
  const catId = data.category;
  const items = data.items;
  categoryCounts[catId] = items.length;
  totalItems += items.length;

  // Category-level fields
  if (!data.categoryLabel || !data.icon || !data.description) {
    console.error('FAIL: Missing category-level fields in ' + file);
    errors++;
  }

  items.forEach((item, idx) => {
    const loc = catId + '[' + idx + '] ' + (item.id || 'NO-ID');

    // Required fields for phrases
    ['id', 'finnish', 'english', 'category', 'difficulty', 'words'].forEach(field => {
      if (item[field] === undefined || item[field] === null) {
        console.error('MISSING FIELD:', field, 'in', loc);
        errors++;
      }
    });

    // Empty strings
    ['id', 'finnish', 'english'].forEach(field => {
      if (typeof item[field] === 'string' && item[field].trim() === '') {
        console.error('EMPTY STRING:', field, 'in', loc);
        errors++;
      }
    });

    // ID format
    if (item.id && !/^[a-z][\w-]*-\d{3}$/.test(item.id)) {
      console.error('BAD ID FORMAT:', item.id);
      errors++;
    }

    // ID prefix matches category
    if (item.id && !item.id.startsWith(catId + '-')) {
      console.error('ID MISMATCH:', item.id, 'expected prefix', catId);
      errors++;
    }

    // Duplicate IDs
    if (allIds.has(item.id)) {
      console.error('DUPLICATE ID:', item.id);
      errors++;
    }
    allIds.add(item.id);

    // Duplicate Finnish phrases
    if (allFinnish.has(item.finnish)) {
      console.warn('WARN: Duplicate Finnish phrase:', item.finnish, '(' + item.id + ')');
      warnings++;
    }
    allFinnish.add(item.finnish);

    // Category field matches
    if (item.category !== catId) {
      console.error('CATEGORY MISMATCH:', item.id, 'has', item.category, 'expected', catId);
      errors++;
    }

    // Difficulty range
    if (item.difficulty < 1 || item.difficulty > 3) {
      console.error('BAD DIFFICULTY:', item.difficulty, 'in', item.id);
      errors++;
    }

    // Notes for difficulty 2+
    if (item.difficulty >= 2 && (typeof item.notes !== 'string' || item.notes.trim() === '')) {
      console.error('NO NOTES FOR DIFF 2+:', item.id);
      errors++;
    }

    // Words array must be non-empty
    if (!Array.isArray(item.words) || item.words.length === 0) {
      console.error('EMPTY WORDS ARRAY:', item.id);
      errors++;
    }

    // Phrase should have at least 2 words in Finnish text
    if (item.finnish && item.finnish.split(/\s+/).length < 1) {
      console.error('PHRASE TOO SHORT:', item.id, item.finnish);
      errors++;
    }
  });
});

console.log('\n=== PHRASE DATA VALIDATION REPORT ===\n');
console.log('Categories:', phraseFiles.length);
console.log('Total items:', totalItems);
console.log('Unique IDs:', allIds.size);
console.log('Unique Finnish phrases:', allFinnish.size);

console.log('\n--- Items per Category ---');
Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log('  ' + cat.padEnd(20) + count);
});

console.log('\nVocab words available for cross-ref:', vocabWords.size);
console.log('Errors:', errors);
console.log('Warnings:', warnings);
console.log('\n' + (errors === 0 ? 'RESULT: ALL CHECKS PASSED' : 'RESULT: FAILED'));
process.exit(errors > 0 ? 1 : 0);
