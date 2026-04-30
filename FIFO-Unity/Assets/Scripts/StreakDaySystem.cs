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
    public Sprite greyOutline;
    public Sprite darkPinkOutline;
    public Sprite lightPinkOutline;

    [Header("Icon Sprites")]
    public Sprite checkIcon;
    public Sprite xIcon;
    public Sprite greyExclamationIcon;
    public Sprite pinkExclamationIcon;
    
    [Header("Icon Sizes")]
    public Vector2 normalIconSize = new Vector2(80, 80);
    public Vector2 exclamationIconSize = new Vector2(35, 70);

    public void SetDay(string dayLabel, StreakManager.Status state)
    {
        dayText.text = dayLabel;

        icon.enabled = true;

        switch (state)
        {
            case StreakManager.Status.Successful:
                circle.sprite = lightPinkCircle;
                icon.enabled = true;
                icon.sprite = checkIcon;
                icon.rectTransform.sizeDelta = normalIconSize;
                break;

            case StreakManager.Status.Unsuccessful:
                circle.sprite = darkPinkCircle;
                icon.enabled = true;
                icon.sprite = xIcon;
                icon.rectTransform.sizeDelta = normalIconSize;
                break;

            case StreakManager.Status.Today:
                circle.sprite = greyOutline;
                icon.enabled = false;
                break;

            case StreakManager.Status.ExpiresToday:
                circle.sprite = greyOutline;
                icon.enabled = true;
                icon.sprite = greyExclamationIcon;
                break;

            case StreakManager.Status.Empty:
                circle.sprite = lightPinkOutline;
                icon.enabled = false;
                break;

            case StreakManager.Status.Expires:
                circle.sprite = darkPinkOutline;
                icon.enabled = true;
                icon.sprite = pinkExclamationIcon;
                //icon.rectTransform.sizeDelta = exclamationIconSize;
                break;
        }
    }
}