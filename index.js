import dotenv from 'dotenv';
import { getMergeRequestDetails, getMergeRequestChanges, postMergeRequestComment } from './services/gitlabService.js';
import { runReview } from './services/reviewService.js';

dotenv.config();

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    // Confirm this is a merge request event
    if (body.object_kind !== 'merge_request') {
      console.log('⚠️ Not a merge request event. Ignoring.');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Not a merge request event. Ignored.' }),
      };
    }

    const mr = body.object_attributes;
    const project = body.project;

    const projectPath = project.path_with_namespace; // e.g., "group/project"
    const mrIid = mr.iid; // Merge request IID

    console.log(`🚀 Processing Merge Request: ${projectPath} !${mrIid}`);

    const mrDetails = await getMergeRequestDetails(projectPath, mrIid);
    const mrChanges = await getMergeRequestChanges(projectPath, mrIid);

    const reviewFeedback = await runReview(mrDetails, mrChanges);

    console.log('💬 Posting Review Comments...');
    await postMergeRequestComment(projectPath, mrIid, reviewFeedback);

    console.log('✅ Review completed and comments posted.');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Review completed and comments posted.' }),
    };
  } catch (error) {
    console.error('❌ Error:', error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// ---- for run localy ----

/*
import dotenv from 'dotenv';
import { getMergeRequestDetails, getMergeRequestChanges, postMergeRequestComment } from './services/gitlabService.js';
import { runReview } from './services/reviewService.js';

dotenv.config();

async function main() {
  const mrUrl = process.argv[2];
  if (!mrUrl) {
    console.error('❌ Please provide the GitLab Merge Request URL.');
    process.exit(1);
  }

  console.log(`🚀 Fetching Merge Request: ${mrUrl}`);
  const urlParts = mrUrl.split('/');
  const projectPath = urlParts.slice(3, urlParts.indexOf('-')).join('/');
  const mrIid = urlParts[urlParts.length - 1];

  try {
    const mrDetails = await getMergeRequestDetails(projectPath, mrIid);
    const mrChanges = await getMergeRequestChanges(projectPath, mrIid);

    const reviewFeedback = await runReview(mrDetails, mrChanges);
    console.log('\n💬 Posting Review Comments...');

    await postMergeRequestComment(projectPath, mrIid, reviewFeedback);

    console.log('\n✅ Review completed and comments posted.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
*/