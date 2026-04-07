import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Adyen Return URL Handler
 * This endpoint handles redirects from Adyen after 3D Secure or other redirect-based authentication
 * 
 * Flow:
 * 1. User completes 3DS authentication on issuer page
 * 2. Issuer redirects to this endpoint with payment data (redirectResult, sessionId, or payload)
 * 3. This handler encodes the data and redirects to /checkout with hash
 * 4. Frontend useEffect in AdyenHeadlessCheckout detects hash and processes payment
 * 
 * @see packages/module-quote/Components/Checkout/AdyenPayment/AdyenHeadlessCheckout.tsx
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Support both GET and POST methods (Adyen can use either)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract payment data from query params (GET) or body (POST)
    const params = req.method === 'GET' ? req.query : req.body;


    const { redirectResult, sessionId, payload, MD, PaRes, paymentData: adyenPaymentData } = params;

    console.log('[Adyen Return] Processing redirect return');

    // Validate that we have at least one payment parameter
    if (!redirectResult && !sessionId && !payload && !MD && !PaRes) {
      console.error('[Adyen Return] No payment data received');
      return res.redirect(302, '/checkout#adyen-error=missing_data');
    }

    // Build payment data object with all available parameters
    const paymentData: Record<string, string> = {};

    if (redirectResult) {
      paymentData.redirectResult = redirectResult as string;
      console.log('[Adyen Return] Has redirectResult');
    }

    if (sessionId) {
      paymentData.sessionId = sessionId as string;
      console.log('[Adyen Return] Has sessionId');
    }

    if (payload) {
      paymentData.payload = payload as string;
      console.log('[Adyen Return] Has payload');
    }

    // Support legacy 3DS1 parameters (MD and PaRes)
    if (MD) {
      paymentData.MD = MD as string;
      console.log('[Adyen Return] Has MD (3DS1)');
    }

    if (PaRes) {
      paymentData.PaRes = PaRes as string;
      console.log('[Adyen Return] Has PaRes (3DS1)');
    }

    if (adyenPaymentData) {
      paymentData.paymentData = adyenPaymentData as string;
      console.log('[Adyen Return] Has paymentData (session token)');
    }

    // Encode payment data as base64 to pass in hash (not visible in browser history)
    const encodedData = Buffer.from(JSON.stringify(paymentData)).toString('base64');

    // Redirect back to checkout page with payment details in hash
    // The Adyen component will read this and process the payment
    const redirectUrl = `/checkout#adyen-return=${encodedData}`;

    console.log('[Adyen Return] Redirecting to checkout');
    res.redirect(302, redirectUrl);
  } catch (error) {
    console.error('[Adyen Return] Error processing return:', error);
    // Redirect to checkout with error flag
    res.redirect(302, '/checkout#adyen-error=payment_failed');
  }
}