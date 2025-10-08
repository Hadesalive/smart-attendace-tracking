// Test QR token decoding
// Run this in browser console to debug token issues

// Example QR URL from your lecturer screen:
// https://yourapp.com/attend/a27cd36e-568c-45d5-bd98-427f4fb0508d?token=YTI3Y2QzNmUtNTY4Yy00NWQ1LWJkOTgtNDI3ZjRmYjA1MDhkOjI5MzMyMzI0

function testToken(qrUrl) {
  try {
    const url = new URL(qrUrl);
    const token = url.searchParams.get('token');
    const sessionId = url.pathname.split('/attend/')[1];
    
    console.log('📱 QR URL:', qrUrl);
    console.log('🔑 Token:', token);
    console.log('📋 Session ID from URL:', sessionId);
    
    if (!token) {
      console.error('❌ No token found in URL!');
      return;
    }
    
    // Decode the token
    const decoded = atob(token);
    console.log('🔓 Decoded token:', decoded);
    
    const [tokenSessionId, tokenTimestamp] = decoded.split(':');
    console.log('📋 Session ID from token:', tokenSessionId);
    console.log('⏰ Token timestamp:', tokenTimestamp);
    
    // Check session ID match
    if (tokenSessionId !== sessionId) {
      console.error('❌ SESSION ID MISMATCH!');
      console.error('   URL has:', sessionId);
      console.error('   Token has:', tokenSessionId);
    } else {
      console.log('✅ Session IDs match!');
    }
    
    // Check token age
    const now = Date.now();
    const tokenTime = parseInt(tokenTimestamp) * 60000;
    const tokenAge = now - tokenTime;
    const maxAge = 2 * 60 * 1000; // 2 minutes
    
    console.log('⏱️ Current time:', new Date(now).toISOString());
    console.log('⏱️ Token time:', new Date(tokenTime).toISOString());
    console.log('⏱️ Token age:', Math.floor(tokenAge / 1000), 'seconds');
    console.log('⏱️ Max age:', Math.floor(maxAge / 1000), 'seconds');
    
    if (tokenAge > maxAge) {
      console.error('❌ TOKEN EXPIRED! (too old)');
      console.error('   Age:', Math.floor(tokenAge / 1000), 'seconds');
      console.error('   Max:', Math.floor(maxAge / 1000), 'seconds');
    } else if (tokenAge < -60000) {
      console.error('❌ TOKEN EXPIRED! (too far in future - clock skew)');
    } else {
      console.log('✅ Token is valid and not expired!');
    }
    
  } catch (e) {
    console.error('❌ Error testing token:', e);
    console.error(e.stack);
  }
}

// Test with your actual QR URL
console.log('Copy the QR URL from your lecturer screen and run:');
console.log('testToken("PASTE_QR_URL_HERE")');

