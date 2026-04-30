using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

// Handles all communication with Flask API (gets, adds, updates, deletes product data from the actual database)
public class DatabaseManagerScript : MonoBehaviour
{
    [Header("Flask API Settings")]
    public string baseUrl = "http://127.0.0.1:5000";
    public string userId = "E6ALiBsNBrRY5Nj0xQehB19kooH3";

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
    public class ProductResponse
    {
        public bool success;
        public Product product;
        public string message;
        public string error;
    }

    [Serializable]
    public class ApiMessageResponse
    {
        public bool success;
        public string message;
        public string productId;
        public string userId;
        public string error;
    }

    public IEnumerator GetProducts(Action<List<Product>> onSuccess, Action<string> onError = null)
    {
        string url = $"{baseUrl}/api/users/{userId}/products";
        using UnityWebRequest request = UnityWebRequest.Get(url);

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            string errorMessage = "GET failed: " + request.error;
            Debug.LogError(errorMessage);
            onError?.Invoke(errorMessage);
            yield break;
        }

        string json = request.downloadHandler.text;
        Debug.Log("GET response: " + json);

        ProductListResponse response = JsonUtility.FromJson<ProductListResponse>(json);

        if (response != null && response.products != null)
        {
            onSuccess?.Invoke(response.products);
        }
        else
        {
            string errorMessage = "Failed to parse products or no products found.";
            Debug.LogWarning(errorMessage);
            onError?.Invoke(errorMessage);
        }
    }

    public IEnumerator AddProduct(Product product, Action onSuccess = null, Action<string> onError = null)
    {
        string url = $"{baseUrl}/api/users/{userId}/products/{product.id}";

        string json = JsonUtility.ToJson(product);
        byte[] jsonToSend = Encoding.UTF8.GetBytes(json);

        using UnityWebRequest request = new UnityWebRequest(url, "POST");
        request.uploadHandler = new UploadHandlerRaw(jsonToSend);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            string errorMessage = "POST failed: " + request.error;
            Debug.LogError(errorMessage);
            Debug.LogError("Response: " + request.downloadHandler.text);
            onError?.Invoke(errorMessage);
            yield break;
        }

        Debug.Log("POST response: " + request.downloadHandler.text);
        onSuccess?.Invoke();
    }

    public IEnumerator UpdateProduct(Product product, Action onSuccess = null, Action<string> onError = null)
    {
        string url = $"{baseUrl}/api/users/{userId}/products/{product.id}";

        string json = JsonUtility.ToJson(product);
        byte[] jsonToSend = Encoding.UTF8.GetBytes(json);

        using UnityWebRequest request = new UnityWebRequest(url, "PUT");
        request.uploadHandler = new UploadHandlerRaw(jsonToSend);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            string errorMessage = "PUT failed: " + request.error;
            Debug.LogError(errorMessage);
            Debug.LogError("Response: " + request.downloadHandler.text);
            onError?.Invoke(errorMessage);
            yield break;
        }

        Debug.Log("PUT response: " + request.downloadHandler.text);
        onSuccess?.Invoke();
    }

    public IEnumerator DeleteProduct(string productId, Action onSuccess = null, Action<string> onError = null)
    {
        string url = $"{baseUrl}/api/users/{userId}/products/{productId}";
        using UnityWebRequest request = UnityWebRequest.Delete(url);

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            string errorMessage = "DELETE failed: " + request.error;
            Debug.LogError(errorMessage);
            Debug.LogError("Response: " + request.downloadHandler.text);
            onError?.Invoke(errorMessage);
            yield break;
        }

        Debug.Log("DELETE response: " + request.downloadHandler.text);
        onSuccess?.Invoke();
    }
}