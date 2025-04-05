import VmCard from "@/components/productcards/vm";
import { prisma } from "@repo/database";

export default async function VmProductCarousel({ type }: { type: string }) {
  const skus = await prisma.sku.findMany({
    where: {
      type: type,
      category: "VM",
    },
  });

  function returnId(index: number): string {
    return `carousel-item-${index}`;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-clip">
      {skus.map((sku, index) => (
        <div
          key={index.toString()}
          id={returnId(index)}
          className="carousel-item relative"
        >
          <VmCard {...sku} />
        </div>
      ))}
    </div>
  );
}
