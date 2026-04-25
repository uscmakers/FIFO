using UnityEngine;
using UnityEngine.UI;
using TMPro;

public enum StreakDayState
{
    Successful,
    Unsuccessful,
    Today,
    Empty,
    Expires
}

public class StreakDayUI : MonoBehaviour
{
    [Header("UI")]
    public Image circle;
    public Image icon;
    public TMP_Text dayText;

    [Header("Circle Sprites")]
    public Sprite darkPinkCircle;
    public Sprite lightPinkCircle;

    [Header("Icon Sprites")]
    public Sprite checkIcon;
    public Sprite xIcon;
    public Sprite exclamationIcon;

    public void SetDay(string dayLabel, StreakDayState state)
    {
        dayText.text = dayLabel;

        icon.enabled = true;

        switch (state)
        {
            case StreakDayState.Successful:
                circle.sprite = darkPinkCircle;
                icon.sprite = checkIcon;
                break;

            case StreakDayState.Unsuccessful:
                circle.sprite = darkPinkCircle;
                icon.sprite = xIcon;
                break;

            case StreakDayState.Today:
                circle.sprite = lightPinkCircle;
                icon.enabled = false;
                break;

            case StreakDayState.Empty:
                circle.sprite = lightPinkCircle;
                icon.enabled = false;
                break;

            case StreakDayState.Expires:
                circle.sprite = lightPinkCircle;
                icon.sprite = exclamationIcon;
                break;
        }
    }
}