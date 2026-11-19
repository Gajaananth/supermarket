import { Pool } from "pg";

interface Env {
  HYPERDRIVE: { connectionString: string };
  JWT_SECRET: string;
  DEMO_OTP_CODE: string;
}

interface UserRow {
  id: string;
  role: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  passwordHash: string | null;
  isActive: boolean;
  isDemoAccount: boolean;
  isTwoFactorEnabled: boolean;
  storeId: string | null;
  storeCode: string | null;
  storeName: string | null;
  storeAddress: string | null;
  storeLocality: string | null;
  storeOpeningTime: string | null;
  storeClosingTime: string | null;
  riderProfileId: string | null;
  kycStatus: string | null;
  riderType: string | null;
  assignedStoreId: string | null;
  bikeNumber: string | null;
  rejectionReason: string | null;
}

interface OtpRow {
  id: string;
  codeHash: string;
  attemptsCount: number;
}

async function pbkdf2Verify(password: string, encodedHash: string): Promise<boolean> {
  const parts = encodedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isSafeInteger(iterations) || iterations < 100000) return false;
  const salt = Uint8Array.from(parts[2].match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []);
  const expected = parts[3];
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  const actual = Array.from(new Uint8Array(derived), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return actual === expected;
}

const userQuery = `
  SELECT u."id", u."role"::text, u."fullName", u."email", u."phone",
         u."passwordHash", u."isActive", u."isDemoAccount", u."isTwoFactorEnabled",
         s."id" AS "storeId", s."code" AS "storeCode", s."name" AS "storeName",
         s."address" AS "storeAddress", s."locality" AS "storeLocality",
         s."openingTime" AS "storeOpeningTime", s."closingTime" AS "storeClosingTime",
         rp."id" AS "riderProfileId", rp."kycStatus"::text AS "kycStatus",
         rp."riderType"::text AS "riderType", rp."assignedStoreId", rp."bikeNumber",
         rp."rejectionReason"
  FROM "User" u
  LEFT JOIN "StoreAdmin" sa ON sa."userId" = u."id"
  LEFT JOIN "Store" s ON s."id" = sa."storeId"
  LEFT JOIN "RiderProfile" rp ON rp."userId" = u."id"
`;

function poolFor(env: Env): Pool {
  return new Pool({
    connectionString: env.HYPERDRIVE.connectionString,
    max: 1,
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 1000,
    query_timeout: 8000,
    statement_timeout: 8000,
  });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function success(data: unknown): Response {
  return json({ success: true, data });
}

function failure(message: string, status: number): Response {
  return json({ statusCode: status, message }, status);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function issueAccessToken(user: UserRow, secret: string): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payload = encodeBase64Url(new TextEncoder().encode(JSON.stringify({
    sub: user.id,
    role: user.role,
    email: user.email,
    phone: user.phone,
    fullName: user.fullName,
    iat: issuedAt,
    exp: issuedAt + 15 * 60,
  })));
  const input = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
  return `${input}.${encodeBase64Url(new Uint8Array(signature))}`;
}

async function verifyAccessToken(token: string, secret: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0]))) as { alg?: string };
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1]))) as {
      sub?: string;
      exp?: number;
    };
    if (header.alg !== "HS256" || typeof payload.sub !== "string" ||
        typeof payload.exp !== "number" || payload.exp <= Date.now() / 1000) {
      return null;
    }
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    return valid ? payload.sub : null;
  } catch {
    return null;
  }
}

function publicUser(user: UserRow) {
  return {
    id: user.id,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    store: user.storeId ? {
      id: user.storeId,
      code: user.storeCode,
      name: user.storeName,
      address: user.storeAddress,
      locality: user.storeLocality,
      openingTime: user.storeOpeningTime,
      closingTime: user.storeClosingTime,
    } : null,
    riderProfile: user.riderProfileId ? {
      id: user.riderProfileId,
      kycStatus: user.kycStatus,
      riderType: user.riderType,
      assignedStoreId: user.assignedStoreId,
      bikeNumber: user.bikeNumber,
      rejectionReason: user.rejectionReason,
    } : null,
  };
}

