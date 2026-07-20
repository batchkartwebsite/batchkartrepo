import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-[#f0fdf4] via-[#ecfdf5] to-[#f7fee7] dark:from-background dark:via-background dark:to-background">
      <section className="mx-auto max-w-[1160px] px-6 py-24 text-center lg:px-[60px]">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700">
          🎓 India&apos;s largest coaching batch marketplace
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Discover the right batch.{" "}
          <span className="text-primary">Pay less, prepare smarter.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Compare coaching institutes across India, unlock exclusive discounts, and get matched to
          batches that fit your exam, city, and budget.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg">Explore batches</Button>
          <Button size="lg" variant="outline">
            Post a requirement
          </Button>
        </div>
      </section>
    </div>
  );
}
