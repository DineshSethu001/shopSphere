import Razorpay from 'razorpay'

const createRazorpayClient = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return null
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  })
}

export const getRazorpayClient = () => createRazorpayClient()
