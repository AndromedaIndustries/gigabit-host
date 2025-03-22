import type { skus } from "@repo/database";

interface attributes {
  cpu_mfg: string;
  cpu_type: string;
  cpu_model: string;
  cpu_assignment: string;
  cpu_generation: number;
  cpu_cores: number;
  memory: number;
  storage_size: number;
  storage_type: string;
  catagory: string;
  size: string;
}

function formatGeneration(generation: number): string {
  if (generation === 11 || generation === 12 || generation === 13) {
    return `${generation}th`;
  }
  if (generation % 10 === 1) {
    return `${generation}st`;
  }
  if (generation % 10 === 2) {
    return `${generation}nd`;
  }
  if (generation % 10 === 3) {
    return `${generation}rd`;
  }

  return `${generation}th`;
}

function formatTitleCase(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export default function VmCard(product: skus) {
  if (product.category !== "VM") {
    return null;
  }
  let cpu_mfg = null;
  let cpu_type = null;
  let cpu_model = null;
  let cpu_assignment = null;
  let cpu_generation = null;
  let cpu_cores = null;
  let memory = null;
  let storage_size = null;
  let storage_type = null;

  if (product.attributes != null) {
    const attr = product.attributes as unknown as attributes;

    cpu_mfg = attr.cpu_mfg;
    cpu_type = attr.cpu_type;
    cpu_model = attr.cpu_model;
    cpu_assignment = attr.cpu_assignment;
    cpu_generation = attr.cpu_generation;
    cpu_cores = attr.cpu_cores;
    memory = attr.memory;
    storage_size = attr.storage_size;
    storage_type = attr.storage_type;
  }

  return (
    <div className="card mx-10 md:mx-0 w-full md:w-96  bg-base-300 shadow-sm">
      <div className="card-body justify-between">
        <div className="flex justify-between">
          <div className="text-2xl font-bold">{product.sku}</div>
          <span className="text-xl">${product.price}/mo</span>
        </div>
        {product.popular === true ? (
          <span className="badge badge-xs badge-success">Most Popular</span>
        ) : null}
        <div>{product.description}</div>
        {product.attributes == null ? null : (
          <ul className="mt-6 flex flex-col gap-2 text-xs list-disc">
            {cpu_generation == null ? null : (
              <li>
                CPU Gen: {formatGeneration(cpu_generation)} Gen{" "}
                {cpu_mfg == null ? null : cpu_mfg}{" "}
                {cpu_type == null ? null : cpu_type}
              </li>
            )}
            {cpu_model == null ? null : (
              <li>
                Host CPU: {cpu_type == null ? null : cpu_type} {cpu_model}
              </li>
            )}
            {cpu_cores == null ? null : (
              <li>
                {cpu_assignment == null
                  ? null
                  : formatTitleCase(cpu_assignment)}{" "}
                CPU: {cpu_cores} vCPU
              </li>
            )}
            {memory == null ? null : <li>RAM: {memory} GB</li>}
            {storage_size == null ? null : <li>Storage: {storage_size} GB</li>}
            {storage_type == null ? null : (
              <li>Storage Type: {storage_type}</li>
            )}
          </ul>
        )}
        <div className="mt-6">
          {product.available === true ? (
            <div className="btn btn-primary btn-block">Available now</div>
          ) : (
            <div className="btn btn-info btn-block">Coming soon</div>
          )}
        </div>
      </div>
    </div>
  );
}
