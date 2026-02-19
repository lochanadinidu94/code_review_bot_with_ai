import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runAiReview(mrDetails, mrChanges) {
    try {
        const diffSummary = mrChanges.map(change => `File: ${change.new_path}\n${change.diff}`).join('\n\n');

        const prompt = `
                        You are an expert software engineer helping to review a GitLab Merge Request.

                        Please review the following MR:
                        Title: ${mrDetails.title}
                        Description: ${mrDetails.description}

                        Here are the code diffs:
                        ${diffSummary}

                        Instructions:
                        - Check for code quality and best practices.
                        - Check if tests are included.
                        - Look for health checks or monitoring endpoints.
                        - Parentage and possibilities to brake down the existing functionalities.
                        - Detect if it's Nest.js / Next.js / Lambda / GraphQL / Swift fot IOS / Android / Java / Python or etc. and suggest improvements.
                        - Provide clear, concise bullet point feedback.
                        - Provide code snippet for the suggestion from the code checked in

                        Review:`;

                        console.log('🤖 AI Review prompt:', prompt);

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
            temperature: 0.3
        });

        const aiReview = completion.choices[0].message.content.trim();

        // Append the signature
        const finalReview = `${aiReview}\n\n_Note: This review is done by 🧠 AI bot [more details: dinidu.lochanadissanayake@iag.com.au]._`;

        return finalReview;
    } catch (error) {
        console.error('❌ AI Review error:', error.message);
        return 'AI Review could not be completed.';
    }
}
