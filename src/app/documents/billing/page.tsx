import { getUserSubscriptionPlan } from '~/lib/stripe'

import BillingClientPage from './page.client'

export default async function BillingPage() {
  const subscriptionPlan = await getUserSubscriptionPlan()

  return <BillingClientPage subscriptionPlan={subscriptionPlan} />
}