async function userById(pool: Pool, id: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(`${userQuery} WHERE u."id" = $1 LIMIT 1`, [id]);
  return result.rows[0] ?? null;
}

async function createSession(
  pool: Pool,
  env: Env,
  user: UserRow,
  deviceId: unknown,
  request: Request,
) {
  const accessToken = await issueAccessToken(user, env.JWT_SECRET);
  const refreshToken = Array.from(crypto.getRandomValues(new Uint8Array(40)))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  const refreshTokenHash = await digest(refreshToken);
  await pool.query(
    `INSERT INTO "DeviceSession"
      ("id", "userId", "refreshTokenHash", "deviceId", "deviceInfo", "ipAddress", "userAgent", "expiresAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW() + INTERVAL '30 days')`,
    [
      user.id,
      refreshTokenHash,
      typeof deviceId === "string" && deviceId.length <= 100 ? deviceId : "unknown-device",
      request.headers.get("x-device-info")?.slice(0, 255) ?? null,
      request.headers.get("cf-connecting-ip"),
      request.headers.get("user-agent"),
    ],
  );
  return {
    accessToken,
    refreshToken,
    expiresIn: "15m",
    user: publicUser(user),
  };
}

async function getOtp(
  pool: Pool,
  destination: string,
  purpose: "LOGIN" | "RIDER_LOGIN" | "ADMIN_2FA",
): Promise<OtpRow | null> {
  const result = await pool.query<OtpRow>(
    `SELECT "id", "codeHash", "attemptsCount"
     FROM "OtpRequest"
     WHERE "destination" = $1 AND "purpose" = $2 AND "isUsed" = false
       AND "expiresAt" > NOW()
     ORDER BY "createdAt" DESC LIMIT 1`,
    [destination, purpose],
  );
  return result.rows[0] ?? null;
}

async function requestOtp(
  pool: Pool,
  env: Env,
  destination: string,
  role: "CUSTOMER" | "RIDER",
  purpose: "LOGIN" | "RIDER_LOGIN",
): Promise<Response> {
  const lookup = destination.includes("@")
    ? `WHERE u."email" = $1`
    : `WHERE u."phone" = $1`;
  const result = await pool.query<UserRow>(`${userQuery} ${lookup} LIMIT 1`, [destination]);
  const user = result.rows[0];
  if (!user || user.role !== role || !user.isActive) {
    return failure(role === "RIDER" ? "No rider account found with this phone number or email." : "Customer account not available for this phone number.", 400);
  }
  if (!user.isDemoAccount || !/^\d{6}$/.test(env.DEMO_OTP_CODE)) {
    return failure("OTP delivery is not configured for this staging account.", 503);
  }
  await pool.query(
    `INSERT INTO "OtpRequest" ("id", "destination", "purpose", "codeHash", "expiresAt")
     VALUES (gen_random_uuid(), $1, $2, $3, NOW() + INTERVAL '5 minutes')`,
    [destination, purpose, await digest(env.DEMO_OTP_CODE)],
  );
  return success({
    message: "Staging demo verification code ready",
    expiresInSeconds: 300,
    demoCode: env.DEMO_OTP_CODE,
  });
}

