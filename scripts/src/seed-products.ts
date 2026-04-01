import { getStripeClient } from "./stripeClient.js";

async function seedProducts() {
  console.log("🌱 Seeding Stripe subscription products...");
  const stripe = await getStripeClient();

  const explorerProduct = await stripe.products.create({
    name: "Explorer / مستكشف",
    description:
      "Chat with Khety AI, save favourites, track visited sites, invite friends",
    metadata: { tier: "explorer" },
  });

  const explorerMonthly = await stripe.prices.create({
    product: explorerProduct.id,
    unit_amount: 399,
    currency: "usd",
    recurring: { interval: "month" },
    nickname: "Explorer Monthly",
    metadata: { tier: "explorer", period: "monthly" },
  });

  const explorerYearly = await stripe.prices.create({
    product: explorerProduct.id,
    unit_amount: 3599,
    currency: "usd",
    recurring: { interval: "year" },
    nickname: "Explorer Yearly",
    metadata: { tier: "explorer", period: "yearly" },
  });

  console.log(`✅ Explorer product: ${explorerProduct.id}`);
  console.log(`   Monthly price:    ${explorerMonthly.id}`);
  console.log(`   Yearly price:     ${explorerYearly.id}`);

  const pharaohProduct = await stripe.products.create({
    name: "Pharaoh / فرعون",
    description:
      "Everything in Explorer + offline maps, audio guides, guided tours, priority support",
    metadata: { tier: "pharaoh" },
  });

  const pharaohMonthly = await stripe.prices.create({
    product: pharaohProduct.id,
    unit_amount: 999,
    currency: "usd",
    recurring: { interval: "month" },
    nickname: "Pharaoh Monthly",
    metadata: { tier: "pharaoh", period: "monthly" },
  });

  const pharaohYearly = await stripe.prices.create({
    product: pharaohProduct.id,
    unit_amount: 8999,
    currency: "usd",
    recurring: { interval: "year" },
    nickname: "Pharaoh Yearly",
    metadata: { tier: "pharaoh", period: "yearly" },
  });

  console.log(`✅ Pharaoh product: ${pharaohProduct.id}`);
  console.log(`   Monthly price:    ${pharaohMonthly.id}`);
  console.log(`   Yearly price:     ${pharaohYearly.id}`);

  console.log("\n📋 Add these to your environment variables:");
  console.log(`EXPLORER_MONTHLY_PRICE_ID=${explorerMonthly.id}`);
  console.log(`EXPLORER_YEARLY_PRICE_ID=${explorerYearly.id}`);
  console.log(`PHARAOH_MONTHLY_PRICE_ID=${pharaohMonthly.id}`);
  console.log(`PHARAOH_YEARLY_PRICE_ID=${pharaohYearly.id}`);
  console.log(
    "\n✅ Done! Copy the price IDs above and set them as environment variables."
  );
}

seedProducts().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
