import "dotenv/config";
import { initDb, sql } from "../src/lib/db";
import {
  seedSettings,
  seedCms,
  seedMenu,
  seedPromos,
  seedVouchers,
  seedAccounts,
  seedStaff,
  seedOrders,
  seedState,
} from "../src/lib/seed-data";
import { persistStorage, getStorageData } from "../src/server/persistent-storage";

async function runSeed() {
  console.log("==========================================");
  console.log("🌱 STARTING NANAMI KITCHEN DATABASE SEEDER");
  console.log("==========================================");

  // 1. Always update & persist to local server storage
  try {
    console.log("📦 Seeding local persistent storage (.server-data/storage.json)...");
    const current = getStorageData();
    persistStorage({
      ...current,
      settings: seedSettings,
      cms: seedCms,
      menu: seedMenu,
      promos: seedPromos,
      vouchers: seedVouchers,
      accounts: seedAccounts,
      staff: seedStaff,
      orders: seedOrders,
      mediaAssets: current.mediaAssets || [],
      sessions: current.sessions || [],
    });
    console.log("✅ Local server storage seeded successfully.");
  } catch (storageErr) {
    console.warn("⚠️ Warning: Could not write to local server storage:", storageErr);
  }

  // 2. Connect to PostgreSQL if configured
  try {
    console.log("🔌 Connecting to PostgreSQL database...");
    const initialized = await initDb();
    if (!initialized || !sql) {
      console.log("ℹ️ PostgreSQL not active or configured. Local storage seeding complete.");
      process.exit(0);
    }

    console.log("🔄 Upserting settings into 'app_settings' table...");
    await sql`
      INSERT INTO app_settings (id, data)
      VALUES ('main_settings', ${sql.json(seedSettings)})
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `;

    console.log("🔄 Upserting CMS content into 'cms_content' table...");
    await sql`
      INSERT INTO cms_content (id, data)
      VALUES ('main_cms', ${sql.json(seedCms)})
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `;

    console.log(`🔄 Seeding ${seedMenu.length} menu items into 'menu_items' table...`);
    for (const m of seedMenu) {
      await sql`
        INSERT INTO menu_items (id, name, description, price, category, image, available, prep_minutes, badges, stock, groups, special_request_enabled)
        VALUES (
          ${m.id},
          ${m.name},
          ${m.description},
          ${Number(m.price)},
          ${m.category},
          ${m.image},
          ${m.available},
          ${m.prepMinutes || 15},
          ${sql.json(m.badges || [])},
          ${m.stock !== undefined && m.stock !== null ? Number(m.stock) : null},
          ${sql.json(m.groups || [])},
          ${m.specialRequestEnabled !== false}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          category = EXCLUDED.category,
          image = EXCLUDED.image,
          available = EXCLUDED.available,
          prep_minutes = EXCLUDED.prep_minutes,
          badges = EXCLUDED.badges,
          stock = EXCLUDED.stock,
          groups = EXCLUDED.groups,
          special_request_enabled = EXCLUDED.special_request_enabled
      `;
    }

    console.log(`🔄 Seeding ${seedPromos.length} promos into 'promos' table...`);
    for (const p of seedPromos) {
      await sql`
        INSERT INTO promos (id, title, subtitle, badge, image_url, link, active)
        VALUES (${p.id}, ${p.title}, ${p.subtitle}, ${p.badge}, ${p.imageUrl || null}, ${p.link || null}, ${p.active ?? true})
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          subtitle = EXCLUDED.subtitle,
          badge = EXCLUDED.badge,
          image_url = EXCLUDED.image_url,
          link = EXCLUDED.link,
          active = EXCLUDED.active
      `;
    }

    console.log(`🔄 Seeding ${seedVouchers.length} vouchers into 'vouchers' table...`);
    for (const v of seedVouchers) {
      await sql`
        INSERT INTO vouchers (code, type, value, min_spend, active)
        VALUES (${v.code}, ${v.type}, ${Number(v.value)}, ${Number(v.minSpend)}, ${v.active ?? true})
        ON CONFLICT (code) DO UPDATE SET
          type = EXCLUDED.type,
          value = EXCLUDED.value,
          min_spend = EXCLUDED.min_spend,
          active = EXCLUDED.active
      `;
    }

    console.log(`🔄 Seeding ${seedAccounts.length} user accounts into 'accounts' table...`);
    for (const a of seedAccounts) {
      await sql`
        INSERT INTO accounts (id, email, password, name, phone, role, address, addresses, points)
        VALUES (
          ${a.id},
          ${a.email.trim().toLowerCase()},
          ${a.password},
          ${a.name},
          ${a.phone},
          ${a.role || "user"},
          ${a.address || null},
          ${sql.json(a.addresses || [])},
          ${a.points || 0}
        )
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          role = EXCLUDED.role,
          address = EXCLUDED.address,
          addresses = EXCLUDED.addresses,
          points = EXCLUDED.points
      `;
    }

    console.log(`🔄 Seeding ${seedStaff.length} team members into 'staff' table...`);
    for (const st of seedStaff) {
      await sql`
        INSERT INTO staff (id, name, email, phone, role, active, created_at)
        VALUES (${st.id}, ${st.name}, ${st.email.trim().toLowerCase()}, ${st.phone}, ${st.role}, ${st.active ?? true}, ${st.createdAt || Date.now()})
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          role = EXCLUDED.role,
          active = EXCLUDED.active
      `;
    }

    console.log(`🔄 Seeding ${seedOrders.length} initial orders into 'orders' table...`);
    for (const o of seedOrders) {
      await sql`
        INSERT INTO orders (id, code, created_at, type, lines, subtotal, discount, voucher_code, delivery_fee, total, status, paid, payment_method, points_earned, eta_minutes, customer, account_id)
        VALUES (
          ${o.id},
          ${o.code},
          ${o.createdAt},
          ${o.type},
          ${sql.json(o.lines)},
          ${o.subtotal},
          ${o.discount || 0},
          ${o.voucherCode || null},
          ${o.deliveryFee || 0},
          ${o.total},
          ${o.status},
          ${o.paid},
          ${o.paymentMethod},
          ${o.pointsEarned || 0},
          ${o.etaMinutes || 20},
          ${sql.json(o.customer)},
          ${o.accountId || null}
        )
        ON CONFLICT (id) DO UPDATE SET
          code = EXCLUDED.code,
          type = EXCLUDED.type,
          lines = EXCLUDED.lines,
          subtotal = EXCLUDED.subtotal,
          discount = EXCLUDED.discount,
          delivery_fee = EXCLUDED.delivery_fee,
          total = EXCLUDED.total,
          status = EXCLUDED.status,
          paid = EXCLUDED.paid,
          payment_method = EXCLUDED.payment_method
      `;
    }

    console.log("==========================================");
    console.log("🎉 ALL SEED DATA SUCCESSFULLY INSERTED!");
    console.log("==========================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

runSeed();