async function verifyOtp(
  pool: Pool,
  env: Env,
  destination: string,
  code: string,
  purpose: "LOGIN" | "RIDER_LOGIN",
  role: "CUSTOMER" | "RIDER",
  deviceId: unknown,
  request: Request,
): Promise<Response> {
  const otp = await getOtp(pool, destination, purpose);
  if (!otp) return failure("Verification code is invalid or has expired", 400);
  if (otp.attemptsCount >= 3) {
    return failure("Maximum verification attempts exceeded. Please request a new code.", 400);
  }
  if (otp.codeHash !== await digest(code)) {
    await pool.query(`UPDATE "OtpRequest" SET "attemptsCount" = "attemptsCount" + 1 WHERE "id" = $1`, [otp.id]);
    return failure("Incorrect verification code", 400);
  }
  const consumed = await pool.query(
    `UPDATE "OtpRequest" SET "isUsed" = true WHERE "id" = $1 AND "isUsed" = false RETURNING "id"`,
    [otp.id],
  );
  if (!consumed.rowCount) return failure("Verification code is invalid or has expired", 400);

  const lookup = destination.includes("@")
    ? `WHERE u."email" = $1`
    : `WHERE u."phone" = $1`;
  const result = await pool.query<UserRow>(`${userQuery} ${lookup} LIMIT 1`, [destination]);
  const user = result.rows[0];
  if (!user || user.role !== role || !user.isActive) {
    return failure(role === "RIDER" ? "Rider account has been deactivated" : "Account has been suspended", 403);
  }
  return success(await createSession(pool, env, user, deviceId, request));
}

async function adminLogin(pool: Pool, env: Env, body: Record<string, unknown>, request: Request): Promise<Response> {
  if (typeof body.email !== "string" || typeof body.password !== "string" ||
      body.email.length > 255 || body.password.length > 1024) {
    return failure("A valid email and password are required.", 400);
  }
  const result = await pool.query<UserRow>(`${userQuery} WHERE u."email" = $1 LIMIT 1`, [body.email.toLowerCase()]);
  const user = result.rows[0];
  if (!user || !["SUPER_ADMIN", "STORE_ADMIN"].includes(user.role) || !user.passwordHash) {
    return failure("Invalid admin credentials", 401);
  }
  if (!user.isActive) return failure("Admin account has been deactivated", 403);
  const passwordHash = user.passwordHash;
  if (!await pbkdf2Verify(String(body.password), passwordHash)) {
    return failure("Invalid admin credentials", 401);
  }
  if (user.role === "SUPER_ADMIN" && user.isTwoFactorEnabled) {
    if (!user.isDemoAccount || !/^\d{6}$/.test(env.DEMO_OTP_CODE)) {
      return failure("Admin two-factor delivery is not configured.", 503);
    }
    await pool.query(
      `INSERT INTO "OtpRequest" ("id", "destination", "purpose", "codeHash", "expiresAt")
       VALUES (gen_random_uuid(), $1, 'ADMIN_2FA', $2, NOW() + INTERVAL '5 minutes')`,
      [user.email, await digest(env.DEMO_OTP_CODE)],
    );
    return success({
      requires2fa: true,
      message: "Staging demo two-factor code ready",
      email: user.email,
      demoCode: env.DEMO_OTP_CODE,
    });
  }
  return success(await createSession(pool, env, user, body.deviceId, request));
}

async function verifyAdminOtp(
  pool: Pool,
  env: Env,
  body: Record<string, unknown>,
  request: Request,
): Promise<Response> {
  if (typeof body.email !== "string" || typeof body.code !== "string" || !/^\d{6}$/.test(body.code)) {
    return failure("A valid email and six-digit code are required.", 400);
  }
  const otp = await getOtp(pool, body.email.toLowerCase(), "ADMIN_2FA");
  if (!otp || otp.attemptsCount >= 3) return failure("2FA code is invalid or has expired", 400);
  if (otp.codeHash !== await digest(body.code)) {
    await pool.query(`UPDATE "OtpRequest" SET "attemptsCount" = "attemptsCount" + 1 WHERE "id" = $1`, [otp.id]);
    return failure("Incorrect verification code", 400);
  }
  const consumed = await pool.query(
    `UPDATE "OtpRequest" SET "isUsed" = true WHERE "id" = $1 AND "isUsed" = false RETURNING "id"`,
    [otp.id],
  );
  if (!consumed.rowCount) return failure("2FA code is invalid or has expired", 400);
  const result = await pool.query<UserRow>(
    `${userQuery} WHERE u."email" = $1 AND u."role" = 'SUPER_ADMIN' LIMIT 1`,
    [body.email.toLowerCase()],
  );
  const user = result.rows[0];
  if (!user || !user.isActive) return failure("Admin account has been deactivated", 403);
  return success(await createSession(pool, env, user, body.deviceId, request));
}

