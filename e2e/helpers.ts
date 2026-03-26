export const helpers = {
  async login(email: string, password: string) {
    await element(by.id("email-input")).typeText(email);
    await element(by.id("password-input")).typeText(password);
    await element(by.id("login-btn")).tap();
  },

  async addProductToCart(productName: string) {
    await element(by.id("search-input")).typeText(productName);
    await element(by.text(productName)).tap();
  },

  async completeSale() {
    await element(by.id("complete-sale-btn")).tap();
  },
};
