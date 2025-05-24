package types

type Attributes struct {
	CpuMfg        string `json:"cpu_mfg"`
	CpuType       string `json:"cpu_type"`
	CpuModel      string `json:"cpu_model"`
	CpuAssignment string `json:"cpu_assignment"`
	CpuGeneration int    `json:"cpu_generation"`
	CpuCores      int    `json:"cpu_cores"`
	Memory        int    `json:"memory"`
	StorageSize   int    `json:"storage_size"`
	StorageType   string `json:"storage_type"`
	Catagory      string `json:"catagory"`
	Size          string `json:"size"`
}

type Sku struct {
	ID                string     `json:"id"`
	Sku               string     `json:"sku"`
	StripePersonalSku string     `json:"stripe_personal_sku"`
	StripeBusinessSku string     `json:"stripe_business_sku"`
	Name              string     `json:"name"`
	SkuType           string     `json:"sku_type"`
	Description       string     `json:"description"`
	Category          string     `json:"category"`
	Price             int        `json:"price"`
	Attributes        Attributes `json:"attributes"`
	Popular           *bool      `json:"popular,omitempty"`
	Available         *bool      `json:"available,omitempty"`
	Quantity          int        `json:"quantity"`
}
