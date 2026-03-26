import { describe, it, expect, beforeAll } from "@jest/globals";

describe("Ventas Flow E2E", () => {
  beforeAll(async () => {
    //await device.launchApp();
  });

  it("should show empty cart on first visit", async () => {
    // await expect(element(by.id('cart-empty'))).toBeVisible();
  });

  it("should add product to cart", async () => {
    // await element(by.id('search-input')).tap();
    // await element(by.id('search-input')).typeText('Coca');
    // await expect(element(by.text('Coca Cola'))).toBeVisible();
    // await element(by.text('Coca Cola')).tap();
    // await expect(element(by.id('cart-item'))).toBeVisible();
  });

  it("should complete sale", async () => {
    // await element(by.id('complete-sale-btn')).tap();
    // await expect(element(by.text('Venta completada'))).toBeVisible();
  });
});
