export default async (request, context) => {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  console.log("Consultation function invoked.");

  try {
    // Get the form data from the request
    let formData;
    try {
      formData = await request.json();
      console.log("Received form data:", JSON.stringify(formData, null, 2));
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid request format'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Get the webhook URL from the form data
    const { webhook_url, ...forwardData } = formData;

    // Security: Validate the webhook URL to ensure it's a trusted domain
    if (!webhook_url || !webhook_url.startsWith('https://n8n.srv874889.hstgr.cloud/')) {
      console.error('Invalid or missing webhook URL:', webhook_url);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid webhook URL provided'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    console.log(`Forwarding data to n8n webhook: ${webhook_url}`);

    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(forwardData), // Forward the rest of the data
    });

    console.log(`n8n webhook responded with status: ${response.status}`);

    if (response.ok) {
      const responseData = await response.json().catch(() => ({}));
      console.log("n8n webhook call successful. Response data:", JSON.stringify(responseData, null, 2));
      return new Response(JSON.stringify({ success: true, data: responseData }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } else {
      const errorText = await response.text();
      console.error(`n8n webhook error (${response.status}):`, errorText);
      throw new Error(`n8n webhook responded with status: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Consultation form submission error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to submit consultation request'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};