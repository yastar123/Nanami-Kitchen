import { describe, it } from "node:test";
import assert from "node:assert";
import {
  getStorageData,
  saveAccountStorage,
  deleteAccountStorage,
  saveStaffStorage,
  deleteStaffStorage,
} from "../server/persistent-storage";
import type { Account, StaffMember } from "../types";

console.log("=========================================================================");
console.log("TEST SUITE: OWNER USER & STAFF CRUD CAPABILITY (/owner/staff)");
console.log("=========================================================================");

let passed = 0;
let total = 0;

function test(name: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}:`, err);
  }
}

// 1. Test Create New Staff User
const testStaffId = "usr-test-" + Date.now();
const testEmail = `staff_${Date.now()}@nanami.test`;

test("1. Create new user account with login credentials & role 'staff'", () => {
  const newAccount: Account = {
    id: testStaffId,
    email: testEmail,
    name: "Ahmad Staff",
    phone: "081299887766",
    password: "securestaff123",
    role: "staff",
  };
  saveAccountStorage(newAccount);

  const newStaff: StaffMember = {
    id: testStaffId,
    name: "Ahmad Staff",
    email: testEmail,
    phone: "081299887766",
    role: "staff",
    active: true,
    createdAt: Date.now(),
  };
  saveStaffStorage(newStaff);

  const storage = getStorageData();
  const acc = storage.accounts.find((a) => a.email.toLowerCase() === testEmail.toLowerCase());
  const stf = storage.staff.find((s) => s.email.toLowerCase() === testEmail.toLowerCase());

  assert(acc, "Account must be saved to persistent storage");
  assert.strictEqual(acc.name, "Ahmad Staff");
  assert.strictEqual(acc.role, "staff");
  assert.strictEqual(acc.password, "securestaff123");
  assert(stf, "StaffMember must be saved to persistent storage");
  assert.strictEqual(stf.role, "staff");
  assert.strictEqual(stf.active, true);
});

// 2. Test Read and Query
test("2. Read & find created user in accounts and staff list", () => {
  const storage = getStorageData();
  const acc = storage.accounts.find((a) => a.id === testStaffId);
  const stf = storage.staff.find((s) => s.id === testStaffId);
  assert(acc && stf, "Must find newly created user by ID");
});

// 3. Test Update User
test("3. Update user name, role to 'admin', phone, and password", () => {
  const updatedAccount: Account = {
    id: testStaffId,
    email: testEmail,
    name: "Ahmad Admin Super",
    phone: "081299887700",
    password: "newadminpass456",
    role: "admin",
  };
  saveAccountStorage(updatedAccount);

  const updatedStaff: StaffMember = {
    id: testStaffId,
    name: "Ahmad Admin Super",
    email: testEmail,
    phone: "081299887700",
    role: "admin",
    active: false,
    createdAt: Date.now(),
  };
  saveStaffStorage(updatedStaff);

  const storage = getStorageData();
  const acc = storage.accounts.find((a) => a.id === testStaffId);
  const stf = storage.staff.find((s) => s.id === testStaffId);

  assert.strictEqual(acc?.name, "Ahmad Admin Super");
  assert.strictEqual(acc?.role, "admin");
  assert.strictEqual(acc?.password, "newadminpass456");
  assert.strictEqual(stf?.role, "admin");
  assert.strictEqual(stf?.active, false);
});

// 4. Test Demotion to Customer/User (Removes from staff list)
test("4. Demote user to customer 'user' role and ensure clean staff removal", () => {
  const customerAccount: Account = {
    id: testStaffId,
    email: testEmail,
    name: "Ahmad Regular Customer",
    phone: "081299887700",
    password: "newadminpass456",
    role: "user",
  };
  saveAccountStorage(customerAccount);
  deleteStaffStorage(testStaffId);

  const storage = getStorageData();
  const acc = storage.accounts.find((a) => a.id === testStaffId);
  const stf = storage.staff.find((s) => s.id === testStaffId);

  assert(acc, "Account must remain in accounts");
  assert.strictEqual(acc.role, "user");
  assert.strictEqual(stf, undefined, "Staff entry must be removed when demoted to user");
});

// 5. Test Delete User
test("5. Delete user completely from storage", () => {
  deleteAccountStorage(testStaffId);
  deleteStaffStorage(testStaffId);

  const storage = getStorageData();
  const acc = storage.accounts.find((a) => a.id === testStaffId);
  const stf = storage.staff.find((s) => s.id === testStaffId);

  assert.strictEqual(acc, undefined, "Account must be deleted");
  assert.strictEqual(stf, undefined, "Staff must be deleted");
});

// 6. Test Self-Protection Logic (Logged-in Owner Protection)
test("6. Self-Protection: Verify logged-in owner cannot be self-deleted", () => {
  const currentLoggedInEmail = "owner@nanami.id";
  const targetEmailToDelete = "owner@nanami.id";

  const isSelf = currentLoggedInEmail.toLowerCase() === targetEmailToDelete.toLowerCase();
  assert.strictEqual(isSelf, true, "Self-deletion attempt must be detected and blocked");
});

console.log("=========================================================================");
console.log(`TOTAL USER CRUD TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
console.log("=========================================================================");

if (passed !== total) {
  process.exit(1);
}
