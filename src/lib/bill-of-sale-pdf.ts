import { jsPDF } from 'jspdf';
import { formatPrice } from './utils';

interface BillOfSaleData {
  vehicle: {
    year: string;
    make: string;
    model: string;
    vin: string;
    mileage: number;
    color: string;
  };
  buyer: {
    name: string;
    phone: string;
    address: string;
  };
  seller: {
    printedName: string;
    signatureBase64: string | null;
  };
  buyerSignature: string; // Base64
  salePrice: number;
  saleDate: string;
}

export function generateBillOfSalePDF(data: BillOfSaleData): Blob {
  // Create a new A4/Letter size PDF (portrait)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter' // 612 x 792 pt
  });

  const margin = 40;
  let y = margin;

  // Helpers
  const addText = (text: string, size = 10, isBold = false, x = margin) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(text, x, y);
    y += size + 6; 
  };

  const addWrappedText = (text: string, size = 10, isBold = false, x = margin) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const splitText = doc.splitTextToSize(text, 612 - margin * 2);
    doc.text(splitText, x, y);
    y += (size + 4) * splitText.length;
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    doc.setLineWidth(1);
    doc.line(x1, y1, x2, y2);
  };

  // Header
  addText('BILL OF SALE', 18, true, 250);
  y += 10;

  // Vehicle Information
  addText('Vehicle Information:', 12, true);
  addText(`Make: ${data.vehicle.make}`);
  addText(`Model: ${data.vehicle.model}`);
  addText(`Year: ${data.vehicle.year}`);
  addText(`VIN (Vehicle Identification Number): ${data.vehicle.vin}`);
  addText(`Odometer Reading: ${data.vehicle.mileage} miles`);
  addText(`Color: ${data.vehicle.color || 'N/A'}`);
  y += 15;

  // Clause 1
  addText('1. Sale Terms', 11, true);
  addWrappedText(`The Seller (${data.seller.printedName}) agrees to sell, and the Buyer (${data.buyer.name}) agrees to purchase the vehicle described above for the total purchase price of ${formatPrice(data.salePrice)} (USD), on the terms and conditions outlined below.`);
  y += 10;

  // Clause 2
  addText('2. "As Is" Condition', 11, true);
  addWrappedText('The Buyer acknowledges that the vehicle is being sold "AS IS," without any warranties or guarantees, either expressed or implied, as to the condition of the vehicle. The Buyer has had the opportunity to inspect the vehicle, have their mechanic come and inspect the vehicle or has waived the right to inspect, and accepts the vehicle in its current condition.');
  y += 10;

  // Clause 3
  addText('3. No Warranties or Guarantees', 11, true);
  addWrappedText('The Seller makes no representations or warranties regarding the condition of the vehicle. The Buyer is purchasing the vehicle with the full understanding that no warranties or guarantees are made, and the Seller is not responsible for any repairs, defects, or damages after the sale.');
  y += 10;

  // Clause 4
  addText('4. ODOMETER DISCLOSURE', 11, true);
  addWrappedText('The seller certifies that to the best of their knowledge, the odometer reading stated in this agreement is true and accurate. The buyer acknowledges that they have been informed of the odometer reading and that they accept the vehicle with this mileage.');
  y += 10;

  // Clause 5
  addText('5. Acknowledgments', 11, true);
  addWrappedText('The Buyer acknowledges that they have read and understand the terms of this Bill of Sale, including the "as is" condition of the vehicle. The Buyer further acknowledges that no further claims will be made against the Seller regarding the condition or performance of the vehicle after the sale.');
  y += 10;

  // Clause 6
  addText('6. As is acknowledgment', 11, true);
  addWrappedText('The buyer understands that I AM NOT A MECHANIC. All mechanics or car trust worthy personal can come with you to test drive & check out the car. Please bring someone mechanically inclined to inspect the car because I purchase cars as is & sell them as is without any warranties or refunds under any circumstance.');
  y += 10;

  // Clause 7
  addText('7. Car transportation', 11, true);
  addWrappedText('The buyer understands that we do not provide plates, insurance or Registration we just sell the car. Some vehicles have plates already on them from junk / salvage vehicles that may have been hard to get off the vehicle. In this case the buyer understands these plates do not go to the car, are not a replacement for their own plates & can get penalized if caught driving with them. These plates are utilized at your own risk and highly not suggested for driving.');
  y += 10;

  // Clause 8
  addText('8. Release of Liability', 11, true);
  addWrappedText('By signing below, the Driver releases the Dealer, its employees, agents, and affiliates from any and all liability, claims, damages, or actions arising out of the Driver\'s operation after purchase, including but not limited to personal injury, property damage, or vehicle damage.');
  y += 10;

  // Clause 9
  addText('9. Title transfer', 11, true);
  addWrappedText('The buyer vows to register the car immediately after purchase. The seller vows to produce to title within 30 days of purchase if it\'s not already on hand. If the title is not produced within 30 days the buyer is subjected to a full refund or a car exchange for the same value or less.');
  y += 10;

  // Clause 10
  addText('10. Acknowledgments', 11, true);
  addWrappedText('The Buyer acknowledges that they have read and understand the terms of this Bill of Sale, including the "as is" condition of the vehicle. The Buyer further acknowledges that no further claims will be made against the Seller regarding the condition or performance of the vehicle after the sale.');
  
  // Page break if necessary, though it should fit. But just in case, we can manually check y 
  if (y > 650) {
    doc.addPage();
    y = margin;
  } else {
    y += 30; // some spacing before signatures
  }

  // Signatures Section
  const signatureWidth = 150;
  const signatureHeight = 40;

  // Seller Side
  addText(`Sellers printed name: ${data.seller.printedName}`, 11);
  const sellerSigStartY = y;
  
  addText("Seller's Signature:", 11);
  if (data.seller.signatureBase64) {
    try {
      doc.addImage(data.seller.signatureBase64, 'PNG', margin + 110, y - 25, signatureWidth, signatureHeight);
    } catch(e) {}
  }
  drawLine(margin + 105, y, margin + 260, y); // signature line
  y += 20;
  
  addText(`Date: ${data.saleDate}`, 11);
  const dateLine1Y = y;
  drawLine(margin + 35, y, margin + 150, y); 
  y += 30;

  // Buyer Side
  addText(`Buyers printed name: ${data.buyer.name}`, 11);
  const buyerSigStartY = y;

  addText("Buyer's Signature:", 11);
  if (data.buyerSignature) {
    try {
      doc.addImage(data.buyerSignature, 'PNG', margin + 105, y - 25, signatureWidth, signatureHeight);
    } catch(e) {}
  }
  drawLine(margin + 105, y, margin + 260, y); // signature line
  y += 20;

  addText(`Date: ${data.saleDate}`, 11);
  const dateLine2Y = y;
  drawLine(margin + 35, y, margin + 150, y);

  return doc.output('blob');
}
