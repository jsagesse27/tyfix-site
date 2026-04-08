import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Leave a Review — TyFix Auto Sales',
  description: 'Share your experience with TyFix Auto Sales on Google. Your feedback helps us improve and helps other buyers find us.',
  robots: { index: false, follow: false },
};

const GOOGLE_REVIEW_URL = 'https://g.page/r/Cde5nVyjo3INEBM/review';

/**
 * /review — Redirects to the Google Reviews page for TyFix.
 * Can also be used as a QR code destination for review request cards.
 */
export default function ReviewPage() {
  redirect(GOOGLE_REVIEW_URL);
}
