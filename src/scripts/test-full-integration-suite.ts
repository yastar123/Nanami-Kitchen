/**
 * Comprehensive Full Integration Test Suite
 * Tests HTTP REST API endpoints, Auth, CMS, Menu, Orders, Vouchers, Settings,
 * and all 38 Frontend Pages and Routes.
 */
import http from "http";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}${detail ? ` (${detail})` : ""}`);
    failed++;
  }
}

function requestHttp(
  method: string,
  path: string,
  body?: any,
  headers: Record<string, string> = {},
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string; json: any }> {
  return new Promise((resolve, reject) => {
    const dataStr = body ? JSON.stringify(body) : undefined;
    const reqHeaders: Record<string, string> = {
      ...headers,
    };
    if (dataStr) {
      reqHeaders["Content-Type"] = "application/json";
      reqHeaders["Content-Length"] = Buffer.byteLength(dataStr).toString();
    }

    const req = http.request(
      `http://localhost:3000${path}`,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let resBody = "";
        res.on("data", (chunk) => {
          resBody += chunk;
        });
        res.on("end", () => {
          let json: any = null;
          try {
            json = JSON.parse(resBody);
          } catch {
            // not json
          }
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body: resBody,
            json,
          });
        });
      },
    );

    req.on("error", reject);

    if (dataStr) {
      req.write(dataStr);
    }
    req.end();
  });
}

