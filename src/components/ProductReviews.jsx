import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Loader2, MessageSquare, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchProductReviews, saveProductReview } from '../services/reviewService'

function StarRating({ rating, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        interactive ? (
          <button key={star} type="button" onClick={() => onChange(star)} aria-label={`Rate ${star} out of 5 stars`} aria-pressed={rating === star}>
            <Star size={27} className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
          </button>
        ) : (
          <Star key={star} size={17} className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
        )
      ))}
    </div>
  )
}

function ProductReviews({ productId }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError('')
      const data = await fetchProductReviews(productId)
      setReviews(data)

      const currentUserId = user?.id || user?._id
      const ownReview = currentUserId
        ? data.find((review) => String(review.user?._id) === String(currentUserId))
        : null
      if (ownReview) {
        setRating(ownReview.rating)
        setComment(ownReview.comment)
      } else {
        setRating(5)
        setComment('')
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load product reviews.'
      setLoadError(message)
    } finally {
      setLoading(false)
    }
  }, [productId, user])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (comment.trim().length < 10) {
      toast.error('Review must contain at least 10 characters.')
      return
    }

    try {
      setSubmitting(true)
      await saveProductReview(productId, { rating, comment: comment.trim() })
      toast.success('Your review has been saved!')
      await loadReviews()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save your review.')
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0
  const canSubmitReview = isAuthenticated && user?.role === 'customer'
  const currentUserId = user?.id || user?._id
  const hasOwnReview = Boolean(currentUserId && reviews.some((review) => String(review.user?._id) === String(currentUserId)))

  return (
    <section className="mt-12 border-t pt-10" aria-labelledby="reviews-title">
      <header className="mb-8">
        <h2 id="reviews-title" className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
        <p className="mt-2 text-gray-500">Reviews from customers who have received their orders.</p>
      </header>

      <div className="mb-8 flex flex-col gap-5 rounded-2xl bg-gray-50 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)} <span className="text-lg text-gray-500">/ 5</span></p>
          <StarRating rating={Math.round(averageRating)} />
          <p className="mt-2 text-sm text-gray-500">{reviews.length} review(s)</p>
        </div>
        <p className="text-sm text-gray-600 sm:border-l sm:pl-6">Only customers with a delivered order can submit a review.</p>
      </div>

      {canSubmitReview ? (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">{hasOwnReview ? 'Edit Your Review' : 'Write a Review'}</h3>
          <p className="mb-2 text-sm font-medium text-gray-700">Your Rating</p>
          <StarRating rating={rating} interactive onChange={setRating} />
          <label htmlFor="reviewComment" className="mb-2 mt-6 block text-sm font-medium text-gray-700">Your Review</label>
          <textarea
            id="reviewComment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={4}
            minLength={10}
            maxLength={1000}
            placeholder="Share your experience with this product..."
            className="w-full resize-none rounded-xl border border-gray-300 p-4 outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="mt-1 text-right text-xs text-gray-400">{comment.length}/1000 characters</p>
          <button type="submit" disabled={submitting} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
            {submitting ? 'Saving...' : hasOwnReview ? 'Update Review' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="mb-8 rounded-2xl border bg-white p-6 text-sm text-gray-600">
          <p><Link to="/login" className="font-semibold text-blue-600 hover:underline">Sign in</Link> as a customer to leave a review after your order is delivered.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8" role="status"><Loader2 className="animate-spin text-blue-600" /><span className="sr-only">Loading reviews</span></div>
      ) : loadError ? (
        <div className="rounded-2xl bg-gray-50 py-8 text-center">
          <p className="mb-3 text-sm text-red-600" role="alert">{loadError}</p>
          <button onClick={loadReviews} className="font-medium text-blue-600 hover:underline">Try again</button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 py-10 text-center">
          <MessageSquare size={35} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-700">No reviews yet.</p>
          <p className="mt-1 text-sm text-gray-500">Be the first customer to share your experience.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <article key={review._id} className="border-b border-gray-100 pb-5 last:border-0">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-gray-800">{review.user?.name || 'Customer'}</p>
                  <p className="mt-1 text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{review.comment}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default ProductReviews
