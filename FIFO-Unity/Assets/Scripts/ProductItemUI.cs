using System;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class ProductItemUI : MonoBehaviour
{
    public TMP_Text nameText;
    public TMP_Text daysLeftText;
    public Image backgroundImage;

    public Color pinkRowColor = new Color(0.969f, 0.898f, 0.953f, 1f);
    public Color whiteRowColor = Color.white;

    public void Setup(ProductItem product, int index)
    {
        nameText.text = product.productName;

        int daysLeft = (product.expirationDate.Date - DateTime.Today).Days;

        if (daysLeft < 0)
        {
            int daysExpired = Math.Abs(daysLeft);

            if (daysExpired == 1)
                daysLeftText.text = "<b>1 day expired</b>";
            else
                daysLeftText.text = $"<b>{daysExpired} days expired</b>";
        }
        else if (daysLeft == 0)
        {
            daysLeftText.text = "Expires today";
        }
        else if (daysLeft == 1)
        {
            daysLeftText.text = "1 day left";
        }
        else
        {
            daysLeftText.text = daysLeft + " days left";
        }

        if (backgroundImage != null)
        {
            backgroundImage.color = (index % 2 == 0) ? pinkRowColor : whiteRowColor;
        }
        // testing productitem spawning scrolling list
        Debug.Log("Setting up product: " + product.productName + " at index " + index);
        Debug.Log("Background image assigned? " + (backgroundImage != null));
        
        Debug.Log("Name text assigned? " + (nameText != null));
        Debug.Log("Days text assigned? " + (daysLeftText != null));
    }
}