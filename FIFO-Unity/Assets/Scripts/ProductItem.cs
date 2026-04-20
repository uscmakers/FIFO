using System;
using UnityEngine;

// Stores data for a single Product
public class ProductItem
{
    public string id;
    public DateTime addedAt;
    public string brand;
    public string category;
    public DateTime expirationDate;
    public string imageUrl;
    public string productName;
    public DateTime updatedAt;

    public ProductItem(
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
        addedAt = DateTime.Parse(newAddedAt);
        brand = newBrand;
        category = newCategory;
        expirationDate = DateTime.Parse(newExpirationDate);
        imageUrl = newImageUrl;
        productName = newProductName;
        updatedAt = DateTime.Parse(newUpdatedAt);
    }

    public ProductItem(DatabaseManagerScript.Product product)
    {
        id = product.id;
        addedAt = DateTime.Parse(product.addedAt);
        brand = product.brand;
        category = product.category;
        expirationDate = DateTime.Parse(product.expirationDate);
        imageUrl = product.imageUrl;
        productName = product.name;
        updatedAt = DateTime.Parse(product.updatedAt);
    }

    public override string ToString()
    {
        return $"Product: {productName}, Brand: {brand}, Category: {category}, Expiration: {expirationDate}";
    }
}