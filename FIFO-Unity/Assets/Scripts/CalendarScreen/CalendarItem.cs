using System.Collections.Generic;
using TMPro;
using Unity.VisualScripting;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Video;

[RequireComponent(typeof(Image))]
public class CalendarItem : MonoBehaviour
{
    [SerializeField] TextMeshProUGUI day;
    [SerializeField] TextMeshProUGUI itemText;

    public void SetValues(int dayOfMonth)
    {
        day.text = "" + dayOfMonth;
        itemText.text = "";
    }

    public void SetValues(int dayOfMonth, ProductItem itemInfo)
    {
        day.text = "" + dayOfMonth;
        itemText.text = itemInfo.productName;
    }

    public void SetValues(int dayOfMonth, List<ProductItem> itemInfo)
    {
        day.text = "" + dayOfMonth;

        string itemInfoText = "";
        foreach(ProductItem item in itemInfo)
        {
            itemInfoText += item.productName + "\n";
        }

        itemText.text = itemInfoText;
    }

    public void BlackOut()
    {
        day.text = "";
        itemText.text = "";
        GetComponent<Image>().color = new Color(0,0,0,0);
    }

    public void SetDayOfWeek(int n)
    {
        string[] weekdays =
        {
            "Sun", 
            "Mon", 
            "Tue", 
            "Wed", 
            "Thu", 
            "Fri", 
            "Sat"
        };

        day.text = weekdays[n];
    }
}
