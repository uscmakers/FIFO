using System.Collections.Generic;
using UnityEngine;
using System;
using System.Linq;
using TMPro;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

// Takes product data from DatabaseManagerScript and builds UI product prefabs
public class HomeManager : MonoBehaviour
{
    public static HomeManager instance;

    void Awake()
    {
        if (instance != null && instance != this)
        {
            Destroy(gameObject);
        }
        else
        {
            instance = this;
        }
    }

    [Header("References")]
    public DatabaseManagerScript databaseManager;
    public StreakManager streakManager;   // optional, if you want to update streak too

    [Header("UI")]
    public Transform contentParent;
    public GameObject productItemPrefab;
    public TextMeshProUGUI dateText;
    public TextMeshProUGUI usernameText;
    public TextMeshProUGUI itemCount;
    public Image avatarImage;
    public Sprite[] avatarSprites;

    [Header("Runtime Product Data")]
    public List<ProductItem> productItems = new List<ProductItem>();

    private void Start()
    {
        if (databaseManager == null)
        {
            Debug.LogError("HomeManager: DatabaseManagerScript reference is missing.");
            return;
        }

        if (contentParent == null)
        {
            Debug.LogError("HomeManager: contentParent reference is missing.");
            return;
        }

        if (productItemPrefab == null)
        {
            Debug.LogError("HomeManager: productItemPrefab reference is missing.");
            return;
        }

        RefreshHomeProducts();
        dateText.text = System.DateTime.Now.ToString("M/d");
        LoadUserProfile();
    }
    
    private void LoadUserProfile()
    {
        string username = PlayerPrefs.GetString("Username", "Player");
        int selectedAvatar = PlayerPrefs.GetInt("SelectedAvatar", -1);

        usernameText.text = username;

        if (selectedAvatar >= 0 && selectedAvatar < avatarSprites.Length)
        {
            avatarImage.sprite = avatarSprites[selectedAvatar];
            avatarImage.enabled = true;
        }
        else
        {
            avatarImage.enabled = false;
            Debug.LogWarning("No valid avatar selected.");
        }

        Debug.Log("Loaded username: " + username);
        Debug.Log("Loaded avatar index: " + selectedAvatar);
    }

    public void RefreshHomeProducts()
    {
        if (databaseManager == null)
        {
            Debug.LogError("HomeManager: DatabaseManagerScript reference is missing.");
            return;
        }

        StartCoroutine(databaseManager.GetProducts(OnProductsLoaded, OnProductsError));
    }

    private void OnProductsLoaded(List<DatabaseManagerScript.Product> products)
    {
        Debug.Log("HomeManager: Products loaded successfully. Count = " + products.Count);
        BuildProductItemList(products);
        itemCount.text = products.Count.ToString() + " items";
    }

    private void OnProductsError(string error)
    {
        Debug.LogError("HomeManager: Failed to load products. " + error);
    }

    private void BuildProductItemList(List<DatabaseManagerScript.Product> products)
    {
        productItems.Clear();

        // delete old UI rows
        foreach (Transform child in contentParent)
        {
            Destroy(child.gameObject);
        }

        // create fresh data objects + fresh UI rows
        for (int i = 0; i < products.Count; i++)
        {
            ProductItem productData = new ProductItem(products[i]);
            productItems.Add(productData);

            GameObject obj = Instantiate(productItemPrefab, contentParent);
            ProductItemUI productUI = obj.GetComponent<ProductItemUI>();

            if (productUI != null)
            {
                productUI.Setup(productData, i);
            }
            else
            {
                Debug.LogError("HomeManager: Prefab is missing ProductItemUI component.");
            }

            Debug.Log(productData.ToString());
        }

        // optional: update streak widget too
        if (streakManager != null)
        {
            streakManager.SetStreak(productItems);
        }

        Debug.Log("HomeManager: Total ProductItems created = " + productItems.Count);
    }

        /// <summary>
    /// Get the start and end indices of products expire within the range of dates of start and end.
    /// </summary>
    /// <param name="products">original list of products</param>
    /// <param name="start">start date (inclusive)</param>
    /// <param name="end">end date (innclusive)</param>
    /// <returns>Start and end indices of products that expire within the range of dates</returns>
    public static (int startIndex, int endIndex) GetDateRange(List<ProductItem> products, DateTime start, DateTime end)
    {
        if(end <= start) return (-1, -1);

        int startInd = -1;

        int low = 1;
        int high = products.Count() - 1;
        while(low <= high)
        {
            int mid = low + (high-low)/2;

            if(products[mid].expirationDate >= start && products[mid-1].expirationDate < start)
            {
                startInd = mid; 
                break;
            }
            else if(products[mid].expirationDate < start) low = mid + 1;
            else high = mid-1;
        }

        if(startInd == -1) {
            if(products[0].expirationDate >= start)
            {
                startInd = 0;
            }
            else return (-1, -1);
        }

        int endInd = products.Count();
        low = startInd;
        high = products.Count() - 1;
        
        while(low <= high)
        {
            int mid = low + (high-low)/2;

            if(products[mid].expirationDate <= end && (mid == products.Count()-1 || products[mid+1].expirationDate > end)) {
                endInd = mid;
                break;
            }
            else if(products[mid].expirationDate < end) low = mid + 1;
            else high = mid-1;
        }
        
        return (startInd, endInd);
    }

            /// <summary>
    /// Get the start and end indices of products expire within the range of dates of start and end.
    /// </summary>
    /// <param name="products">original list of products</param>
    /// <param name="start">start date (inclusive)</param>
    /// <param name="end">end date (innclusive)</param>
    /// <returns>Start and end indices of products that expire within the range of dates</returns>
    public (int startIndex, int endIndex) GetDateRange(DateTime start, DateTime end)
    {
        if(end <= start) return (-1, -1);

        int startInd = -1;

        int low = 1;
        int high = productItems.Count() - 1;
        while(low <= high)
        {
            int mid = low + (high-low)/2;

            if(productItems[mid].expirationDate >= start && productItems[mid-1].expirationDate < start)
            {
                startInd = mid; 
                break;
            }
            else if(productItems[mid].expirationDate < start) low = mid + 1;
            else high = mid-1;
        }

        if(startInd == -1) {
            if(productItems[0].expirationDate >= start)
            {
                startInd = 0;
            }
            else return (-1, -1);
        }

        int endInd = productItems.Count();
        low = startInd;
        high = productItems.Count() - 1;
        
        while(low <= high)
        {
            int mid = low + (high-low)/2;

            if(productItems[mid].expirationDate <= end && (mid == productItems.Count()-1 || productItems[mid+1].expirationDate > end)) {
                endInd = mid;
                break;
            }
            else if(productItems[mid].expirationDate < end) low = mid + 1;
            else high = mid-1;
        }
        
        return (startInd, endInd);
    }

    public void ToProfileScene()
    {
        SceneManager.LoadScene("StartScene");
    }
}