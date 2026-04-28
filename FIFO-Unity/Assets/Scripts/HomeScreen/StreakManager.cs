using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class StreakManager : MonoBehaviour
{
    [Header("Streak Text")]
    [SerializeField] private TMP_Text streakText;
    
    [SerializeField] GameObject dayPrefab;
    [SerializeField] Transform widgetContent;
    [SerializeField] ScrollRect scrollRect;
    [SerializeField] TextMeshProUGUI msgText;
    [SerializeField] TextMeshProUGUI bestStreakText;
    List<GameObject> dayStreak;
    int highestStreak;
    private readonly int DISPLAY_NUM = 20; // number of icons to store in dayStreak

    // the Status of the day determines what the icon will look like
    public enum Status
    {
        Successful, // this day has passed AND nothing expired on that day
        Unsuccessful, // this day has passed BUT something expired that day
        Today, // this day is today!
        ExpiresToday, // this day is today but something also expires today
        Empty, // this day is in the future AND nothing expires that day (OR this day is from before the user started using the app)
        Expires, // this day is in the future AND something expires that day
    }

    void Start()
    {
        dayStreak = new();
        highestStreak = 0;

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
                DateTime.Today.AddDays(4*i-12),
                "imgurl" + i,
                "name" + i,
                DateTime.Today
                ) 
            );
            }

        SetStreak(testProducts);
    }

    public void SetStreak(List<ProductItem> products)
    {
        ClearDays();

        DateTime today = DateTime.Today;

        // the number of days in the future to display
        // feel free to change but MUST be less than DISPLAY_NUM
        int daysFuture = 10;
        DateTime startRange = today.AddDays(-(DISPLAY_NUM-1-daysFuture)).Date;
        DateTime endRange = today.AddDays(1+daysFuture).Date;
        scrollRect.horizontalNormalizedPosition = daysFuture / (float) DISPLAY_NUM;

        products.Sort();

        //Debug.Log("looking for between " + startRange + " -> " + endRange);
        var (startIndex, endIndex) = HomeManager.GetDateRange(products, startRange, endRange);
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
                ifExpire = Status.ExpiresToday;
            }

            int nextExpiry = CheckExpireOnDay(products, dayInd, startIndex);
            //Debug.Log("startIndex: " + startIndex + " next: " + nextExpiry);
            if(nextExpiry > startIndex)
            {
                startIndex = nextExpiry;
                AddDay(ifExpire, dayInd);
            }
            else
            {
                AddDay(ifNotExpire, dayInd);
            }

            dayInd = dayInd.AddDays(1).Date;
        }
        int currentStreak = CalculateCurrentStreak(products);

        if (streakText != null)
        {
            streakText.text = currentStreak + " day streak!";
        }

        SetMessage(currentStreak);
        
        if(currentStreak > highestStreak)
        {
            highestStreak = currentStreak;
            SetBestStreak();
        }
    }

    private void SetMessage(int streak)
    {
        if(streak == 0)
        {
            msgText.text = "You can always try again :)";
        }
        else if (streak < 4)
        {
            msgText.text = "A good start!";
        }
        else if (streak <= 10)
        {
            msgText.text = "Good job!";
        }
        else
        {
            msgText.text = "You're on a roll!";
        }
    }

    private void SetBestStreak()
    {
        bestStreakText.text = "Best Streak: " + highestStreak;
    }

    private int CalculateCurrentStreak(List<ProductItem> products)
    {
        int streak = 0;
        DateTime day = DateTime.Today.AddDays(-1);

        while (true)
        {
            bool expiredOnThisDay = products.Any(
                p => p.expirationDate.Date == day.Date
            );

            if (expiredOnThisDay)
            {
                break;
            }

            streak++;
            day = day.AddDays(-1);
        }

        return streak;
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
    /// Adds a day of the inputted status to the stored dayStreak list. 
    /// Pops oldest element if dayStreak reaches over DISPLAY_NUM # of days.
    /// </summary>
    /// <param name="dayStatus">the status of the day being added</param>
    /// <returns>true if a day was popped, false otherwise</returns>
    public bool AddDay(Status dayStatus)
    {
        dayStreak.Add(ApplyStatus(Instantiate(dayPrefab, widgetContent), dayStatus, ""));

        if(dayStreak.Count > DISPLAY_NUM)
        {
            dayStreak.RemoveAt(0);
            return true;
        }
        return false;
    }
    
    // used for the MTWTFSS display on streak
    public bool AddDay(Status dayStatus, DateTime date)
    {
        string label = date.ToString("ddd")[0].ToString(); // M, T, W, etc.

        dayStreak.Add(
            ApplyStatus(
                Instantiate(dayPrefab, widgetContent),
                dayStatus,
                label
            )
        );

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

    // apply the appearance dictated by the status from StreakDaySystem script to the object
    private GameObject ApplyStatus(GameObject obj, Status status, string label)
    {
        StreakDayUI dayUI = obj.GetComponent<StreakDayUI>();

        if (dayUI != null)
        {
            dayUI.SetDay(label, status);
        }

        return obj;
    }

    // clear days function to clear old streak days once they're too old
    private void ClearDays()
    {
        foreach(GameObject day in dayStreak)
        {
            Destroy(day);
        }

        dayStreak.Clear();
    }
}
