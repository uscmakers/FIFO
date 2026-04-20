using System.Collections.Generic;
using UnityEngine;

// Takes the product data from DatabaseManagerScript and builds a list of product objects for inventory system
public class HomeManager : MonoBehaviour
{
    // make into Singleton
    public HomeManager instance;

    void Awake()
    {
        if(instance != null && instance != this) Destroy(instance);
        else instance = this;
    }

    [Header("References")]
    public DatabaseManagerScript databaseManager;

    [Header("Optional Parent For Runtime Product Objects")]
    public Transform contentParent;

    [Header("Runtime Product Items")]
    public List<ProductItem> productItems = new List<ProductItem>();

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
        productItems.Clear();

        foreach (DatabaseManagerScript.Product product in products)
        {
            
            ProductItem productItem = new ProductItem(product);
            productItems.Add(productItem);

            Debug.Log(productItem.ToString());
        }

        Debug.Log("HomeManagerScript: Total ProductItemScript objects created = " + productItems.Count);
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