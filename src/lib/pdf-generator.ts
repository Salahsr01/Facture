import jsPDF from "jspdf";

interface InvoiceItem {
  id: string;
  name: string;
  description: string | null;
  quantity: string;
  unitPrice: string;
  total: string;
}

interface InvoiceData {
  id: string;
  number: string;
  status: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  amountPaid: string;
  message: string | null;
  senderSnapshot: Record<string, any> | null;
  recipientSnapshot: Record<string, any> | null;
  client: {
    companyName: string;
    contactName: string | null;
    email: string | null;
    address: string | null;
  } | null;
  items: InvoiceItem[];
}

export async function generateInvoicePdf(invoice: InvoiceData): Promise<ArrayBuffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  const senderSnapshot = invoice.senderSnapshot as Record<string, any> | null;
  const recipientSnapshot = invoice.recipientSnapshot as Record<string, any> | null;

  // Helper to format currency
  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(num);
  };

  // Helper to format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  // Header - Sender info
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(
    senderSnapshot?.companyName || senderSnapshot?.name || "Entreprise",
    margin,
    y
  );
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (senderSnapshot?.address) {
    doc.text(senderSnapshot.address, margin, y);
    y += 5;
  }
  if (senderSnapshot?.email) {
    doc.text(senderSnapshot.email, margin, y);
    y += 5;
  }
  if (senderSnapshot?.phone) {
    doc.text(senderSnapshot.phone, margin, y);
    y += 5;
  }
  if (senderSnapshot?.siret) {
    doc.text(`SIRET: ${senderSnapshot.siret}`, margin, y);
    y += 5;
  }

  // Invoice title
  y += 10;
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE", pageWidth - margin, 30, { align: "right" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`N° ${invoice.number}`, pageWidth - margin, 38, { align: "right" });

  // Dates
  y = Math.max(y, 50);
  doc.setFontSize(10);
  doc.text(`Date d'émission : ${formatDate(invoice.issueDate)}`, pageWidth - margin, 48, {
    align: "right",
  });
  doc.text(`Date d'échéance : ${formatDate(invoice.dueDate)}`, pageWidth - margin, 54, {
    align: "right",
  });

  // Recipient info
  y = 70;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Facturé à :", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text(
    recipientSnapshot?.companyName || invoice.client?.companyName || "",
    margin,
    y
  );
  y += 5;

  if (recipientSnapshot?.contactName || invoice.client?.contactName) {
    doc.text(
      recipientSnapshot?.contactName || invoice.client?.contactName || "",
      margin,
      y
    );
    y += 5;
  }
  if (recipientSnapshot?.address || invoice.client?.address) {
    doc.text(
      recipientSnapshot?.address || invoice.client?.address || "",
      margin,
      y
    );
    y += 5;
  }
  if (recipientSnapshot?.email || invoice.client?.email) {
    doc.text(
      recipientSnapshot?.email || invoice.client?.email || "",
      margin,
      y
    );
    y += 5;
  }

  // Items table
  y += 15;
  const tableTop = y;
  const colWidths = [80, 25, 35, 35];
  const headers = ["Description", "Qté", "Prix unit.", "Total"];

  // Table header
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 10, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  let x = margin + 3;
  headers.forEach((header, i) => {
    if (i === 0) {
      doc.text(header, x, y);
    } else {
      doc.text(header, x + colWidths[i], y, { align: "right" });
    }
    x += colWidths[i];
  });

  y += 10;
  doc.setFont("helvetica", "normal");

  // Table rows
  invoice.items.forEach((item) => {
    x = margin + 3;

    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Description (with word wrap for long text)
    const descLines = doc.splitTextToSize(item.name, colWidths[0] - 5);
    doc.text(descLines, x, y);
    const lineHeight = descLines.length * 5;

    // Quantity
    x += colWidths[0];
    doc.text(item.quantity, x + colWidths[1], y, { align: "right" });

    // Unit price
    x += colWidths[1];
    doc.text(formatCurrency(item.unitPrice), x + colWidths[2], y, {
      align: "right",
    });

    // Total
    x += colWidths[2];
    doc.text(formatCurrency(item.total), x + colWidths[3], y, {
      align: "right",
    });

    y += Math.max(lineHeight, 7);

    // Add item description if present
    if (item.description) {
      doc.setFontSize(9);
      doc.setTextColor(100);
      const descriptionLines = doc.splitTextToSize(
        item.description,
        colWidths[0] - 5
      );
      doc.text(descriptionLines, margin + 3, y);
      y += descriptionLines.length * 4;
      doc.setFontSize(10);
      doc.setTextColor(0);
    }

    y += 3;
  });

  // Totals
  y += 10;
  const totalsX = pageWidth - margin - 60;

  doc.setFont("helvetica", "normal");
  doc.text("Sous-total HT", totalsX, y);
  doc.text(formatCurrency(invoice.subtotal), pageWidth - margin, y, {
    align: "right",
  });
  y += 7;

  doc.text(`TVA (${invoice.taxRate}%)`, totalsX, y);
  doc.text(formatCurrency(invoice.taxAmount), pageWidth - margin, y, {
    align: "right",
  });
  y += 7;

  // Total line
  doc.setDrawColor(200);
  doc.line(totalsX - 5, y - 2, pageWidth - margin, y - 2);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total TTC", totalsX, y + 3);
  doc.text(formatCurrency(invoice.total), pageWidth - margin, y + 3, {
    align: "right",
  });

  // Payment info if partially paid
  if (parseFloat(invoice.amountPaid) > 0) {
    y += 12;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 128, 0);
    doc.text("Payé", totalsX, y);
    doc.text(formatCurrency(invoice.amountPaid), pageWidth - margin, y, {
      align: "right",
    });
    y += 7;

    const remaining =
      parseFloat(invoice.total) - parseFloat(invoice.amountPaid);
    doc.setTextColor(200, 100, 0);
    doc.text("Reste à payer", totalsX, y);
    doc.text(formatCurrency(remaining), pageWidth - margin, y, {
      align: "right",
    });
    doc.setTextColor(0);
  }

  // Message
  if (invoice.message) {
    y += 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Conditions et mentions", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const messageLines = doc.splitTextToSize(
      invoice.message,
      pageWidth - 2 * margin
    );
    doc.text(messageLines, margin, y);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text(
    "Document généré automatiquement - FigmaInvoice",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  // Return ArrayBuffer
  return doc.output("arraybuffer");
}
