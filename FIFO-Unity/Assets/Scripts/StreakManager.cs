using System.Collections.Generic;
using UnityEngine;

public class StreakManager : MonoBehaviour
{
    [SerializeField] GameObject dayPrefab;
    List<GameObject> dayStreak;

    // the Status of the day determines what the icon will look like
    public enum Status
    {
        Successful, // this day has passed AND nothing expired on that day
        Unsuccessful, // this day has passed BUT something expired that day
        Today, // this day is today!
        Empty, // this day is in the future AND nothing expires that day
        Expires, // this day is in the future AND something expires that day
    }

    
}
