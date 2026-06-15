#!/usr/bin/env node
/**
 * 12개 화면 스크린샷 캡처 스크립트
 * 사전 조건: npm run dev 로 localhost:3000 실행 중
 * 실행: node scripts/capture-screens.mjs
 */

import puppeteer from "puppeteer";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:3000";
const OUT = path.resolve(__dirname, "../public/docs/screens");

async function main() {
  // 디렉토리 생성
  for (const section of ["entry", "browse", "purchase", "account"]) {
    await mkdir(path.join(OUT, section), { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932 });

  let captured = 0;
  const total = 13;

  async function capture(section, name, url) {
    const filePath = path.join(OUT, section, `${name}.png`);
    try {
      await page.goto(`${BASE}${url}`, { waitUntil: "networkidle2", timeout: 15000 });
      await new Promise((r) => setTimeout(r, 500));
      await page.screenshot({ path: filePath, fullPage: true });
      captured++;
      console.log(`✓ ${section}/${name}.png`);
    } catch (err) {
      console.error(`✗ ${section}/${name} — ${err.message}`);
    }
  }

  // ===== 1) 로그인 전: 로그인 페이지 =====
  await capture("entry", "login", "/login");

  // ===== 2) 로그인 =====
  const loginRes = await page.evaluate(async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "aubrey", password: "aubrey111!" }),
    });
    return { status: res.status, body: await res.json() };
  });
  console.log("로그인:", loginRes.status === 200 ? "성공" : `실패 (${loginRes.status})`);

  // ===== 3) 진입 =====
  await capture("entry", "landing", "/");

  // ===== 4) 홈·탐색 =====
  await capture("browse", "home", "/home");
  await capture("browse", "scanner", "/scanner");
  await capture("browse", "products", "/products");

  // 상품 상세: 실제 상품 ID 조회
  const productId = await page.evaluate(async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    return data.products?.[0]?.id ?? "1";
  });
  await capture("browse", "product-detail", `/products/${productId}`);

  // ===== 5) 구매 플로우 =====
  await capture("purchase", "cart", "/cart");

  // 체크아웃: 폼에 값 입력
  await page.goto(`${BASE}/checkout`, { waitUntil: "networkidle2", timeout: 15000 });
  await new Promise((r) => setTimeout(r, 500));
  // 폼 필드에 값 입력
  const inputs = await page.$$('input[type="text"], input[type="tel"]');
  const formValues = ["홍길동", "010-1234-5678", "서울시 강남구 테헤란로 123", "4층 401호"];
  for (let i = 0; i < Math.min(inputs.length, formValues.length); i++) {
    await inputs[i].click({ clickCount: 3 });
    await inputs[i].type(formValues[i]);
  }
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT, "purchase", "checkout.png"), fullPage: true });
  captured++;
  console.log("✓ purchase/checkout.png");

  // 주문 완료: 실제 주문 데이터에서 가져오기
  const firstOrder = await page.evaluate(async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    const order = data.orders?.[0];
    return order ? { id: order.id, number: order.order_number } : null;
  });
  if (firstOrder) {
    await capture("purchase", "order-complete", `/order-complete?orderId=${firstOrder.id}&orderNumber=${firstOrder.number}`);
  } else {
    console.error("✗ purchase/order-complete — 주문 데이터 없음");
  }

  // ===== 6) 주문·계정 =====
  await capture("account", "orders", "/orders");

  // 주문 상세: 실제 주문 ID 사용
  if (firstOrder) {
    await capture("account", "order-detail", `/orders/${firstOrder.id}`);
  } else {
    console.error("✗ account/order-detail — 주문 데이터 없음");
  }

  await capture("account", "my", "/my");
  await capture("account", "wallet", "/wallet");

  await browser.close();
  console.log(`\n완료: ${captured}/${total}개 캡처됨 → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
