import { runAiReview } from './aiService.js';

export async function runReview(mrDetails, mrChanges) {
  console.log('\n--- PR REVIEW SUMMARY ---');

  // Title check
  if (!mrDetails.title.toLowerCase().includes('feat') && !mrDetails.title.toLowerCase().includes('fix')) {
    console.warn('⚠️ Title may not follow conventional commits (feat/fix).');
  } else {
    console.log('✅ Title format looks good.');
  }

  const filePaths = mrChanges.map(change => change.new_path);
  const healthCheckFile = filePaths.find(f => f.includes('health') || f.includes('status'));

  if (healthCheckFile) {
    console.log(`✅ Found potential health check file: ${healthCheckFile}`);
  } else {
    console.warn('⚠️ No health check found. Consider adding one.');
  }

  const isNestJS = filePaths.some(f => f.includes('module.ts'));
  const isNextJS = filePaths.some(f => f.includes('next.config.js'));
  const isLambdaGraphQL = filePaths.some(f => f.includes('graphql') && f.includes('lambda'));

  console.log('\n🧩 Project Stack Detection:');
  console.log(`- NestJS: ${isNestJS ? '✅' : '❌'}`);
  console.log(`- Next.js: ${isNextJS ? '✅' : '❌'}`);
  console.log(`- Lambda + GraphQL: ${isLambdaGraphQL ? '✅' : '❌'}`);

  const hasTestChanges = filePaths.some(f => f.includes('test') || f.includes('.spec.'));
  if (hasTestChanges) {
    console.log('✅ Test files are included.');
  } else {
    console.warn('⚠️ No test changes detected.');
  }

  // AI Review
  console.log('\n🤖 Running AI Review...');
  const aiFeedback = await runAiReview(mrDetails, mrChanges);
  console.log('\n🧠 AI Suggestions:');
  console.log(aiFeedback);

  console.log('\n✅ Review completed.');
  return aiFeedback;  // Return the review for posting as a comment
}
