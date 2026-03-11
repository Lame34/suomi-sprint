const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'data', 'vocabulary');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
const allIds = new Set();
const allFinnish = new Map();
const dupWords = [];
let errors = 0;
let total = 0;

files.forEach(f => {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const catId = data.category;
  data.items.forEach(item => {
    total++;

    // Duplicate ID check
    if (allIds.has(item.id)) {
      console.error('DUP ID:', item.id);
      errors++;
    }
    allIds.add(item.id);

    // Duplicate Finnish word check
    if (allFinnish.has(item.finnish)) {
      dupWords.push(`${item.finnish} (${allFinnish.get(item.finnish)} vs ${item.id})`);
    }
    allFinnish.set(item.finnish, item.id);

    // Required fields
    ['id', 'finnish', 'english', 'category', 'partOfSpeech', 'difficulty'].forEach(field => {
      if (item[field] === undefined || item[field] === null) {
        console.error('MISSING FIELD:', field, 'in', item.id || f);
        errors++;
      }
    });

    // Empty strings
    ['id', 'finnish', 'english'].forEach(field => {
      if (typeof item[field] === 'string' && item[field].trim() === '') {
        console.error('EMPTY STRING:', field, 'in', item.id);
        errors++;
      }
    });

    // ID format
    if (item.id && !/^[a-z][\w-]*-\d{3}$/.test(item.id)) {
      console.error('BAD ID FORMAT:', item.id);
      errors++;
    }

    // Category match
    if (item.category !== catId) {
      console.error('CATEGORY MISMATCH:', item.id, 'has', item.category, 'expected', catId);
      errors++;
    }

    // Notes for difficulty 2+
    if (item.difficulty >= 2) {
      if (typeof item.notes !== 'string' || item.notes.trim() === '') {
        console.error('NO NOTES FOR DIFF 2+:', item.id);
        errors++;
      }
    }

    // Examples required
    if (!Array.isArray(item.examples) || item.examples.length === 0) {
      console.error('NO EXAMPLES:', item.id);
      errors++;
    }
  });
});

console.log('\n=== VOCABULARY VALIDATION ===');
console.log('Categories:', files.length);
console.log('Total items:', total);
console.log('Unique IDs:', allIds.size);
console.log('Unique Finnish words:', allFinnish.size);
if (dupWords.length > 0) {
  console.log('\nDuplicate Finnish words (warnings):');
  dupWords.forEach(w => console.log('  WARN:', w));
}
console.log('\nErrors:', errors);
console.log(errors === 0 ? 'RESULT: ALL CHECKS PASSED' : 'RESULT: FAILED');
process.exit(errors > 0 ? 1 : 0);
