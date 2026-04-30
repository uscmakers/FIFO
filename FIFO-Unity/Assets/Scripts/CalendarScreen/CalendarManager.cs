using System;
using System.Collections.Generic;
using UnityEngine;

public class CalendarManager : MonoBehaviour
{
    [SerializeField] GameObject dayOfWeekPrefab;
    [SerializeField] GameObject calendarPrefab;
    [SerializeField] Transform weekContent;
    [SerializeField] Transform gridContent;


    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        for(int i=0;i<7;i++)
        {
            Instantiate(dayOfWeekPrefab, weekContent).GetComponent<CalendarItem>().SetDayOfWeek(i);
        }

        DateTime firstDayOfMonth = DateTime.Today.AddDays(-1*DateTime.Today.Day + 1);
        Debug.Log(firstDayOfMonth);

        int leadingSquares = (int) firstDayOfMonth.DayOfWeek;
        for(int i=0;i<leadingSquares;i++)
        {
            Instantiate(calendarPrefab, gridContent).GetComponent<CalendarItem>().BlackOut();
        }

        for(int i=0;i<30;i++)
        {
            Instantiate(calendarPrefab, gridContent).GetComponent<CalendarItem>().SetValues(i+1);
        }


    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
