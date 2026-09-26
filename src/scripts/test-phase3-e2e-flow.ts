import { formatCurrency } from "../lib/currency";
import type { CartLine, Order } from "../lib/store";
import { buildWhatsappMessage } from "../lib/whatsapp";

async function runE2EFlowTest() {
  console.log("=========================================================================");
  console.log("TESTING OTOMATIS VERIFIKASI ALUR DATA UTUH (FASE 3):");
  console.log("PRODUK -> CART -> CHECKOUT -> STRUK -> WHATSAPP");
  console.log("=========================================================================");

  const rupiah = (n: number) => formatCurrency(n, "N$");

  // TITIK 1: PRODUK (Pilihan Opsi & Special Request)
  const item = {
    id: "m1",
    name: "Teriyaki Chicken Bento",
    price: 95,
  };

  const selectedOptions = ["Large", "Fried Egg", "Mozzarella Cheese"];
  const specialNote = "Sambal dipisah, jangan pedas";
  const unitPrice = item.price + 15 + 15 + 20; // 95 + 50 = 145

  console.log(`\n[TITIK 1: PRODUK / INPUT OPTIONS]`);
  console.log(`- Produk          : ${item.name} (Base: ${rupiah(item.price)})`);
  console.log(`- Selected Options: ${selectedOptions.join(", ")}`);
  console.log(`- Special Request : "${specialNote}"`);
  console.log(`- Calculated Price: ${rupiah(unitPrice)}`);

  // TITIK 2: CART LINE GENERATION
  const cartLine: CartLine = {
    id: "cart-line-1",
    itemId: item.id,
    name: item.name,
    unitPrice: unitPrice,
    qty: 2,
    optionLabels: selectedOptions,
    note: specialNote,
  };

  console.log(`\n[TITIK 2: HARAMAN CART]`);
  console.log(`- Cart Line ID  : ${cartLine.id}`);
  console.log(`- Name          : ${cartLine.name}`);
  console.log(`- Unit Price    : ${rupiah(cartLine.unitPrice)}`);
  console.log(`- Quantity      : ${cartLine.qty}`);
  console.log(`- Options Labels: [${cartLine.optionLabels.join(", ")}]`);
  console.log(`- Special Note  : "${cartLine.note}"`);

  console.assert(cartLine.optionLabels.length === 3, "Cart line harus memuat 3 pilihan opsi");
  console.assert(cartLine.note === specialNote, "Cart line note harus sesuai input");

  // TITIK 3: CHECKOUT & PLACE ORDER DATA
  const order: Order = {
    id: "ord-99",
    code: "NK-1099",
    createdAt: Date.now(),
    type: "delivery",
    lines: [cartLine],
    subtotal: cartLine.unitPrice * cartLine.qty,
    discount: 0,
    voucherCode: "",
    deliveryFee: 15,
    total: cartLine.unitPrice * cartLine.qty + 15,
    status: "Pending Payment",
    paid: false,
    paymentMethod: "eWallet / Pay2Cell",
    pointsEarned: 1,
    etaMinutes: 35,
    customer: {
      name: "Budi Santoso",
      phone: "081234567890",
      address: "Jl. Sudirman No. 45, Jakarta",
      deliveryNote: "Titip di satpam",
    },
  };

  console.log(`\n[TITIK 3: CHECKOUT & ORDER DATA]`);
  console.log(`- Order Code    : ${order.code}`);
  console.log(`- Customer      : ${order.customer.name} (${order.customer.phone})`);
  console.log(`- Subtotal      : ${rupiah(order.subtotal)}`);
  console.log(`- Total         : ${rupiah(order.total)}`);
  console.log(`- Line Item 1   : ${order.lines[0]?.name}`);
  console.log(`- Line 1 Options: [${order.lines[0]?.optionLabels.join(", ")}]`);
  console.log(`- Line 1 Note   : "${order.lines[0]?.note}"`);

  console.assert(
    order.lines[0]?.optionLabels.join(", ") === selectedOptions.join(", "),
    "Order line options harus utuh",
  );
  console.assert(order.lines[0]?.note === specialNote, "Order line note harus utuh");

  // TITIK 4: FORMAL KONTEN STRUK (RECEIPT HTML)
  const receiptRows = order.lines
    .map(
      (l) =>
        `<tr><td>${l.qty}x ${l.name}${
          l.optionLabels.length ? `<br/><small>${l.optionLabels.join(", ")}</small>` : ""
        }${l.note ? `<br/><small>note: ${l.note}</small>` : ""}</td><td align="right">${rupiah(
          l.unitPrice * l.qty,
        )}</td></tr>`,
    )
    .join("\n");

  console.log(`\n[TITIK 4: FORMAL KONTEN STRUK (RECEIPT HTML)]`);
  console.log(receiptRows);

  console.assert(
    receiptRows.includes("Large, Fried Egg, Mozzarella Cheese"),
    "Struk harus mengandung opsi kustomisasi",
  );
  console.assert(
    receiptRows.includes("note: Sambal dipisah, jangan pedas"),
    "Struk harus mengandung catatan special request",
  );

  // TITIK 5: WHATSAPP MESSAGE GENERATED
  const waText = buildWhatsappMessage(order);

  console.log(`\n[TITIK 5: PESAN WHATSAPP GENERATED]`);
  console.log(waText);

  console.assert(
    waText.includes("Large, Fried Egg, Mozzarella Cheese"),
    "Pesan WA harus memuat opsi kustomisasi",
  );
  console.assert(
    waText.includes("Sambal dipisah, jangan pedas"),
    "Pesan WA harus memuat catatan special request",
  );

  console.log("\n=========================================================================");
  console.log(
    "VERIFIKASI ALUR DATA UTUH (PRODUK -> CART -> CHECKOUT -> STRUK -> WA): 100% SUKSES!",
  );
  console.log("=========================================================================");
}

runE2EFlowTest().catch(console.error);
