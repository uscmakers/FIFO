using UnityEngine;
using UnityEngine.UI;
using TMPro;

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

    public void SetDay(string dayLabel, StreakManager.Status state)
    {
        dayText.text = dayLabel;

        icon.enabled = true;

        switch (state)
        {
            case StreakManager.Status.Successful:
                circle.sprite = darkPinkCircle;
                icon.sprite = checkIcon;
                break;

            case StreakManager.Status.Unsuccessful:
                circle.sprite = darkPinkCircle;
                icon.sprite = xIcon;
                break;

            case StreakManager.Status.Today:
                circle.sprite = lightPinkCircle;
                icon.enabled = false;
                break;

            case StreakManager.Status.Empty:
                circle.sprite = lightPinkCircle;
                icon.enabled = false;
                break;

            case StreakManager.Status.Expires:
                circle.sprite = lightPinkCircle;
                icon.sprite = exclamationIcon;
                break;
        }
    }
}