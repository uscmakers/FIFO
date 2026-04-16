using System.Collections.Generic;
using UnityEngine;

public class StreakManager : MonoBehaviour
{
    [SerializeField] GameObject dayPrefab;
    [SerializeField] Transform widgetContent;
    List<GameObject> dayStreak;
    private readonly int DISPLAY_NUM = 7; // number of icons to store in dayStreak

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
        // fill dayStreak with DISPLAY_NUM # objects initially
        for(int i=0;i<DISPLAY_NUM;i++)
        {
            AddDay(Status.Empty);
        }
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

    // apply the appearance dictated by the status to the object
    private GameObject ApplyStatus(GameObject obj, Status status)
    {
        // TODO complete function

        switch(status)
        {
            case Status.Successful:
                break;
            case Status.Unsuccessful:
                break;
            case Status.Today:
                break;
            case Status.Empty:
                break;
            case Status.Expires:
                break;
        }

        return obj;
    }
}
