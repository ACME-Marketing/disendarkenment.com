import { GraphQLClient, gql } from 'graphql-request';

const endpoint = 'https://cms.acmemarketing.us/graphql';

export const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    // You can add authentication headers here if your GraphQL endpoint requires them
    // For now, we'll assume it's public or handled by other means
  },
  timeout: 30000, // 30 second timeout
  retry: 3, // Retry failed requests up to 3 times
});

// Enhanced request function with retry logic for build-time reliability
export async function requestWithRetry(query, variables = {}, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`GraphQL request attempt ${attempt}/${maxRetries}`);
      const result = await graphQLClient.request(query, variables);
      console.log(`GraphQL request successful on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.error(`GraphQL request failed on attempt ${attempt}:`, error.message);
      lastError = error;
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export { gql };