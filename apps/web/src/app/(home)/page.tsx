export const dynamic = 'force-dynamic';
import MainHero from "@/components/mainHero";
import VmProductCarousel from "@/components/productcarousel/vm";
import { prisma } from "database";

export default async function Home() {

  const skus = await prisma.sku.findMany({
    where: {
      sku_type: "virtual_machine",
      category: "shared",
    },
  });

  return (
    <div>
      <MainHero />
      <div className="">
        <div className="text-center p-5 text-2xl">Virtual Machines</div>
        <div className="content px-10 pb-10 text-center">
          <div>
            Our Virtual Machines run in a secure datacenter with redundant
            infrastructure to ensure your applications are always available.
          </div>
          <div>
            {" "}
            We offer a variety of sizes to fit your needs, if you don&apos;t see
            what you need, let us know and we can work with you to create a
            custom solution.
          </div>
        </div>
        <VmProductCarousel skus={skus} />
      </div>
    </div >
  );
}
