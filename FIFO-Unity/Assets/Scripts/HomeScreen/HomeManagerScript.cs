using System.Collections.Generic;
using UnityEngine;

// Takes the product data from DatabaseManagerScript and builds a list of product objects for inventory system
public class HomeManagerScript : MonoBehaviour
{
    [Header("References")]
    public DatabaseManagerScript databaseManager;

    [Header("Optional Parent For Runtime Product Objects")]
    public Transform contentParent;

    [Header("Runtime Product Items")]
    public List<ProductItemScript> productItems = new List<ProductItemScript>();

    private void Start()
    {
        if (databaseManager == null)
        {
            Debug.LogError("HomeManagerScript: DatabaseManagerScript reference is missing.");
            return;
        }

        StartCoroutine(databaseManager.GetProducts(OnProductsLoaded, OnProductsError));
    }

    private void OnProductsLoaded(List<DatabaseManagerScript.Product> products)
    {
        Debug.Log("HomeManagerScript: Products loaded successfully. Count = " + products.Count);
        BuildProductItemList(products);
    }

    private void OnProductsError(string error)
    {
        Debug.LogError("HomeManagerScript: Failed to load products. " + error);
    }

    private void BuildProductItemList(List<DatabaseManagerScript.Product> products)
    {
        ClearCurrentProductItems();

        foreach (DatabaseManagerScript.Product product in products)
        {
            GameObject productObject = new GameObject(product.name);

            if (contentParent != null)
            {
                productObject.transform.SetParent(contentParent, false);
            }

            ProductItemScript productItem = productObject.AddComponent<ProductItemScript>();

            productItem.SetProductData(
                product.id,
                product.addedAt,
                product.brand,
                product.category,
                product.expirationDate,
                product.imageUrl,
                product.name,
                product.updatedAt
            );

            productItems.Add(productItem);

            Debug.Log(productItem.ToString());
        }

        Debug.Log("HomeManagerScript: Total ProductItemScript objects created = " + productItems.Count);
    }

    private void ClearCurrentProductItems()
    {
        foreach (ProductItemScript item in productItems)
        {
            if (item != null)
            {
                Destroy(item.gameObject);
            }
        }

        productItems.Clear();
    }

    public void RefreshHomeProducts()
    {
        if (databaseManager == null)
        {
            Debug.LogError("HomeManagerScript: DatabaseManagerScript reference is missing.");
            return;
        }

        StartCoroutine(databaseManager.GetProducts(OnProductsLoaded, OnProductsError));
    }
}