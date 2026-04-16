using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

public class FlaskApiManager : MonoBehaviour
{
    [Header("Flask API Base URL")]
    public string baseUrl = "http://127.0.0.1:5000";

    [Header("Test User ID")]
    public string userId = "testUser123";

    [Serializable]
    public class Product
    {
        public string id;
        public string addedAt;
        public string brand;
        public string category;
        public string expirationDate;
        public string imageUrl;
        public string name;
        public string updatedAt;
    }

    [Serializable]
    public class ProductListResponse
    {
        public bool success;
        public string userId;
        public List<Product> products;
    }

    [Serializable]
    public class ProductRequest
    {
        public string name;
        public string brand;
        public string category;
        public string expirationDate;
        public string imageUrl;
    }

    private void Start()
    {
        StartCoroutine(GetProducts(userId));
    }

    public IEnumerator GetProducts(string uid)
    {
        string url = $"{baseUrl}/api/users/{uid}/products";
        using UnityWebRequest request = UnityWebRequest.Get(url);

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError("GET failed: " + request.error);
            Debug.LogError("Response: " + request.downloadHandler.text);
            yield break;
        }

        string json = request.downloadHandler.text;
        Debug.Log("GET response: " + json);

        ProductListResponse response = JsonUtility.FromJson<ProductListResponse>(json);

        if (response != null && response.products != null)
        {
            foreach (Product p in response.products)
            {
                Debug.Log($"Product: {p.name}, Brand: {p.brand}, Exp: {p.expirationDate}");
            }
        }
        else
        {
            Debug.LogWarning("No products found or JSON format mismatch.");
        }
    }

    public IEnumerator AddProduct(string uid, Product product)
    {
        if (string.IsNullOrEmpty(product.id))
        {
            product.id = Guid.NewGuid().ToString();
        }

        string url = $"{baseUrl}/api/users/{uid}/products/{product.id}";

        ProductRequest body = new ProductRequest
        {
            name = product.name,
            brand = product.brand,
            category = product.category,
            expirationDate = product.expirationDate,
            imageUrl = product.imageUrl
        };

        string json = JsonUtility.ToJson(body);
        byte[] jsonToSend = Encoding.UTF8.GetBytes(json);

        using UnityWebRequest request = new UnityWebRequest(url, "POST");
        request.uploadHandler = new UploadHandlerRaw(jsonToSend);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError("POST failed: " + request.error);
            Debug.LogError("Response: " + request.downloadHandler.text);
            yield break;
        }

        Debug.Log("POST response: " + request.downloadHandler.text);
    }

    public IEnumerator DeleteProduct(string uid, string productId)
    {
        string url = $"{baseUrl}/api/users/{uid}/products/{productId}";
        using UnityWebRequest request = UnityWebRequest.Delete(url);

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError("DELETE failed: " + request.error);
            Debug.LogError("Response: " + request.downloadHandler.text);
            yield break;
        }

        Debug.Log("DELETE response: " + request.downloadHandler.text);
    }
}