async function currentUser(pool: Pool, env: Env, request: Request): Promise<UserRow | null> {
  const bearer = request.headers.get("authorization");
  if (!bearer?.startsWith("Bearer ")) return null;
  const id = await verifyAccessToken(bearer.slice(7), env.JWT_SECRET);
  if (!id) return null;
  const user = await userById(pool, id);
  return user?.isActive ? user : null;
}

async function refreshSession(pool: Pool, env: Env, body: Record<string, unknown>, request: Request): Promise<Response> {
  if (typeof body.refreshToken !== "string" || body.refreshToken.length > 256) {
    return failure("Session expired or invalid. Please login again.", 401);
  }
  const oldHash = await digest(body.refreshToken);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const session = await client.query<{ id: string; userId: string; deviceId: string }>(
      `SELECT "id", "userId", "deviceId" FROM "DeviceSession"
       WHERE "refreshTokenHash" = $1 AND "isRevoked" = false AND "expiresAt" > NOW()
       FOR UPDATE`,
      [oldHash],
    );
    const row = session.rows[0];
    if (!row) {
      await client.query("ROLLBACK");
      return failure("Session expired or invalid. Please login again.", 401);
    }
    const user = await userById(pool, row.userId);
    if (!user || !user.isActive) {
      await client.query("ROLLBACK");
      return failure("User is deactivated or session invalid", 401);
    }
    await client.query(`UPDATE "DeviceSession" SET "isRevoked" = true, "pushToken" = NULL WHERE "id" = $1`, [row.id]);
    await client.query("COMMIT");
    return success(await createSession(pool, env, user, body.deviceId || row.deviceId, request));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function route(request: Request, env: Env): Promise<Response> {
  if (!env.HYPERDRIVE?.connectionString || !env.JWT_SECRET || !env.DEMO_OTP_CODE) {
    return failure("The staging API is not fully configured.", 503);
  }
  const pool = poolFor(env);
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");

  if (path === "/health" && request.method === "GET") {
    await pool.query("SELECT 1");
    return success({ status: "ok", scope: "staging-demo" });
  }

  if (path === "/api/v1/stores" && request.method === "GET") {
    const stores = await pool.query(
      `SELECT "id", "code", "name", "address", "locality", "openingTime", "closingTime"
       FROM "Store" WHERE "isActive" = true ORDER BY "code"`,
    );
    return success({ count: stores.rowCount, stores: stores.rows });
  }

  if (path === "/api/v1/stores/admin" && request.method === "GET") {
    const stores = await pool.query(
      `SELECT s."id", s."code", s."name", s."slug", s."address", s."locality",
              s."contactPhone", s."isActive", s."openingTime", s."closingTime",
              s."serviceRadiusKm"::text, s."minOrderAmount"::text,
              s."freeDeliveryThreshold"::text, s."cashHoldThreshold"::text,
              s."cashHoldMaxHours",
              COALESCE(json_agg(json_build_object(
                'id', dz."id", 'zoneNumber', dz."zoneNumber", 'name', dz."name",
                'baseFee', dz."baseFee"::text,
                'minOrderForFreeDelivery', dz."minOrderForFreeDelivery"::text,
                'estimatedDeliveryMins', dz."estimatedDeliveryMins", 'isActive', dz."isActive"
              )) FILTER (WHERE dz."id" IS NOT NULL), '[]') AS "deliveryZones"
       FROM "Store" s
       LEFT JOIN "DeliveryZone" dz ON dz."storeId" = s."id"
       GROUP BY s."id" ORDER BY s."code"`,
    );
    return success({ count: stores.rowCount, stores: stores.rows });
  }

  if (path === "/api/v1/reports/overview" && request.method === "GET") {
    return success({
      from: url.searchParams.get("from") ?? new Date().toISOString().slice(0, 10),
      to: url.searchParams.get("to") ?? new Date().toISOString().slice(0, 10),
      storeId: url.searchParams.get("storeId"),
      summary: { orders: 0, deliveredOrders: 0, cancelledOrders: 0, revenue: 0 },
      daily: [],
    });
  }

  if (path === "/api/v1/warehouse/stock" && request.method === "GET") {
    const stock = await pool.query(
      `SELECT mi."id", mi."quantityOnHand", mi."quantityReserved", mi."reorderLevel",
              json_build_object(
                'id', mp."id", 'sku', mp."sku", 'name', mp."name", 'barcode', mp."barcode",
                'categoryId', mp."categoryId", 'unit', mp."unit",
                'costPrice', mp."costPrice"::text, 'baseSellingPrice', mp."baseSellingPrice"::text,
                'isActive', mp."isActive", 'imageUrl', mp."imageUrl",
                'category', json_build_object('id', c."id", 'name', c."name", 'slug', c."slug", 'isActive', c."isActive")
              ) AS "masterProduct"
       FROM "MasterInventory" mi
       JOIN "MasterProduct" mp ON mp."id" = mi."masterProductId"
       JOIN "Category" c ON c."id" = mp."categoryId"
       WHERE mp."isActive" = true
       ORDER BY mp."name"`,
    );
    return success(stock.rows);
  }

  if (path === "/api/v1/riders/review-queue" && request.method === "GET") {
    const queue = await pool.query(
      `SELECT rp."id", rp."bikeNumber", rp."kycStatus"::text AS "kycStatus",
              rp."createdAt", rp."updatedAt",
              json_build_object(
                'id', u."id", 'fullName', u."fullName",
                'phone', u."phone", 'email', u."email"
              ) AS "user"
       FROM "RiderProfile" rp
       JOIN "User" u ON u."id" = rp."userId"
       WHERE rp."kycStatus"::text != 'APPROVED'
       ORDER BY rp."createdAt" DESC`,
    );
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "25");
    return success({
      items: queue.rows.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      total: queue.rowCount,
    });
  }

  if (path === "/api/v1/transfers" && request.method === "GET") {
    return success([]);
  }

  if (path === "/api/v1/orders" && request.method === "GET") {
    return success({ count: 0, orders: [] });
  }

  if (path === "/api/v1/orders/eligible-riders" && request.method === "GET") {
    const riders = await pool.query(
      `SELECT rp."id", rp."bikeNumber", rp."kycStatus"::text AS "kycStatus",
              rp."assignedStoreId",
              json_build_object('id', u."id", 'fullName', u."fullName",
                                'phone', u."phone", 'email', u."email") AS "user"
       FROM "RiderProfile" rp
       JOIN "User" u ON u."id" = rp."userId"
       WHERE rp."kycStatus"::text = 'APPROVED' AND u."isActive" = true`,
    );
    return success(riders.rows);
  }

  if (path === "/api/v1/cash-control/deposits/verification-queue" && request.method === "GET") {
    return success({ count: 0, items: [] });
  }

  const riderDetailMatch = path.match(/^\/api\/v1\/riders\/review-queue\/([0-9a-f-]{36})$/i);
  if (riderDetailMatch && request.method === "GET") {
    const result = await pool.query(
      `SELECT rp."id", rp."bikeNumber", rp."kycStatus"::text AS "kycStatus",
              rp."riderType"::text AS "riderType", rp."assignedStoreId",
              rp."rejectionReason", rp."createdAt", rp."updatedAt",
              json_build_object('id', u."id", 'fullName', u."fullName",
                                'phone', u."phone", 'email', u."email") AS "user",
              json_build_object(
                'drivingLicenceAvailable', rp."drivingLicenceObjectKey" IS NOT NULL,
                'vehicleLicenceAvailable', rp."vehicleLicenceObjectKey" IS NOT NULL
              ) AS "documents"
       FROM "RiderProfile" rp
       JOIN "User" u ON u."id" = rp."userId"
       WHERE rp."id" = $1`,
      [riderDetailMatch[1]],
    );
    if (!result.rowCount) return failure("Rider not found", 404);
    return success(result.rows[0]);
  }

  const catalogMatch = path.match(/^\/api\/v1\/stores\/([0-9a-f-]{36})\/catalog$/i);
  if (catalogMatch && request.method === "GET") {
    const storeId = catalogMatch[1];
    const store = await pool.query(`SELECT 1 FROM "Store" WHERE "id" = $1 AND "isActive" = true`, [storeId]);
    if (!store.rowCount) return failure("Store not found", 404);
    const search = url.searchParams.get("query")?.trim().slice(0, 100);
    const products = await pool.query(
      `SELECT sp."id", sp."masterProductId", sp."customPrice"::text AS "customPrice",
              sp."isAvailable",
              json_build_object(
                'id', mp."id", 'name', mp."name", 'description', mp."description",
                'unit', mp."unit", 'baseSellingPrice', mp."baseSellingPrice"::text,
                'imageUrl', mp."imageUrl",
                'category', json_build_object('name', c."name", 'icon', c."icon")
              ) AS "masterProduct"
       FROM "StoreProduct" sp
       JOIN "MasterProduct" mp ON mp."id" = sp."masterProductId"
       JOIN "Category" c ON c."id" = mp."categoryId"
       WHERE sp."storeId" = $1 AND sp."isAvailable" = true AND mp."isActive" = true
         AND ($2::text IS NULL OR mp."name" ILIKE '%' || $2 || '%' OR mp."barcode" ILIKE $2)
       ORDER BY mp."name"`,
      [storeId, search || null],
    );
    return success(products.rows);
  }

  const storeSettingsMatch = path.match(/^\/api\/v1\/stores\/([0-9a-f-]{36})\/settings$/i);
  if (storeSettingsMatch && request.method === "GET") {
    const result = await pool.query(
      `SELECT s."id", s."code", s."name", s."slug", s."address", s."locality",
              s."contactPhone", s."isActive", s."openingTime", s."closingTime",
              s."serviceRadiusKm"::text, s."minOrderAmount"::text,
              s."freeDeliveryThreshold"::text, s."cashHoldThreshold"::text,
              s."cashHoldMaxHours",
              COALESCE(json_agg(json_build_object(
                'id', dz."id", 'zoneNumber', dz."zoneNumber", 'name', dz."name",
                'baseFee', dz."baseFee"::text,
                'minOrderForFreeDelivery', dz."minOrderForFreeDelivery"::text,
                'estimatedDeliveryMins', dz."estimatedDeliveryMins", 'isActive', dz."isActive"
              )) FILTER (WHERE dz."id" IS NOT NULL), '[]') AS "deliveryZones"
       FROM "Store" s
       LEFT JOIN "DeliveryZone" dz ON dz."storeId" = s."id"
       WHERE s."id" = $1
       GROUP BY s."id"`,
      [storeSettingsMatch[1]],
    );
    if (!result.rowCount) return failure("Store not found", 404);
    return success(result.rows[0]);
  }

  const storeStockMatch = path.match(/^\/api\/v1\/stores\/([0-9a-f-]{36})\/stock$/i);
  if (storeStockMatch && request.method === "GET") {
    const stock = await pool.query(
      `SELECT sp."id", sp."quantityOnHand", sp."quantityReserved", sp."reorderLevel",
              sp."isAvailable", sp."customPrice"::text,
              json_build_object(
                'id', mp."id", 'sku', mp."sku", 'name', mp."name", 'barcode', mp."barcode",
                'categoryId', mp."categoryId", 'unit', mp."unit",
                'costPrice', mp."costPrice"::text, 'baseSellingPrice', mp."baseSellingPrice"::text,
                'isActive', mp."isActive", 'imageUrl', mp."imageUrl",
                'category', json_build_object('id', c."id", 'name', c."name", 'slug', c."slug", 'isActive', c."isActive")
              ) AS "masterProduct"
       FROM "StoreProduct" sp
       JOIN "MasterProduct" mp ON mp."id" = sp."masterProductId"
       JOIN "Category" c ON c."id" = mp."categoryId"
       WHERE sp."storeId" = $1
       ORDER BY mp."name"`,
      [storeStockMatch[1]],
    );
    return success(stock.rows);
  }

  const storeAlertsMatch = path.match(/^\/api\/v1\/stores\/([0-9a-f-]{36})\/alerts$/i);
  if (storeAlertsMatch && request.method === "GET") {
    return success([]);
  }

  if (request.method === "POST") {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return failure("Request body must be valid JSON.", 400);
    }
    if (!isRecord(body)) return failure("Request body must be a JSON object.", 400);

    if (path === "/api/v1/auth/customer/otp-request" &&
        typeof body.phone === "string") {
      const phone = body.phone.startsWith("0") && /^0\d{9}$/.test(body.phone)
        ? `+94${body.phone.slice(1)}`
        : body.phone.startsWith("94") && /^94\d{9}$/.test(body.phone)
          ? `+${body.phone}`
          : body.phone;
      if (/^\+94\d{9}$/.test(phone)) {
        return requestOtp(pool, env, phone, "CUSTOMER", "LOGIN");
      }
    }
    if (path === "/api/v1/auth/customer/otp-verify" &&
        typeof body.phone === "string" &&
        typeof body.code === "string" && /^\d{6}$/.test(body.code)) {
      const phone = body.phone.startsWith("0") && /^0\d{9}$/.test(body.phone)
        ? `+94${body.phone.slice(1)}`
        : body.phone.startsWith("94") && /^94\d{9}$/.test(body.phone)
          ? `+${body.phone}`
          : body.phone;
      if (/^\+94\d{9}$/.test(phone)) {
        return verifyOtp(pool, env, phone, body.code, "LOGIN", "CUSTOMER", body.deviceId, request);
      }
    }
    if (path === "/api/v1/auth/rider/otp-request" &&
        typeof body.destination === "string" && body.destination.length <= 100) {
      return requestOtp(pool, env, body.destination, "RIDER", "RIDER_LOGIN");
    }
    if (path === "/api/v1/auth/rider/otp-verify" &&
        typeof body.destination === "string" && body.destination.length <= 100 &&
        typeof body.code === "string" && /^\d{6}$/.test(body.code)) {
      return verifyOtp(pool, env, body.destination, body.code, "RIDER_LOGIN", "RIDER", body.deviceId, request);
    }
    if (path === "/api/v1/auth/admin/login") return adminLogin(pool, env, body, request);
    if (path === "/api/v1/auth/admin/verify-2fa") return verifyAdminOtp(pool, env, body, request);
    if (path === "/api/v1/auth/refresh") return refreshSession(pool, env, body, request);
    if (path === "/api/v1/auth/logout" && typeof body.refreshToken === "string") {
      await pool.query(
        `UPDATE "DeviceSession" SET "isRevoked" = true, "pushToken" = NULL
         WHERE "refreshTokenHash" = $1`,
        [await digest(body.refreshToken)],
      );
      return success({ message: "Logged out successfully" });
    }
    if (path === "/api/v1/auth/logout-all") {
      const user = await currentUser(pool, env, request);
      if (!user) return failure("Unauthorized", 401);
      const revoked = await pool.query(
        `UPDATE "DeviceSession" SET "isRevoked" = true, "pushToken" = NULL
         WHERE "userId" = $1 AND "isRevoked" = false`,
        [user.id],
      );
      return success({ revokedSessions: revoked.rowCount });
    }

    if (/^\/api\/v1\/orders\/[0-9a-f-]{36}\/(accept|reject|preparing|ready|assign-rider)$/.test(path) ||
        /^\/api\/v1\/transfers\/[0-9a-f-]{36}\/(dispatch|receive|cancel|revert|resolve)$/.test(path) ||
        /^\/api\/v1\/warehouse\/stock\/[0-9a-f-]{36}\/adjust$/.test(path) ||
        /^\/api\/v1\/stores\/[0-9a-f-]{36}\/stock\/[0-9a-f-]{36}\/adjust$/.test(path) ||
        /^\/api\/v1\/riders\/[0-9a-f-]{36}\/(approve|reject)$/.test(path) ||
        /^\/api\/v1\/cash-control\/deposits\/[0-9a-f-]{36}\/(verify|reject)$/.test(path) ||
        path === "/api/v1/transfers") {
      return success({ updated: true, message: "Demo staging operation completed." });
    }
  }

  if (path === "/api/v1/auth/me" && request.method === "GET") {
    const user = await currentUser(pool, env, request);
    return user ? success(publicUser(user)) : failure("Unauthorized", 401);
  }

  const riderDocumentMatch = path.match(/^\/api\/v1\/riders\/[0-9a-f-]{36}\/kyc\/[^/]+\/url$/i);
  if (riderDocumentMatch && request.method === "GET") {
    return success({ url: "", message: "No private document is stored for this demo rider." });
  }

  const depositSlipMatch = path.match(/^\/api\/v1\/cash-control\/deposits\/[0-9a-f-]{36}\/slip-url$/i);
  if (depositSlipMatch && request.method === "GET") {
    return success({ url: "", message: "No deposit slip is stored for this demo." });
  }

  if (request.method === "PATCH") {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return failure("Request body must be valid JSON.", 400);
    }
    const storeSettingsMatch = path.match(/^\/api\/v1\/stores\/([0-9a-f-]{36})\/settings$/i);
    if (storeSettingsMatch) {
      if (!isRecord(body)) return failure("Request body must be a JSON object.", 400);
      await pool.query(
        `UPDATE "Store" SET
           "openingTime" = COALESCE($2, "openingTime"),
           "closingTime" = COALESCE($3, "closingTime"),
           "minOrderAmount" = COALESCE($4, "minOrderAmount"),
           "freeDeliveryThreshold" = COALESCE($5, "freeDeliveryThreshold"),
           "cashHoldThreshold" = COALESCE($6, "cashHoldThreshold"),
           "cashHoldMaxHours" = COALESCE($7, "cashHoldMaxHours"),
           "allowPriceOverride" = COALESCE($8, "allowPriceOverride"),
           "updatedAt" = NOW()
         WHERE "id" = $1`,
        [
          storeSettingsMatch[1],
          typeof body.openingTime === "string" ? body.openingTime : null,
          typeof body.closingTime === "string" ? body.closingTime : null,
          typeof body.minOrderAmount === "number" ? body.minOrderAmount : null,
          typeof body.freeDeliveryThreshold === "number" ? body.freeDeliveryThreshold : null,
          typeof body.cashHoldThreshold === "number" ? body.cashHoldThreshold : null,
          typeof body.cashHoldMaxHours === "number" ? body.cashHoldMaxHours : null,
          typeof body.allowPriceOverride === "boolean" ? body.allowPriceOverride : null,
        ],
      );
      return success({ updated: true });
    }
    const storeStatusMatch = path.match(/^\/api\/v1\/stores\/([0-9a-f-]{36})\/status$/i);
    if (storeStatusMatch) {
      if (!isRecord(body)) return failure("Request body must be a JSON object.", 400);
      await pool.query(
        `UPDATE "Store" SET "isActive" = COALESCE($2, "isActive"), "updatedAt" = NOW() WHERE "id" = $1`,
        [storeStatusMatch[1], typeof body.isActive === "boolean" ? body.isActive : null],
      );
      return success({ updated: true });
    }
    if (/^\/api\/v1\/stores\/[0-9a-f-]{36}\/alerts\/[0-9a-f-]{36}\/acknowledge$/.test(path)) {
      return success({ acknowledged: true });
    }
  }

  return failure("Endpoint not available in the staging demo API.", 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await route(request, env);
    } catch (error) {
      console.error(
        "Staging API request failed.",
        error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      );
      return failure("The staging API request could not be completed.", 500);
    }
  },
};
