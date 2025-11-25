const request = require("supertest");

const BASE_URL = "https://qa-internship.avito.com";
let createdItemId = null;
let testSellerId = 222222;

describe("API Tests for Advertisement System", () => {
  const validItemData = {
    sellerID: testSellerId,
    name: "Парле",
    price: 300,
    statistics: {
      likes: 1,
      viewCount: 100,
      contacts: 1,
    },
  };

  describe("Positive Test Cases", () => {
    test("Успешный поиск статистики объявления", async () => {
      const createResponse = await request(BASE_URL)
        .post("/api/1/item")
        .send(validItemData);

      const itemId = createResponse.body.status.replace(
        "Сохранили объявление - ",
        ""
      );

      const response = await request(BASE_URL)
        .get(`/api/1/statistic/${itemId}`)
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          contacts: validItemData.statistics.contacts,
          likes: validItemData.statistics.likes,
          viewCount: validItemData.statistics.viewCount,
        },
      ]);
    });

    test("Успешный поиск объявлений по ID продавца", async () => {
      const response = await request(BASE_URL)
        .get(`/api/1/${testSellerId}/item`)
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const firstItem = response.body[0];
        expect(firstItem).toHaveProperty("id");
        expect(firstItem).toHaveProperty("name");
        expect(firstItem).toHaveProperty("price");
        expect(firstItem).toHaveProperty("sellerId", testSellerId);
        expect(firstItem).toHaveProperty("statistics");
      }
    });

    test("Успешное удаление объявления", async () => {
      const createResponse = await request(BASE_URL)
        .post("/api/1/item")
        .send(validItemData);

      const itemId = createResponse.body.status.replace(
        "Сохранили объявление - ",
        ""
      );

      const deleteResponse = await request(BASE_URL)
        .delete(`/api/2/item/${itemId}`)
        .set("Accept", "application/json");

      expect(deleteResponse.status).toBe(200);

      const getResponse = await request(BASE_URL).get(`/api/1/item/${itemId}`);

      expect(getResponse.status).toBe(404);
    });
  });

  describe("Negative Test Cases - Validation", () => {
    test("Валидация обязательного поля sellerID", async () => {
      const invalidData = { ...validItemData };
      delete invalidData.sellerID;

      const response = await request(BASE_URL)
        .post("/api/1/item")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("result");
      expect(response.body.result).toHaveProperty("message");
    });

    test("Валидация некорректного типа данных для sellerID", async () => {
      const invalidData = {
        ...validItemData,
        sellerID: "не число",
      };

      const response = await request(BASE_URL)
        .post("/api/1/item")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("result");
    });

    test("Валидация пустого поля name", async () => {
      const invalidData = {
        ...validItemData,
        name: "",
      };

      const response = await request(BASE_URL)
        .post("/api/1/item")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.result).toHaveProperty("message");
    });

    test("Валидация отсутствия объекта statistics", async () => {
      const invalidData = { ...validItemData };
      delete invalidData.statistics;

      const response = await request(BASE_URL)
        .post("/api/1/item")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.result).toHaveProperty("message");
    });

    test("Поиск несуществующего объявления по ID", async () => {
      const nonExistentId = "non-existent-id-12345";

      const response = await request(BASE_URL)
        .get(`/api/1/item/${nonExistentId}`)
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body.result).toHaveProperty("message");
    });

    test("Поиск статистики несуществующего объявления", async () => {
      const nonExistentId = "non-existent-id-12345";

      const response = await request(BASE_URL)
        .get(`/api/1/statistic/${nonExistentId}`)
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body.result).toHaveProperty("message");
    });

    test("Поиск объявлений по несуществующему sellerID", async () => {
      const nonExistentSellerId = "9999020230023janjdnjasndnsajndsajkn";

      const response = await request(BASE_URL)
        .get(`/api/1/${nonExistentSellerId}/item`)
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body.result).toHaveProperty("message");
    });

    test("Удаление несуществующего объявления", async () => {
      const nonExistentId = "non-existent-id-12345";

      const response = await request(BASE_URL)
        .delete(`/api/2/item/${nonExistentId}`)
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body.result).toHaveProperty("message");
    });
  });

  describe("Boundary Value Test Cases", () => {
    test("Граничные значения для price - ноль", async () => {
      const boundaryData = {
        ...validItemData,
        price: 0,
      };

      const response = await request(BASE_URL)
        .post("/api/1/item")
        .send(boundaryData);

      expect(response.status).toBe(400);
    });

    test("Граничные значения для statistics - нулевые значения", async () => {
      const boundaryData = {
        ...validItemData,
        statistics: {
          likes: 0,
          viewCount: 0,
          contacts: 0,
        },
      };

      const response = await request(BASE_URL)
        .post("/api/1/item")
        .send(boundaryData);

      expect([201, 400]).toContain(response.status);
    });
  });
});
