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

  try {
    // Get the form data from the request
    let formData;
    try {
      formData = await request.json();
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
    
    // Forward the request to the n8n webhook
    const response = await fetch('https://n8n.srv874889.hstgr.cloud/webhook-test/b1fc5008-d10f-42f0-92aa-91d8a3806319', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      const errorText = await response.text();
      console.error(`n8n webhook error (${response.status}):`, errorText);
      throw new Error(`n8n webhook responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Consultation form submission error:', error);
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