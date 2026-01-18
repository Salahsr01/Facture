interface Service {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  number: string;
  date: string;
  emetteur: {
    name: string;
    title: string;
    siret: string;
    siren: string;
  };
  destinateur: {
    company: string;
    name: string;
    title: string;
    siret: string;
    siren: string;
  };
  services: Service[];
  subtotal: number;
  tvaRate: number;
  tvaAmount: number;
  total: number;
  bank: {
    iban: string;
    bic: string;
    bankName: string;
    bankAddress: string;
  };
  terms: string[];
}

interface InvoicePreviewProps {
  data: InvoiceData;
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  const fontFamily = "'Helvetica Neue', sans-serif";

  return (
    <div
      className="w-[595px] h-[842px] bg-[#10100e] overflow-hidden relative"
      style={{ fontFamily }}
    >
      {/* Facture Title */}
      <p
        className="absolute left-[8px] top-0 text-white text-[56.889px] font-medium"
        style={{ lineHeight: "62.608px" }}
      >
        Facture
      </p>

      {/* Invoice Number */}
      <p className="absolute left-[12px] top-[50px] text-white text-[8px]">
        <span className="font-light">Numéro de Facture</span>
        <span className="font-medium"> {data.number}</span>
      </p>

      {/* Invoice Date */}
      <p className="absolute left-[111px] top-[50px] text-white text-[8px]">
        <span className="font-light">Date de la Facture</span>
        <span className="font-medium"> {data.date}</span>
      </p>

      {/* Emetteur Section */}
      <p
        className="absolute left-[12px] top-[98px] text-white text-[16px] font-medium"
        style={{ lineHeight: "62.608px" }}
      >
        Emmeteur
      </p>

      {/* Emetteur SIRET/SIREN */}
      <p className="absolute left-[91px] top-[124px] text-white text-[8px]">
        <span className="font-light">Siret </span>
        <span className="font-medium">{data.emetteur.siret}</span>
      </p>
      <p className="absolute left-[91px] top-[138px] text-white text-[8px]">
        <span className="font-light">Siren </span>
        <span className="font-medium">{data.emetteur.siren}</span>
      </p>

      {/* Emetteur Info */}
      <div className="absolute left-[12px] top-[149px] flex items-center">
        <div className="flex flex-col gap-[1.454px]">
          <p className="text-white text-[8px] font-medium">{data.emetteur.name}</p>
          <p className="text-[#7d7d7d] text-[4.608px] font-medium">{data.emetteur.title}</p>
        </div>
      </div>

      {/* Destinateur Section */}
      <p
        className="absolute left-[12px] top-[178px] text-white text-[16px] font-medium"
        style={{ lineHeight: "62.608px" }}
      >
        Destinateur
      </p>

      {/* Destinateur Company */}
      <div className="absolute left-[13px] top-[227px] flex items-center">
        <p className="text-white text-[8px] font-medium">{data.destinateur.company}</p>
      </div>

      {/* Destinateur SIRET/SIREN */}
      <p className="absolute left-[91px] top-[223px] text-white text-[8px]">
        <span className="font-light">Siret </span>
        <span className="font-medium">{data.destinateur.siret}</span>
      </p>
      <p className="absolute left-[91px] top-[237px] text-white text-[8px]">
        <span className="font-light">Siren </span>
        <span className="font-medium">{data.destinateur.siren}</span>
      </p>

      {/* Destinateur Info */}
      <div className="absolute left-[13px] top-[248px] flex items-center">
        <div className="flex flex-col gap-[1.454px]">
          <p className="text-white text-[8px] font-medium">{data.destinateur.name}</p>
          <p className="text-[#7d7d7d] text-[4.608px] font-medium">{data.destinateur.title}</p>
        </div>
      </div>

      {/* Service Section */}
      <p className="absolute left-[12px] top-[317px] text-white text-[25.018px] font-medium">
        Service
      </p>

      {/* Services List */}
      {data.services.map((service, index) => (
        <div
          key={index}
          className="absolute left-[13px] top-[370px] w-[519px] flex items-center justify-between"
        >
          <div className="flex flex-col gap-[4px] items-start justify-center">
            <p className="text-white text-[12px] font-medium">{service.name}</p>
            <div className="flex gap-[10px] items-start">
              <p className="text-white text-[6px] font-medium w-[226px]">
                {service.description}
              </p>
              <p className="text-white text-[12px] font-medium">
                {service.quantity}* {service.unitPrice}€
              </p>
            </div>
          </div>
          <p className="text-white text-[12px] font-medium">{service.total}€</p>
        </div>
      ))}

      {/* Totals Section */}
      <div className="absolute left-[376px] top-[565px] flex flex-col gap-[11px]">
        {/* Sous-Total */}
        <div className="flex items-center justify-between w-[163px]">
          <p className="text-white text-[12px] font-medium">Sous-Total</p>
          <p className="text-white text-[12px] font-medium">{data.subtotal} €</p>
        </div>

        {/* TVA */}
        <div className="flex items-center justify-between w-[163px]">
          <div className="flex flex-col">
            <p className="text-white text-[12px] font-medium">TVA</p>
            <p className="text-[rgba(255,255,255,0.6)] text-[8px] font-medium">🇫🇷 {data.tvaRate}%</p>
          </div>
          <p className="text-white text-[12px] font-medium">{data.tvaAmount} €</p>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between w-[166px]">
          <p className="text-white text-[12px] font-medium">Total</p>
          <p className="text-white text-[12px] font-medium">{data.total}€</p>
        </div>
      </div>

      {/* Bank Section */}
      <div className="absolute left-[13px] top-[686px] w-[186px] flex flex-col gap-[10px]">
        <p className="text-white text-[16px] font-medium">Bank</p>
        <div className="text-white text-[6px] font-medium">
          <p className="mb-0">IBAN : {data.bank.iban}</p>
          <p className="mb-0">BIC / SWIFT : {data.bank.bic}</p>
          <p className="mb-0">Banque : {data.bank.bankName}</p>
          <p>Adresse de la banque : {data.bank.bankAddress}</p>
        </div>
      </div>

      {/* Terms Section */}
      <div className="absolute left-[376px] top-[686px] w-[186px] flex flex-col gap-[10px]">
        <p className="text-white text-[16px] font-medium">Terme</p>
        <ol className="text-white text-[6px] font-medium list-decimal ml-[9px]">
          {data.terms.map((term, index) => (
            <li key={index} className="mb-0">
              {term}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
