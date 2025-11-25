class TestUtils {
  static generateRandomString(length) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateItemData(overrides = {}) {
    const baseData = {
      sellerID: 222222,
      name: `TestItem-${this.generateRandomString(8)}`,
      price: Math.floor(Math.random() * 1000) + 1,
      statistics: {
        likes: Math.floor(Math.random() * 100) + 1,
        viewCount: Math.floor(Math.random() * 1000) + 1,
        contacts: Math.floor(Math.random() * 50) + 1,
      },
    };

    return { ...baseData, ...overrides };
  }

  static async createTestItem(request, baseUrl, customData = {}) {
    const itemData = this.generateItemData(customData);
    const response = await request(baseUrl).post("/api/1/item").send(itemData);

    if (response.status === 201) {
      const itemId = response.body.status.replace(
        "Сохранили объявление - ",
        ""
      );
      return { itemId, itemData, response };
    }

    return { itemId: null, itemData, response };
  }

  static async cleanupTestItem(request, baseUrl, itemId) {
    if (itemId) {
      try {
        await request(baseUrl).delete(`/api/2/item/${itemId}`);
      } catch (error) {
        console.log(`Cleanup failed for item ${itemId}:`, error.message);
      }
    }
  }
}

module.exports = TestUtils;
