using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.UI;

public class StreakManager : MonoBehaviour
{
    [SerializeField] GameObject dayPrefab;
    [SerializeField] Transform widgetContent;
    List<GameObject> dayStreak;
    private readonly int DISPLAY_NUM = 20; // number of icons to store in dayStreak

    // the Status of the day determines what the icon will look like
    public enum Status
    {
        Successful, // this day has passed AND nothing expired on that day
        Unsuccessful, // this day has passed BUT something expired that day
        Today, // this day is today!
        Empty, // this day is in the future AND nothing expires that day (OR this day is from before the user started using the app)
        Expires, // this day is in the future AND something expires that day
    }

    void Start()
    {
        dayStreak = new();

        AddDay(Status.Empty, DISPLAY_NUM);

        List<ProductItem> testProducts = new();
        for(int i=0; i<20; i++)
        {
            testProducts.Add( 
                new ProductItem(
                "itemid" + i,
                DateTime.Today,
                "brand" + i,
                "category" + i,
                DateTime.Today.AddDays(i-10),
                "imgurl" + i,
                "name" + i,
                DateTime.Today
                ) 
            );

            //Debug.Log(2*i-30 + " days off");
        }

        SetStreak(testProducts);
    }

    public void SetStreak(List<ProductItem> products)
    {
        ClearDays();

        DateTime today = DateTime.Today;

        // the number of days in the future to display
        // feel free to change but MUST be less than DISPLAY_NUM
        int daysFuture = 3;
        DateTime startRange = today.AddDays(-(DISPLAY_NUM-1-daysFuture)).Date;
        DateTime endRange = today.AddDays(1+daysFuture).Date;

        products.Sort();

        //Debug.Log("looking for between " + startRange + " -> " + endRange);
        var (startIndex, endIndex) = GetDateRange(products, startRange, endRange);
        //Debug.Log("start: " + startIndex + "\nend: " + endIndex);

        DateTime dayInd = startRange.Date;
        while(dayInd < endRange)
        {   
            /**
            Debug.Log("checking " + dayInd);
            if(startIndex >= products.Count) Debug.Log("no more expiry");
            else Debug.Log("next: " + products[startIndex].expirationDate);
            */

            Status ifExpire = Status.Expires;
            Status ifNotExpire = Status.Empty;

            if(dayInd < today.Date)
            {
                ifExpire = Status.Unsuccessful;
                ifNotExpire = Status.Successful;
            }
            else if(dayInd == today.Date)
            {
                ifNotExpire = Status.Today;
            }

            int nextExpiry = CheckExpireOnDay(products, dayInd, startIndex);
            //Debug.Log("startIndex: " + startIndex + " next: " + nextExpiry);
            if(nextExpiry > startIndex)
            {
                startIndex = nextExpiry;
                AddDay(ifExpire);
            }
            else
            {
                AddDay(ifNotExpire);
            }

            dayInd = dayInd.AddDays(1).Date;
        }
    }

    private int CheckExpireOnDay(List<ProductItem> products, DateTime targetDay, int index)
    {
        while (index < products.Count() && targetDay.Date > products[index].expirationDate)
        {
            index++;
        }
        return index;
    }

    /// <summary>
    /// Get the start and end indices of products expire within the range of dates of start and end.
    /// </summary>
    /// <param name="products">original list of products</param>
    /// <param name="start">start date (inclusive)</param>
    /// <param name="end">end date (innclusive)</param>
    /// <returns>Start and end indices of products that expire within the range of dates</returns>
    public (int startIndex, int endIndex) GetDateRange(List<ProductItem> products, DateTime start, DateTime end)
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
    /// Adds a day of the inputted status to the stored dayStreak list. 
    /// Pops oldest element if dayStreak reaches over DISPLAY_NUM # of days.
    /// </summary>
    /// <param name="dayStatus">the status of the day being added</param>
    /// <returns>true if a day was popped, false otherwise</returns>
    public bool AddDay(Status dayStatus)
    {
        dayStreak.Add(ApplyStatus(Instantiate(dayPrefab, widgetContent), dayStatus));

        if(dayStreak.Count > DISPLAY_NUM)
        {
            dayStreak.RemoveAt(0);
            return true;
        }
        return false;
    }

    /// <summary>
    /// Adds numDays # of days of the inputted status to the stored dayStreak list. 
    /// Pops oldest element(s) if dayStreak reaches over DISPLAY_NUM # of days.
    /// </summary>
    /// <param name="dayStatus">the status of the days being added</param>
    /// <param name="numDays">number of days to add</param>
    /// <returns>true if any days were popped, false otherwise</returns>
    public bool AddDay(Status dayStatus, int numDays)
    {
        bool poppedItem = false;

        for(int i=0;i<numDays;i++)
        {
            if(AddDay(dayStatus)) poppedItem = true;
        }

        return poppedItem;
    }

    // apply the appearance dictated by the status to the object
    private GameObject ApplyStatus(GameObject obj, Status status)
    {
        // TODO complete function

        switch(status)
        {
            case Status.Successful:
                obj.GetComponent<UnityEngine.UI.Image>().color = Color.yellow;
                break;
            case Status.Unsuccessful:
                obj.GetComponent<UnityEngine.UI.Image>().color = Color.red;
                break;
            case Status.Today:
                obj.GetComponent<UnityEngine.UI.Image>().color = Color.green;
                break;
            case Status.Empty:
                obj.GetComponent<UnityEngine.UI.Image>().color = Color.grey;
                break;
            case Status.Expires:
                obj.GetComponent<UnityEngine.UI.Image>().color = Color.blue;
                break;
        }

        return obj;
    }

    private void ClearDays()
    {
        foreach(GameObject day in dayStreak)
        {
            Destroy(day);
        }
    }
}
