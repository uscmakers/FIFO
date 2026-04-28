using System.Collections.Generic;
using UnityEngine;
using TMPro;
using UnityEngine.UI;

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
}