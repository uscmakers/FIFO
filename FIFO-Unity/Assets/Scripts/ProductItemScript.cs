using UnityEngine;

// Stores data for a single Product
public class ProductItemScript : MonoBehaviour
{
    [Header("Product Data")]
    public string id;
    public string addedAt;
    public string brand;
    public string category;
    public string expirationDate;
    public string imageUrl;
    public string productName;
    public string updatedAt;

    public void SetProductData(
        string newId,
        string newAddedAt,
        string newBrand,
        string newCategory,
        string newExpirationDate,
        string newImageUrl,
        string newProductName,
        string newUpdatedAt
    )
    {
        id = newId;
        addedAt = newAddedAt;
        brand = newBrand;
        category = newCategory;
        expirationDate = newExpirationDate;
        imageUrl = newImageUrl;
        productName = newProductName;
        updatedAt = newUpdatedAt;
    }

    public override string ToString()
    {
        return $"Product: {productName}, Brand: {brand}, Category: {category}, Expiration: {expirationDate}";
    }
}