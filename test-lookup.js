const fetch = require('node-fetch');

async function test() {
  console.log('Testing lookup APIs...\n');
  
  // Test 1: Partial search
  console.log('=== Test 1: Partial Search ===');
  const test1 = await fetch('http://localhost:3000/api/lookup/locations?type=port&q=laem');
  const data1 = await test1.json();
  console.log('Port search for "laem":', JSON.stringify(data1, null, 2));
  
  // Test 2: Full name with comma and space
  console.log('\n=== Test 2: Full Name (with space before comma) ===');
  const test2 = await fetch('http://localhost:3000/api/lookup/locations?type=port&q=' + encodeURIComponent('LAEM CHABANG , THAILAND'));
  const data2 = await test2.json();
  console.log('Port search for "LAEM CHABANG , THAILAND":', JSON.stringify(data2, null, 2));
  
  // Test 3: Full name without space before comma
  console.log('\n=== Test 3: Full Name (no space before comma) ===');
  const test3 = await fetch('http://localhost:3000/api/lookup/locations?type=port&q=' + encodeURIComponent('LAEM CHABANG, THAILAND'));
  const data3 = await test3.json();
  console.log('Port search for "LAEM CHABANG, THAILAND":', JSON.stringify(data3, null, 2));
  
  // Test 4: Airport search
  console.log('\n=== Test 4: Airport Search ===');
  const test4 = await fetch('http://localhost:3000/api/lookup/locations?type=airport&q=bang');
  const data4 = await test4.json();
  console.log('Airport search for "bang":', JSON.stringify(data4, null, 2));
  
  // Test 5: Carrier search
  console.log('\n=== Test 5: Carrier Search ===');
  const test5 = await fetch('http://localhost:3000/api/lookup/partners?type=carrier&q=ms');
  const data5 = await test5.json();
  console.log('Carrier search for "ms":', JSON.stringify(data5, null, 2));
  
  // Test 6: Case insensitive
  console.log('\n=== Test 6: Case Insensitive ===');
  const test6 = await fetch('http://localhost:3000/api/lookup/locations?type=port&q=bangkok');
  const data6 = await test6.json();
  console.log('Port search for "bangkok" (lowercase):', JSON.stringify(data6, null, 2));
}

test().catch(console.error);