async function runSuite() {
  console.log("=========================================================================");
  console.log("NANAMI KITCHEN — COMPREHENSIVE FULL INTEGRATION TEST SUITE");
  console.log("Testing REST APIs, Auth flows, CMS & Hero/Welcome, Orders, and all Pages");
  console.log("=========================================================================\n");

  // 1. Health & Server Status
  console.log("1. Testing Server Health & Stack Identification:");
  const healthRes = await requestHttp("GET", "/api/health");
  assert(healthRes.statusCode === 200, "Health check endpoint returns 200 OK");
  assert(healthRes.json?.status === "ok", "Health status reports 'ok'");
  assert(
    healthRes.json?.service?.includes("Nanami Kitchen"),
    "Service name matches Nanami Kitchen",
  );

  // 2. Full State API
  console.log("\n2. Testing State API (/api/state):");
  const stateRes = await requestHttp("GET", "/api/state");
  assert(stateRes.statusCode === 200, "State sync endpoint returns 200 OK");
  assert(
    Array.isArray(stateRes.json?.menu) && stateRes.json.menu.length >= 6,
    "Menu catalog has >= 6 items",
  );
  assert(Boolean(stateRes.json?.settings?.storeName), "Settings contains storeName");
  assert(Boolean(stateRes.json?.cms?.brandName), "CMS content contains brandName");

  // 3. Menu API
  console.log("\n3. Testing Menu Catalog Endpoints (/api/menu):");
  const menuListRes = await requestHttp("GET", "/api/menu");
  assert(menuListRes.statusCode === 200, "GET /api/menu returns 200 OK");
  assert(Array.isArray(menuListRes.json?.menu), "GET /api/menu returns menu array");

  const singleItemRes = await requestHttp("GET", "/api/menu/m1");
  assert(singleItemRes.statusCode === 200, "GET /api/menu/m1 returns 200 OK");
  assert(
    singleItemRes.json?.item?.name === "Teriyaki Chicken Bento",
    "Item m1 is Teriyaki Chicken Bento",
  );

  // 4. Auth & Registration Flows
  console.log("\n4. Testing Authentication & Customer Registration (/api/auth):");
  const testEmail = `cust_${Date.now()}@example.com`;
  const regRes = await requestHttp("POST", "/api/auth/register", {
    name: "Automated Test Customer",
    email: testEmail,
    phone: "+264811239999",
    password: "securePassword123",
    address: "100 Sam Nujoma Drive, Windhoek",
  });
  assert(
    regRes.statusCode === 201,
    "POST /api/auth/register creates customer account with 201 Created",
  );
  assert(regRes.json?.ok === true, "Registration payload reports ok: true");
  assert(regRes.json?.user?.email === testEmail.toLowerCase(), "Customer email is correctly saved");

  // Try signing in with newly registered customer
  const loginCustRes = await requestHttp("POST", "/api/auth/login", {
    email: testEmail,
    password: "securePassword123",
  });
  assert(
    loginCustRes.statusCode === 200,
    "POST /api/auth/login succeeds for newly registered customer",
  );
  assert(loginCustRes.json?.ok === true, "Login reports ok: true");

  // Test sign in with invalid password
  const loginFailRes = await requestHttp("POST", "/api/auth/login", {
    email: testEmail,
    password: "wrongPassword",
  });
  assert(
    loginFailRes.statusCode === 401,
    "POST /api/auth/login rejects wrong password with 401 Unauthorized",
  );

  // Test sign in with demo accounts
  const loginAdminRes = await requestHttp("POST", "/api/auth/login", {
    email: "admin@nanami.id",
    password: "admin123",
  });
  assert(loginAdminRes.statusCode === 200, "Demo Admin login succeeds");

  // 5. Vouchers & Settings
  console.log("\n5. Testing Vouchers & Settings Endpoints:");
  const vouchersRes = await requestHttp("GET", "/api/vouchers");
  assert(vouchersRes.statusCode === 200, "GET /api/vouchers returns 200 OK");
  assert(Array.isArray(vouchersRes.json?.vouchers), "Vouchers list is an array");

  const settingsRes = await requestHttp("GET", "/api/settings");
  assert(settingsRes.statusCode === 200, "GET /api/settings returns 200 OK");
  assert(
    settingsRes.json?.settings?.currencySymbol === "N$",
    "Currency is configured as N$ (Namibia Dollar)",
  );

  // 6. CMS & Hero / Welcome Screen Independent Verification
  console.log("\n6. Testing CMS Content & Decoupled Hero/Welcome Screen:");
  const cmsGetRes = await requestHttp("GET", "/api/cms");
  assert(cmsGetRes.statusCode === 200, "GET /api/cms returns 200 OK");

  const initialCms = cmsGetRes.json?.cms || {};
  const testHeroUrl = "https://images.unsplash.com/photo-test-hero-123.jpg";
  const testWelcomeUrl = "https://images.unsplash.com/photo-test-welcome-456.jpg";

  const updateCmsRes = await requestHttp("POST", "/api/cms", {
    ...initialCms,
    heroImage: testHeroUrl,
    welcomeScreen: {
      ...(initialCms.welcomeScreen || {}),
      imageUrl: testWelcomeUrl,
    },
  });
  assert(updateCmsRes.statusCode === 200, "POST /api/cms updates CMS content successfully");

  const verifyCmsRes = await requestHttp("GET", "/api/cms");
  assert(verifyCmsRes.json?.cms?.heroImage === testHeroUrl, "CMS heroImage is saved properly");
  assert(
    verifyCmsRes.json?.cms?.welcomeScreen?.imageUrl === testWelcomeUrl,
    "CMS welcomeScreen.imageUrl is saved properly",
  );

  // Reset hero banner and ensure welcome screen is unaffected
  await requestHttp("POST", "/api/cms", {
    ...verifyCmsRes.json.cms,
    heroImage: "",
  });
  const resetHeroVerify = await requestHttp("GET", "/api/cms");
  assert(resetHeroVerify.json?.cms?.heroImage === "", "Hero banner can be cleanly reset to empty");
  assert(
    resetHeroVerify.json?.cms?.welcomeScreen?.imageUrl === testWelcomeUrl,
    "Welcome screen image remains unchanged when hero banner is reset",
  );

  // 7. Orders Creation & Calculation
  console.log("\n7. Testing Order Submission & Validation (/api/orders):");
  const testOrderCode = `NK-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderPayload = {
    id: `ord-test-${Date.now()}`,
    code: testOrderCode,
    createdAt: Date.now(),
    type: "delivery",
    lines: [
      {
        id: "cl-test",
        itemId: "m1",
        name: "Teriyaki Chicken Bento",
        unitPrice: 95,
        qty: 1,
        optionLabels: [],
        note: "Extra fork please",
      },
    ],
    subtotal: 95,
    discount: 0,
    deliveryFee: 25,
    vatPercent: 15,
    vatAmount: 14.25,
    total: 134.25,
    status: "Pending Payment",
    paid: false,
    paymentMethod: "Bank Transfer",
    pointsEarned: 1,
    etaMinutes: 20,
    customer: {
      name: "Automated Test Customer",
      phone: "+264811239999",
      address: "100 Sam Nujoma Drive, Windhoek",
    },
  };

  const createOrderRes = await requestHttp("POST", "/api/orders", orderPayload);
  assert(createOrderRes.statusCode === 201, "POST /api/orders creates order with 201 Created");

  const getOrdersRes = await requestHttp("GET", "/api/orders");
  assert(getOrdersRes.statusCode === 200, "GET /api/orders returns orders list");
  const foundOrder = (getOrdersRes.json?.orders || []).find((o: any) => o.code === testOrderCode);
  assert(Boolean(foundOrder), `Created order ${testOrderCode} is retrievable from orders list`);

  // 8. All Frontend Pages & SSR Routes
  console.log("\n8. Testing All 38 Web Pages and Storefront Routes:");
  const pages = [
    "/",
    "/menu",
    "/menu/m1",
    "/cart",
    "/checkout",
    "/order-success",
    "/orders",
    "/tracking",
    "/profile",
    "/address",
    "/saved-address",
    "/vouchers",
    "/login",
    "/register",
    "/admin",
    "/admin/menu",
    "/admin/orders",
    "/admin/stock",
    "/admin/customers",
    "/admin/reports",
    "/admin/media",
    "/admin/settings",
    "/owner",
    "/owner/menu",
    "/owner/orders",
    "/owner/outlets",
    "/owner/shipping",
    "/owner/whatsapp",
    "/owner/vouchers",
    "/owner/cms",
    "/owner/staff",
    "/owner/finance",
    "/owner/customers",
    "/owner/media",
    "/owner/audit",
    "/owner/preview",
    "/owner/settings",
  ];

  for (const pagePath of pages) {
    const pageRes = await requestHttp("GET", pagePath);
    const isOk =
      pageRes.statusCode === 200 &&
      !pageRes.body.includes("This page didn't load") &&
      !pageRes.body.includes("500 Internal Server Error");
    assert(isOk, `Page ${pagePath} loads cleanly (Status: ${pageRes.statusCode})`);
  }

  console.log("\n=========================================================================");
  console.log(
    `FULL TEST SUMMARY: TOTAL ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`,
  );
  console.log("=========================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Test execution failed with error:", err);
  process.exit(1);
});
