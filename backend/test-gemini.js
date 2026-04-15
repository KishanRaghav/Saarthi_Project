// Test the Gemini API directly
require('dotenv').config();

async function testGeminiAPI() {
  console.log('🔍 Testing Gemini API...\n');
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set in .env file!');
    return;
  }
  
  console.log('API Key found:', GEMINI_API_KEY.substring(0, 10) + '...\n');
  
  const testMessage = "Hello, how are you?";
  
  console.log('Sending test message to Gemini API...');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: testMessage }],
            },
          ],
        }),
      }
    );

    console.log('Response Status:', response.status);
    
    const data = await response.json();
    console.log('\n📦 Full Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error('\n❌ API Error:', data.error.message);
      console.error('Error Details:', data.error);
    } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log('\n✅ Success! Reply:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('\n⚠️ No text in response');
    }
    
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

testGeminiAPI();
